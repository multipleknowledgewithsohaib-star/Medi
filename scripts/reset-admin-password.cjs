const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const prismaDir = path.join(repoRoot, "prisma");
const dbFile = path.join(prismaDir, "dev.db");
const adminEmail = "admin@medistock.local";
const temporaryPassword = "AdminReset@2026!";

if (!fs.existsSync(dbFile)) {
    console.error(`Database file not found: ${dbFile}`);
    process.exit(1);
}

process.chdir(prismaDir);
process.env.DATABASE_URL = "file:./dev.db";
process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
    module: "commonjs",
    moduleResolution: "node",
    esModuleInterop: true,
});

require("ts-node/register/transpile-only");

const { PrismaClient, UserRole } = require("@prisma/client");
const { hashPassword } = require(path.join(repoRoot, "lib", "auth", "password.ts"));

const prisma = new PrismaClient();

async function main() {
    const databaseList = await prisma.$queryRawUnsafe("PRAGMA database_list;");
    const mainDatabase = Array.isArray(databaseList)
        ? databaseList.find((entry) => entry.name === "main")
        : null;

    const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    const passwordHash = hashPassword(temporaryPassword);

    const user = existingUser
        ? await prisma.user.update({
              where: { email: adminEmail },
              data: {
                  name: existingUser.name || "Admin User",
                  password: passwordHash,
                  role: UserRole.ADMIN,
                  isActive: true,
                  branchId: existingUser.branchId ?? null,
              },
          })
        : await prisma.user.create({
              data: {
                  name: "Admin User",
                  email: adminEmail,
                  password: passwordHash,
                  role: UserRole.ADMIN,
                  isActive: true,
                  branchId: null,
              },
          });

    console.log("Admin password reset completed successfully.");
    console.log(`Database file: ${mainDatabase?.file || dbFile}`);
    console.log(`User email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.isActive}`);
    console.log(`Temporary password: ${temporaryPassword}`);
    console.log(existingUser ? "Action: updated existing admin user" : "Action: created new admin user");
}

main()
    .catch((error) => {
        console.error("Admin password reset failed.");
        const message = String(error?.message || "");
        if (message.includes("disk I/O error") || message.toLowerCase().includes("locked")) {
            console.error("SQLite write failed. Stop the running app/process that is using prisma/dev.db, then run this script again.");
        }
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
