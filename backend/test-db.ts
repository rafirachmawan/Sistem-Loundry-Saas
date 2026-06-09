import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

async function main() {
  console.log("DATABASE_URL from env in test:", process.env.DATABASE_URL);
  
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || "file:./dev.db",
  });
  
  const prisma = new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
  });

  try {
    const tenants = await prisma.tenant.findMany();
    console.log("Success! Tenants:", tenants);
  } catch (error) {
    console.error("Error during query:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
