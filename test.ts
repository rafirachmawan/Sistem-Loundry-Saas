import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    await prisma.user.findFirst();
    console.log("Success!");
  } catch (e) {
    console.error("Failed:", e);
  }
}
test();
