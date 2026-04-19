const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const pUpdate = await prisma.purchase.updateMany({
      where: { branchId: null },
      data: { branchId: 1 }
    });
    console.log(`Updated ${pUpdate.count} purchases.`);

    const bUpdate = await prisma.batch.updateMany({
      where: { branchId: null },
      data: { branchId: 1 }
    });
    console.log(`Updated ${bUpdate.count} batches.`);

    // Final total check
    const totalExp = await prisma.purchase.aggregate({ _sum: { total: true } });
    console.log(`Final Total Operating Expenses: PKR ${totalExp._sum.total}`);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
