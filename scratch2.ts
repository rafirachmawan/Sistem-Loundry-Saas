import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("Connecting to database...");
  const tenants = await prisma.tenant.findMany();
  console.log("Tenants:", tenants);
}

main()
  .catch((e) => console.error("Error:", e))
  .finally(() => prisma.$disconnect());
