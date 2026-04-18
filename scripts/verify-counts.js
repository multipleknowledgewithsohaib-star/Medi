const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('\ud83d\udcca Current Database Counts:');
    console.log('---------------------------');
    
    try {
        const productsSize = await prisma.product.count();
        const suppliersSize = await prisma.supplier.count();
        const purchasesSize = await prisma.purchase.count();
        const batchesSize = await prisma.batch.count();
        const purchaseItemsSize = await prisma.purchaseItem.count();
        const branchesSize = await prisma.branch.count();
        const usersSize = await prisma.user.count();

        console.log(`Products:      ${productsSize}`);
        console.log(`Suppliers:     ${suppliersSize}`);
        console.log(`Purchases:     ${purchasesSize}`);
        console.log(`PurchaseItems: ${purchaseItemsSize}`);
        console.log(`Batches:       ${batchesSize}`);
        console.log(`Branches:      ${branchesSize}`);
        console.log(`Users:         ${usersSize}`);
        
        console.log('\n\ud83d\udce6 Stock Summary (Top 5):');
        const topStock = await prisma.product.findMany({
            take: 5,
            orderBy: { stock: 'desc' },
            select: { name: true, stock: true }
        });
        topStock.forEach(p => console.log(` - ${p.name}: ${p.stock}`));

    } catch (e) {
        console.error('\u274c Error counting records:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
