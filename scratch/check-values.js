const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const p = await prisma.purchase.findFirst();
    console.log('Sample Purchase:', JSON.stringify(p, null, 2));
    const total = await prisma.purchase.aggregate({ _sum: { total: true } });
    console.log('Sum of total:', total._sum.total);

    const s = await prisma.sale.findFirst();
    console.log('Sample Sale:', JSON.stringify(s, null, 2));

    const t = await prisma.accountTransaction.count();
    console.log('Total Transactions:', t);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
