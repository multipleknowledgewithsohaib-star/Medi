const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configuration
const DATA_DIR = path.join(__dirname, '../data-recovery');
const APPLY_CHANGES = process.argv.includes('--apply');

/**
 * Robust JSON loader
 */
function loadJSON(filename, fallback = []) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`\u26a0\ufe0f Warning: File not found: ${filename}`);
        return fallback;
    }
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content || content.trim() === "") return fallback;
        return JSON.parse(content);
    } catch (e) {
        console.error(`\u274c Error parsing ${filename}:`, e.message);
        return fallback;
    }
}

/**
 * Helper to safely parse dates
 */
const parseSafeDate = (dateStr, fallback = new Date()) => {
    if (!dateStr) return fallback;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? fallback : d;
};

async function main() {
    console.log('\ud83d\ude80 MediStock Browser Data Deep-Merge Tool (Second Pass)');
    console.log('======================================================');
    console.log(`Mode: ${APPLY_CHANGES ? '\ud83d\ude80 APPLY (Writing to DB)' : '\ud83d\udd0d DRY-RUN (Simulation only)'}`);
    console.log(`Source Directory: ${DATA_DIR}\n`);

    // 1. Data Loading
    process.stdout.write('\ud83d\udce6 Loading JSON files...');
    const productsJson = loadJSON('products.json');
    const suppliersJson = loadJSON('suppliers.json');
    const purchasesJson = loadJSON('purchases.json');
    const batchesJson = loadJSON('batches.json');
    const branchesJson = loadJSON('branches.json');
    const activeBranchJson = loadJSON('activeBranch.json', null);
    console.log(' DONE');

    // 2. DISCOVERY PHASE (Finding missing products & suppliers in purchases)
    console.log('\ud83d\udd0d Discovery Phase...');
    const discovery = {
        products: new Map(), // name -> { itemCode, id }
        suppliers: new Map(), // name -> { id, phone, address }
    };

    // Scan suppliers.json first
    for (const s of suppliersJson) {
        discovery.suppliers.set(s.name.trim().toUpperCase(), { id: s.id, phone: s.phone, address: s.address });
    }

    // Scan products.json first
    for (const p of productsJson) {
        const name = p.name.trim().toUpperCase();
        const code = p.item_code || p.itemCode;
        discovery.products.set(name, { code, id: p.id });
        if (code) discovery.products.set(String(code).toUpperCase(), { name: p.name, id: p.id });
    }

    // Scan purchases.json for NEW products and suppliers
    let newlyDiscoveredProducts = 0;
    let newlyDiscoveredSuppliers = 0;

    for (const pur of purchasesJson) {
        // Discover Suppliers
        if (pur.supplier?.name) {
            const sName = pur.supplier.name.trim().toUpperCase();
            if (!discovery.suppliers.has(sName)) {
                discovery.suppliers.set(sName, {
                    id: pur.supplierId || `DISC-${Date.now()}-${newlyDiscoveredSuppliers}`,
                    phone: pur.supplier.phone || '',
                    address: pur.supplier.address || ''
                });
                newlyDiscoveredSuppliers++;
            }
        }

        // Discover Products from items
        if (pur.items && Array.isArray(pur.items)) {
            for (const item of pur.items) {
                const iName = item.name.trim().toUpperCase();
                const iCode = item.itemCode || item.item_code;

                // If product is not in discovery map by name or code
                if (!discovery.products.has(iName) && (!iCode || !discovery.products.has(String(iCode).toUpperCase()))) {
                    discovery.products.set(iName, { code: iCode, browserId: item.productId });
                    if (iCode) discovery.products.set(String(iCode).toUpperCase(), { name: item.name, browserId: item.productId });
                    newlyDiscoveredProducts++;
                }
            }
        }
    }

    console.log(`   - Total Products in map:  ${discovery.products.size} (+${newlyDiscoveredProducts} discovered)`);
    console.log(`   - Total Suppliers in map: ${discovery.suppliers.size} (+${newlyDiscoveredSuppliers} discovered)`);
    console.log(`   - Purchases to process:   ${purchasesJson.length}`);
    console.log(`   - Batches to process:     ${batchesJson.length}\n`);

    const supplierMap = new Map(); // name/id -> dbID
    const productMap = new Map(); // code/name/id -> dbID
    const batchMap = new Map(); // browserID or (batchNo+productId) -> dbID
    const branchMap = new Map();

    let stats = {
        branches: 0,
        products: 0,
        suppliers: 0,
        purchases: 0,
        purchaseItems: 0,
        batches: 0,
        skipped: 0,
        errors: 0
    };

    try {
        // 3. Sync Branches
        console.log('\ud83c\udfd7\ufe0f Syncing Branches...');
        let defaultBranchId = 1;
        if (APPLY_CHANGES) {
            const b = await prisma.branch.findFirst() || await prisma.branch.create({ data: { name: 'Main Branch', location: 'Default', type: 'Pharmacy' } });
            defaultBranchId = b.id;
            branchMap.set('all', defaultBranchId);
            stats.branches++;
        }

        // 4. Sync Suppliers
        console.log('\ud83c\udfe2 Syncing Suppliers...');
        for (const [sName, sData] of discovery.suppliers) {
            if (APPLY_CHANGES) {
                const supplier = await prisma.supplier.findFirst({ where: { name: sName } }) ||
                    await prisma.supplier.create({
                        data: {
                            name: sName,
                            phone: (sData.phone === 'OCR-EXTRACTED' || !sData.phone) ? '' : sData.phone,
                            address: sData.address || ''
                        }
                    });
                supplierMap.set(sName, supplier.id);
                if (sData.id) supplierMap.set(String(sData.id), supplier.id);
                stats.suppliers++;
            } else {
                stats.suppliers++;
            }
        }

        // 5. Sync Products (including discovery)
        console.log('\ud83d\udc8a Syncing Products...');
        for (const [key, pData] of discovery.products) {
            // discovery map has duplicate keys (name and code), only process each browserId or unique pair once
            if (!pData.code && !pData.browserId) continue;

            const name = pData.name || key;
            const code = pData.code || key;

            if (APPLY_CHANGES) {
                const existing = await prisma.product.findUnique({ where: { item_code: String(code) } }) ||
                    await prisma.product.findFirst({ where: { name: name } });

                let product;
                if (existing) {
                    product = existing;
                } else {
                    product = await prisma.product.create({
                        data: {
                            item_code: String(code),
                            name: name,
                            brand: 'Unknown Brand',
                            category: 'Medicine', // Default as requested/implied
                            purchasePrice: 0,
                            salePrice: 0,
                            stock: 0,
                            unitsPerPack: 1
                        }
                    });
                }
                productMap.set(name.toUpperCase(), product.id);
                productMap.set(String(code).toUpperCase(), product.id);
                if (pData.id) productMap.set(String(pData.id), product.id);
                if (pData.browserId) productMap.set(String(pData.browserId), product.id);
                stats.products++;
            } else {
                stats.products++;
            }
        }

        // 6. Import Batches
        console.log('\ud83d\udce6 Processing Batches...');
        for (const b of batchesJson) {
            const dbProductId = productMap.get(String(b.productId)) || productMap.get(String(b.productName)?.toUpperCase());
            if (!dbProductId) { stats.skipped++; continue; }

            const branchId = defaultBranchId;
            const sName = b.supplier?.name?.trim().toUpperCase();
            const dbSupplierId = supplierMap.get(sName) || supplierMap.get(String(b.supplierId));

            if (APPLY_CHANGES) {
                const expiryDate = parseSafeDate(b.expiryDate);
                const batch = await prisma.batch.findFirst({
                    where: { batchNo: b.batchNo || 'UNKNOWN', productId: dbProductId, expiryDate: expiryDate }
                }) || await prisma.batch.create({
                    data: {
                        batchNo: b.batchNo || 'UNKNOWN',
                        expiryDate: expiryDate,
                        quantity: parseInt(b.quantity || 0),
                        productId: dbProductId,
                        branchId: branchId,
                        supplierId: dbSupplierId,
                        purchasePrice: parseFloat(b.purchasePrice || b.rate || 0)
                    }
                });
                batchMap.set(String(b.id), batch.id);
                batchMap.set(`${b.batchNo}-${dbProductId}`, batch.id);
                stats.batches++;
            } else {
                stats.batches++;
            }
        }

        // 7. Import Purchases
        console.log('\ud83d\uded2 Processing Purchases...');
        const processedInvoices = new Set();
        for (const pur of purchasesJson) {
            if (!pur.invoiceNo) continue;

            if (APPLY_CHANGES) {
                const sName = pur.supplier?.name?.trim().toUpperCase();
                const dbSupplierId = supplierMap.get(sName) || supplierMap.get(String(pur.supplierId));

                const purchase = await prisma.purchase.upsert({
                    where: { invoiceNo: pur.invoiceNo },
                    create: {
                        invoiceNo: pur.invoiceNo,
                        date: parseSafeDate(pur.date),
                        total: parseFloat(pur.total || 0),
                        supplierId: dbSupplierId || 1, // Fallback to first if still missing
                        branchId: defaultBranchId
                    },
                    update: {}
                });

                stats.purchases++;

                if (pur.items && Array.isArray(pur.items)) {
                    for (const item of pur.items) {
                        const iName = item.name?.toUpperCase();
                        const iCode = (item.itemCode || item.item_code)?.toUpperCase();
                        const dbProductId = productMap.get(String(item.productId)) || productMap.get(iName) || productMap.get(iCode);

                        if (!dbProductId) continue;

                        let dbBatchId = batchMap.get(String(item.batchId)) || batchMap.get(`${item.batchNo}-${dbProductId}`);

                        if (!dbBatchId) {
                            const expDate = parseSafeDate(item.expiryDate);
                            const batch = await prisma.batch.findFirst({
                                where: { batchNo: item.batchNo || 'UNKNOWN', productId: dbProductId, expiryDate: expDate }
                            }) || await prisma.batch.create({
                                data: {
                                    batchNo: item.batchNo || 'UNKNOWN',
                                    expiryDate: expDate,
                                    quantity: parseInt(item.totalQty || item.quantity || 0),
                                    productId: dbProductId,
                                    branchId: defaultBranchId,
                                    supplierId: dbSupplierId,
                                    purchasePrice: parseFloat(item.purchasePrice || item.price || 0)
                                }
                            });
                            dbBatchId = batch.id;
                            stats.batches++;
                        }

                        const existingItem = await prisma.purchaseItem.findFirst({
                            where: { purchaseId: purchase.id, productId: dbProductId, batchId: dbBatchId }
                        });

                        if (!existingItem) {
                            await prisma.purchaseItem.create({
                                data: {
                                    purchaseId: purchase.id,
                                    productId: dbProductId,
                                    batchId: dbBatchId,
                                    quantity: parseInt(item.quantity || item.purchQty || 0),
                                    bonusQty: parseInt(item.bonusQty || 0),
                                    price: parseFloat(item.price || item.purchasePrice || 0),
                                    netAmount: parseFloat(item.netAmount || 0),
                                    effectiveCost: parseFloat(item.effectiveCost || item.price || 0),
                                    batchNo: item.batchNo,
                                    expiryDate: item.expiryDate
                                }
                            });
                            stats.purchaseItems++;
                        }
                    }
                }
            } else {
                stats.purchases++;
            }
        }

        // 8. Final Recalculation
        if (APPLY_CHANGES) {
            console.log('\ud83d\udd04 Recalculating all stock levels...');
            const allProducts = await prisma.product.findMany({ include: { batches: true } });
            for (const prod of allProducts) {
                const totalStock = prod.batches.reduce((sum, b) => sum + (b.quantity || 0), 0);
                if (prod.stock !== totalStock) {
                    await prisma.product.update({ where: { id: prod.id }, data: { stock: totalStock } });
                }
            }
        }

        console.log('\n\u2705 Deep Merge completed successfully!');
        console.log('------------------------------------');
        console.log(`Products Processed:  ${stats.products}`);
        console.log(`Suppliers Processed: ${stats.suppliers}`);
        console.log(`Purchases Merged:    ${stats.purchases}`);
        console.log(`Batches Merged:      ${stats.batches}`);
        console.log(`Items Added:         ${stats.purchaseItems}`);
        console.log(`Skipped/Exist:       ${stats.skipped}`);
        console.log('------------------------------------');

    } catch (error) {
        console.error('\n\u274c Fatal Error during merge:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
