const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.count();
    const batches = await prisma.batch.count();
    const purchases = await prisma.purchase.count();
    const sales = await prisma.sale.count();
    const transactions = await prisma.accountTransaction.count();
    const suppliers = await prisma.supplier.count();

    const batchesWithQty = await prisma.batch.count({ where: { quantity: { gt: 0 } } });
    const batchesExpired = await prisma.batch.count({ where: { expiryDate: { lt: new Date() } } });
    const branches = await prisma.branch.findMany();
    const batchBranchStats = await prisma.batch.groupBy({
      by: ['branchId'],
      _count: { _all: true },
      _sum: { quantity: true }
    });

    const sampleBatch = await prisma.batch.findFirst({ include: { product: true } });

    console.log(JSON.stringify({
      counts: { products, batches, purchases, sales, transactions, suppliers },
      batchStats: { batchesWithQty, batchesExpired, batchBranchStats },
      branches,
      sampleBatch
    }, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
