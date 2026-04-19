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

    const oldestPurchase = await prisma.purchase.findFirst({ orderBy: { date: 'asc' } });
    const newestPurchase = await prisma.purchase.findFirst({ orderBy: { date: 'desc' } });
    const oldestSale = await prisma.sale.findFirst({ orderBy: { date: 'asc' } });

    console.log(JSON.stringify({
      counts: { products, batches, purchases, sales, transactions, suppliers },
      dates: { 
        oldestPurchase: oldestPurchase?.date, 
        newestPurchase: newestPurchase?.date,
        oldestSale: oldestSale?.date
      }
    }, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
