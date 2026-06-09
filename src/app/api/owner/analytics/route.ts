import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: tenant_id tidak valid" },
        { status: 400 }
      );
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Omset Aktual Hari Ini: Sum total order PAID hari ini
    const paidOrdersToday = await prisma.order.findMany({
      where: {
        tenantId,
        paymentStatus: "PAID",
        createdAt: { gte: startOfToday },
      },
    });
    const omsetToday = paidOrdersToday.reduce((sum, o) => sum + o.totalPrice, 0);

    // 2. Piutang Berjalan: Sum total order UNPAID (semua waktu)
    const unpaidOrders = await prisma.order.findMany({
      where: {
        tenantId,
        paymentStatus: "UNPAID",
      },
    });
    const piutangBerjalan = unpaidOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    // 3. Order Masuk Hari Ini
    const ordersTodayCount = await prisma.order.count({
      where: {
        tenantId,
        createdAt: { gte: startOfToday },
      },
    });

    // 4. Unpaid Alert System: Order READY & UNPAID (diurutkan dari yang terlama)
    const unpaidAlerts = await prisma.order.findMany({
      where: {
        tenantId,
        status: "READY",
        paymentStatus: "UNPAID",
      },
      include: {
        customer: true,
        items: {
          include: { service: true }
        }
      },
      orderBy: { createdAt: "asc" },
    });

    // 5. Tren Volume Kilogram (7 Hari Terakhir)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const ordersLast7Days = await prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { gte: sevenDaysAgo },
      },
      include: {
        items: {
          include: { service: true },
        },
      },
    });

    // Inisialisasi peta 7 hari terakhir
    const dateMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10); // Format YYYY-MM-DD
      dateMap.set(dateStr, 0);
    }

    // Akumulasi volume cucian kiloan (unit = KG)
    ordersLast7Days.forEach((ord) => {
      const dateStr = ord.createdAt.toISOString().slice(0, 10);
      if (dateMap.has(dateStr)) {
        let dailyKg = 0;
        ord.items.forEach((item) => {
          if (item.service.unit.toUpperCase() === "KG") {
            dailyKg += item.quantity;
          }
        });
        dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + dailyKg);
      }
    });

    // Konversi peta menjadi array terurut tanggal
    const chartData = Array.from(dateMap.entries())
      .map(([date, value]) => ({
        date: new Date(date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
        volume: value,
        rawDate: date,
      }))
      .reverse();

    return NextResponse.json({
      success: true,
      data: {
        omsetToday,
        piutangBerjalan,
        ordersTodayCount,
        unpaidAlerts,
        chartData,
      },
    });
  } catch (error: any) {
    console.error("Kesalahan API GET Analytics:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
