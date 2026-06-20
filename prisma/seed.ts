import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Memulai seeding data...");

  // Hapus data lama agar bersih
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Hash password default
  const hashedOwnerA = await bcrypt.hash("owner123", 10);
  const hashedKasirA = await bcrypt.hash("kasir123", 10);
  const hashedOwnerB = await bcrypt.hash("owner456", 10);
  const hashedKasirB = await bcrypt.hash("kasir456", 10);
  const hashedDev = await bcrypt.hash("dev123", 10);

  // -------------------------------------------------------------
  // SYSTEM DEVELOPER
  // -------------------------------------------------------------
  const tenantDev = await prisma.tenant.create({
    data: {
      name: "System Developer Tenant",
    },
  });

  await prisma.user.create({
    data: {
      email: "dev@laundry.com",
      password: hashedDev,
      name: "Rafi (Developer)",
      role: "DEVELOPER",
      tenantId: tenantDev.id,
    },
  });

  // -------------------------------------------------------------
  // TENANT A: Laundrease Pusat
  // -------------------------------------------------------------
  const tenantA = await prisma.tenant.create({
    data: {
      name: "Laundrease Pusat",
    },
  });

  await prisma.user.createMany({
    data: [
      {
        email: "owner@laundrease.com",
        password: hashedOwnerA,
        name: "Bambang (Owner A)",
        role: "OWNER",
        tenantId: tenantA.id,
      },
      {
        email: "kasir@laundrease.com",
        password: hashedKasirA,
        name: "Ani (Kasir A)",
        role: "KASIR",
        tenantId: tenantA.id,
      },
    ],
  });

  // Services Tenant A
  await prisma.service.createMany({
    data: [
      {
        name: "Cuci Setrika Kiloan",
        price: 7000,
        unit: "KG",
        tenantId: tenantA.id,
      },
      {
        name: "Setrika Kiloan",
        price: 5000,
        unit: "KG",
        tenantId: tenantA.id,
      },
      {
        name: "Cuci Bedcover",
        price: 25000,
        unit: "PCS",
        tenantId: tenantA.id,
      },
    ],
  });

  // Customers Tenant A
  await prisma.customer.createMany({
    data: [
      {
        name: "Budi Santoso",
        phone: "081234567890",
        tenantId: tenantA.id,
      },
      {
        name: "Siti Rahma",
        phone: "081298765432",
        tenantId: tenantA.id,
      },
    ],
  });

  // -------------------------------------------------------------
  // TENANT B: Clean & Fresh Laundry
  // -------------------------------------------------------------
  const tenantB = await prisma.tenant.create({
    data: {
      name: "Clean & Fresh Laundry",
    },
  });

  // Users Tenant B
  await prisma.user.createMany({
    data: [
      {
        email: "owner@cleanfresh.com",
        password: hashedOwnerB,
        name: "Joni (Owner B)",
        role: "OWNER",
        tenantId: tenantB.id,
      },
      {
        email: "kasir@cleanfresh.com",
        password: hashedKasirB,
        name: "Dedi (Kasir B)",
        role: "KASIR",
        tenantId: tenantB.id,
      },
    ],
  });

  // Services Tenant B
  await prisma.service.createMany({
    data: [
      {
        name: "Express Cuci Setrika",
        price: 12000,
        unit: "KG",
        tenantId: tenantB.id,
      },
      {
        name: "Dry Cleaning Jas",
        price: 35000,
        unit: "PCS",
        tenantId: tenantB.id,
      },
    ],
  });

  // Customers Tenant B
  await prisma.customer.createMany({
    data: [
      {
        name: "Joko Widodo",
        phone: "082111222333",
        tenantId: tenantB.id,
      },
    ],
  });

  console.log("Seeding data selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error("Gagal melakukan seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
