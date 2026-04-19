const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function checkDb(dbPath) {
  console.log(`\n--- Checking: ${dbPath} ---`);
  
  // Temporarily set DATABASE_URL
  process.env.DATABASE_URL = `file:${dbPath}`;
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`
      }
    }
  });

  try {
    const products = await prisma.product.count();
    const batches = await prisma.batch.count();
    const sales = await prisma.sale.count();
    const transactions = await prisma.accountTransaction.count();
    
    console.log({ products, batches, sales, transactions });
  } catch (err) {
    console.log('Error or missing tables:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const prismaDir = path.join(process.cwd(), 'prisma');
  const files = fs.readdirSync(prismaDir).filter(f => f.endsWith('.db'));
  
  for (const file of files) {
    await checkDb(path.join(prismaDir, file));
  }
}

main();
