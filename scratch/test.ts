import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("No user found");
      return;
    }
    const customer = await prisma.customer.findFirst();
    
    console.log("Creating order for user", user.id, "and customer", customer?.id);
    const order = await prisma.order.create({
      data: {
        invoiceNumber: "TEST-" + Date.now(),
        status: "QUEUED",
        paymentTerm: "PREPAID",
        paymentStatus: "PAID",
        totalPrice: 1000,
        tenant: { connect: { id: user.tenantId } },
        customer: { connect: { id: customer!.id } },
        user: { connect: { id: user.id } },
      }
    });
    console.log("Order created:", order.id);
  } catch (e: any) {
    console.error("Prisma error:", e.message);
  }
}
main().finally(() => prisma.$disconnect());
