import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany();
  for (const t of tenants) {
    let b = await prisma.branch.findFirst({ where: { tenantId: t.id } });
    if (!b) {
      b = await prisma.branch.create({
        data: {
          name: "Cabang Pusat",
          address: "Jalan Sudirman No 1",
          tenantId: t.id,
        }
      });
      console.log("Created branch for tenant", t.name);
    }
    await prisma.user.updateMany({
      where: { tenantId: t.id, branchId: null },
      data: { branchId: b.id }
    });
  }
  console.log("Selesai!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
