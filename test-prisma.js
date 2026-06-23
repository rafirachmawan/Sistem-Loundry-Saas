const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      console.log("No tenant found");
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        name: "Test Customer",
        phone: "08123456789",
        address: null,
        tenantId: tenant.id,
      },
    });
    console.log("Customer created successfully:", customer.id);
    
    // clean up
    await prisma.customer.delete({ where: { id: customer.id } });
    console.log("Cleaned up test customer");
  } catch (error) {
    console.error("Error creating customer:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
