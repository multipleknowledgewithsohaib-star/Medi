const fs = require("fs");
const path = require("path");
const { loadEnvConfig } = require("@next/env");

const repoRoot = path.resolve(__dirname, "..");
const adminEmail = "admin@medistock.local";

loadEnvConfig(repoRoot);

process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
    module: "commonjs",
    moduleResolution: "node",
    esModuleInterop: true,
});

require("ts-node/register/transpile-only");

const { PrismaClient } = require("@prisma/client");
const { verifyPassword } = require(path.join(repoRoot, "lib", "auth", "password.ts"));

const prisma = new PrismaClient();

async function main() {
    const databaseUrl = process.env.DATABASE_URL || null;
    const authUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || null;
    const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || null;

    const databaseList = await prisma.$queryRawUnsafe("PRAGMA database_list;");
    const mainDatabase = Array.isArray(databaseList)
        ? databaseList.find((entry) => entry.name === "main")
        : null;

    const resolvedDatabaseFile = mainDatabase?.file || null;
    const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    console.log(`DATABASE_URL: ${databaseUrl || "(missing)"}`);
    console.log(`Resolved SQLite file: ${resolvedDatabaseFile || "(unknown)"}`);
    console.log(`SQLite file exists: ${resolvedDatabaseFile ? fs.existsSync(resolvedDatabaseFile) : false}`);
    console.log(`NEXTAUTH_URL/AUTH_URL: ${authUrl || "(missing)"}`);
    console.log(`NEXTAUTH_SECRET/AUTH_SECRET: ${authSecret ? "present" : "missing"}`);

    if (!adminUser) {
        console.log(`Admin user (${adminEmail}): not found`);
        console.log("Run this next: npm run reset:admin");
        return;
    }

    const hashPrefix = typeof adminUser.password === "string"
        ? adminUser.password.split(":")[0] || "(unknown)"
        : "(missing)";

    console.log(`Admin user (${adminEmail}): found`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`Active: ${adminUser.isActive}`);
    console.log(`Password hash format: ${hashPrefix}`);
    console.log(`Matches Admin@123: ${verifyPassword("Admin@123", adminUser.password)}`);
    console.log(`Matches AdminReset@2026!: ${verifyPassword("AdminReset@2026!", adminUser.password)}`);
}

main()
    .catch((error) => {
        console.error("VPS auth check failed.");
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
