import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simulasi WhatsApp Gateway Asynchronous (Mock Logger)
function triggerWhatsAppNotification(order: any) {
  // Dijalankan secara asynchronous (fire-and-forget)
  Promise.resolve().then(() => {
    const customerName = order.customer.name;
    const customerPhone = order.customer.phone;
    const invoiceNumber = order.invoiceNumber;
    const statusBayar = order.paymentStatus === "PAID" ? "LUNAS" : "BELUM LUNAS";
    const total = order.totalPrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" });

    // Menyusun format nota digital spintax & unik (timestamp) untuk memitigasi pemblokiran nomor
    const timeString = new Date().toLocaleTimeString("id-ID");
    const uniqueMsgId = Math.random().toString(36).substring(2, 7).toUpperCase();

    let itemsText = "";
    order.items.forEach((item: any) => {
      itemsText += `- ${item.service.name}: ${item.quantity} ${item.service.unit} @ ${item.priceSnap.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}\n`;
    });

    const smsTemplate = `
=========================================
[WA GATEWAY MOCK] MESSAGE ID: ${uniqueMsgId}
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

Cucian Anda sedang kami proses dengan status: ANTREAN. Anda dapat memantau status cucian secara langsung.
*Pesan ini dikirim otomatis oleh sistem laundry kami pada ${timeString}.*
=========================================
`;
    console.log(smsTemplate);
  }).catch((err) => {
    console.error("Gagal mengirim notifikasi WhatsApp Mock:", err);
  });
}

// Handler GET untuk melihat daftar order (untuk Visual Tracker & Dashboard)
export async function GET(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: tenant_id tidak valid" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");

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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("Kesalahan API GET Orders:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

// Handler POST untuk menyimpan transaksi order baru (Super Fast POS & Anti-Fraud Engine)
export async function POST(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userId = request.headers.get("x-user-id");

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: kredensial tidak lengkap" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { customerId, paymentTerm, items, notes, estimatedCompletionDate } = body;

    // Validasi parameter wajib
    if (!customerId || !paymentTerm || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Parameter transaksi tidak lengkap atau tidak valid" },
        { status: 400 }
      );
    }

    // Ambil branchId dari User (atau fallback ke cabang pertama Tenant)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    let branchId = user?.branchId;
    if (!branchId) {
      const firstBranch = await prisma.branch.findFirst({ where: { tenantId } });
      if (!firstBranch) {
        return NextResponse.json(
          { success: false, message: "Tidak ada cabang yang terdaftar untuk tenant ini" },
          { status: 400 }
        );
      }
      branchId = firstBranch.id;
    }

    // Ambil data pelanggan untuk validasi
    const customer = await prisma.customer.findUnique({
      where: { id: customerId, tenantId },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Pelanggan tidak ditemukan" },
        { status: 400 }
      );
    }

    // Anti-Fraud: Ambil data master layanan asli dari DB untuk kalkulasi harga final
    const serviceIds = items.map((i: any) => i.serviceId);
    const dbServices = await prisma.service.findMany({
      where: {
        tenantId,
        id: { in: serviceIds },
      },
    });

    let totalPrice = 0;
    const orderItemsToCreate = [];

    for (const item of items) {
      const dbService = dbServices.find((s) => s.id === item.serviceId);
      if (!dbService) {
        return NextResponse.json(
          { success: false, message: `Layanan dengan ID ${item.serviceId} tidak ditemukan` },
          { status: 400 }
        );
      }

      const quantity = parseFloat(item.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return NextResponse.json(
          { success: false, message: `Kuantitas item tidak valid` },
          { status: 400 }
        );
      }

      // Hitung subtotal berdasarkan harga master di database
      const priceSnap = dbService.price;
      const subtotal = priceSnap * quantity;
      totalPrice += subtotal;

      orderItemsToCreate.push({
        serviceId: dbService.id,
        quantity,
        priceSnap,
      });
    }

    // Generate Invoice Number unik: INV-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

    // Tentukan status pembayaran
    // PREPAID -> PAID, POSTPAID -> UNPAID
    const paymentStatus = paymentTerm === "PREPAID" ? "PAID" : "UNPAID";

    // Simpan data order secara atomic dalam database
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
        branchId: branchId,
        notes: notes || null,
        estimatedCompletionDate: estimatedCompletionDate ? new Date(estimatedCompletionDate) : null,
        items: {
          create: orderItemsToCreate,
        },
      },
      include: {
        customer: true,
        items: {
          include: { service: true },
        },
      },
    });

    // Picu pengiriman notifikasi WhatsApp secara asynchronous (non-blocking)
    triggerWhatsAppNotification(newOrder);

    return NextResponse.json({
      success: true,
      message: "Order berhasil disimpan",
      order: newOrder,
    });
  } catch (error: any) {
    console.error("Kesalahan API POST Orders:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
