import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const userRole = request.headers.get("x-user-role");

    if (userRole !== "DEVELOPER") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Hanya pengembang yang dapat mengakses data ini." },
        { status: 403 }
      );
    }

    const tenantCount = await prisma.tenant.count();
    const userCount = await prisma.user.count();
    const orderCount = await prisma.order.count();

    const revenueResult = await prisma.order.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        paymentStatus: "PAID",
      },
    });

    const totalRevenue = revenueResult._sum.totalPrice || 0;

    return NextResponse.json({
      success: true,
      data: {
        tenantCount,
        userCount,
        orderCount,
        totalRevenue,
      },
    });
  } catch (error: any) {
    console.error("Kesalahan API GET Developer Stats:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
