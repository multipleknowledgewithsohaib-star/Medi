const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.batch.updateMany({
      where: { branchId: null },
      data: { branchId: 1 }
    });
    console.log(`Successfully updated ${count.count} batches to branchId 1.`);
    
    // Check if there are any batches left without products (just in case)
    const batches = await prisma.batch.count();
    console.log(`Total batches in DB: ${batches}`);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
