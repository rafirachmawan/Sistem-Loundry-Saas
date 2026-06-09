import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateJWT);

// Simulasi Notifikasi WA secara Asynchronous
function triggerWhatsAppNotification(order: any) {
  Promise.resolve().then(() => {
    const customerName = order.customer.name;
    const customerPhone = order.customer.phone;
    const invoiceNumber = order.invoiceNumber;
    const statusBayar = order.paymentStatus === "PAID" ? "LUNAS" : "BELUM LUNAS";
    const total = order.totalPrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
    const timeString = new Date().toLocaleTimeString("id-ID");
    const uniqueMsgId = Math.random().toString(36).substring(2, 7).toUpperCase();

    let itemsText = "";
    order.items.forEach((item: any) => {
      itemsText += `- ${item.service.name}: ${item.quantity} ${item.service.unit} @ ${item.priceSnap.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}\n`;
    });

    const smsTemplate = `
=========================================
[WA GATEWAY BE MOCK] MESSAGE ID: ${uniqueMsgId}
=========================================
Kepada Yth. ${customerName} (${customerPhone}),

Terima kasih telah menggunakan jasa kami.
Berikut adalah detail nota cucian Anda:

No. Invoice : ${invoiceNumber}
Status Bayar: ${statusBayar}
Waktu Transaksi: ${new Date().toLocaleDateString("id-ID")} ${timeString}

Detail Item:
${itemsText}
-----------------------------------------
TOTAL AKHIR : ${total}

Cucian Anda sedang kami proses dengan status: ANTREAN.
*Pesan ini dikirim otomatis oleh sistem laundry kami pada ${timeString}.*
=========================================
`;
    console.log(smsTemplate);
  }).catch((err) => {
    console.error("Gagal mengirim notifikasi WhatsApp Mock BE:", err);
  });
}

// GET /api/v1/orders (Fetch all orders for active tenant)
router.get("/", async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const tenantId = req.user!.tenantId;
    const { status, paymentStatus } = req.query;

    const whereClause: any = { tenantId };
    if (status) whereClause.status = status;
    if (paymentStatus) whereClause.paymentStatus = paymentStatus;

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: true,
        items: {
          include: { service: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ success: true, orders });
  } catch (error) {
    console.error("Kesalahan BE GET Orders:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server"
    });
  }
});

// POST /api/v1/orders (Create new transaction - POS Anti-Fraud Engine)
router.post("/", async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.userId;
    const { customerId, paymentTerm, items } = req.body;

    if (!customerId || !paymentTerm || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Parameter transaksi tidak lengkap atau tidak valid"
      });
    }

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, tenantId }
    });

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Pelanggan tidak ditemukan atau tidak valid"
      });
    }

    // Anti-Fraud: Ambil data master harga layanan dari DB
    const serviceIds = items.map((i) => i.serviceId);
    const dbServices = await prisma.service.findMany({
      where: {
        tenantId,
        id: { in: serviceIds }
      }
    });

    let totalPrice = 0;
    const orderItemsToCreate = [];

    for (const item of items) {
      const dbService = dbServices.find((s) => s.id === item.serviceId);
      if (!dbService) {
        return res.status(400).json({
          success: false,
          message: `Layanan dengan ID ${item.serviceId} tidak ditemukan`
        });
      }

      const quantity = parseFloat(item.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Kuantitas item tidak valid`
        });
      }

      const priceSnap = dbService.price;
      const subtotal = priceSnap * quantity;
      totalPrice += subtotal;

      orderItemsToCreate.push({
        serviceId: dbService.id,
        quantity,
        priceSnap
      });
    }

    // Generate Invoice Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;
    const paymentStatus = paymentTerm === "PREPAID" ? "PAID" : "UNPAID";

    // Simpan order secara atomic
    const newOrder = await prisma.order.create({
      data: {
        invoiceNumber,
        status: "QUEUED",
        paymentTerm,
        paymentStatus,
        totalPrice,
        tenantId,
        customerId,
        userId,
        items: {
          create: orderItemsToCreate
        }
      },
      include: {
        customer: true,
        items: {
          include: { service: true }
        }
      }
    });

    // Jalankan notifikasi WA secara async (non-blocking)
    triggerWhatsAppNotification(newOrder);

    return res.json({
      success: true,
      message: "Order berhasil disimpan",
      order: newOrder
    });
  } catch (error) {
    console.error("Kesalahan BE POST Orders:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server"
    });
  }
});

// PATCH /api/v1/orders/:id (Update order status / payment status - Pickup Gatekeeper Lock)
router.patch("/:id", async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const tenantId = req.user!.tenantId;
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await prisma.order.findFirst({
      where: { id, tenantId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan"
      });
    }

    const updateData: any = {};

    // 1. Validasi Status Produksi & Pickup Gatekeeper
    if (status) {
      if (status === "COMPLETED") {
        // Jika status diubah ke COMPLETED (DIAMBIL) tetapi order postpaid & unpaid, CEGAH keras di backend
        if (order.paymentTerm === "POSTPAID" && order.paymentStatus === "UNPAID" && paymentStatus !== "PAID") {
          return res.status(400).json({
            success: false,
            message: "Fraud Guard: Cucian postpaid tidak boleh diserahkan sebelum status pembayaran lunas!"
          });
        }
      }
      updateData.status = status;
    }

    // 2. Pelunasan Pembayaran
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: true
      }
    });

    return res.json({
      success: true,
      message: "Order berhasil diperbarui",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Kesalahan BE PATCH Order ID:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server"
    });
  }
});

export default router;
