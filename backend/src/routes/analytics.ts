import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateJWT);

// GET /api/v1/analytics/owner (Agregasi metrik dashboard owner)
router.get("/owner", async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const tenantId = req.user!.tenantId;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Omset Aktual Hari Ini: Sum order PAID hari ini
    const paidOrdersToday = await prisma.order.findMany({
      where: {
        tenantId,
        paymentStatus: "PAID",
        createdAt: { gte: startOfToday },
      },
    });
    const omsetToday = paidOrdersToday.reduce((sum, o) => sum + o.totalPrice, 0);

    // 2. Piutang Berjalan: Sum order UNPAID
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

    // 4. Unpaid Alert System: Order READY & UNPAID
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

    // Inisialisasi peta tanggal
    const dateMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      dateMap.set(dateStr, 0);
    }

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

    const chartData = Array.from(dateMap.entries())
      .map(([date, value]) => ({
        date: new Date(date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
        volume: value,
        rawDate: date,
      }))
      .reverse();

    return res.json({
      success: true,
      data: {
        omsetToday,
        piutangBerjalan,
        ordersTodayCount,
        unpaidAlerts,
        chartData,
      },
    });
  } catch (error) {
    console.error("Kesalahan BE GET Analytics Owner:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
    });
  }
});

// POST /api/v1/analytics/remind (WhatsApp Reminder - mock)
router.post("/remind", async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const tenantId = req.user!.tenantId;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "ID Order wajib disertakan",
      });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: { customer: true, tenant: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    const customerName = order.customer.name;
    const customerPhone = order.customer.phone;
    const invoiceNumber = order.invoiceNumber;
    const laundryName = order.tenant.name;
    const total = order.totalPrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
    const timeString = new Date().toLocaleTimeString("id-ID");
    const uniqueMsgId = Math.random().toString(36).substring(2, 7).toUpperCase();

    const smsTemplate = `
=========================================
[WA GATEWAY BE REMINDER MOCK] MESSAGE ID: ${uniqueMsgId}
=========================================
Halo Kak ${customerName},

Kami dari *${laundryName}* ingin menginfokan bahwa cucian Kakak dengan nomor invoice *${invoiceNumber}* telah SELESAI diproses dan saat ini siap diambil di gerai kami.

Adapun nilai tagihan Kakak sebesar: *${total}*

Mohon bantuannya untuk melakukan pembayaran saat pengambilan atau mengonfirmasi jika ingin menggunakan pembayaran digital (QRIS/Transfer). 

Terima kasih atas kepercayaannya! 🙏
*Pesan penagihan otomatis dikirim pada ${timeString}.*
=========================================
`;

    console.log(smsTemplate);

    return res.json({
      success: true,
      message: `Pengingat WhatsApp berhasil dikirim ke nomor ${customerPhone}`,
    });
  } catch (error) {
    console.error("Kesalahan BE POST Remind:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
    });
  }
});

export default router;
