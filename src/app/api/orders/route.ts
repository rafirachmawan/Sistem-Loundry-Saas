import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

async function generatePdfBase64(order: any, customHeader?: string, customFooter?: string) {
  try {
    const customerName = order.customer.name;
    const customerPhone = order.customer.phone;
    const invoiceNumber = order.invoiceNumber;
    const statusBayar = order.paymentStatus === "PAID" ? "LUNAS" : "BELUM LUNAS";
    const total = order.totalPrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
    const timeString = new Date().toLocaleTimeString("id-ID");

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 600]);
    const { width, height } = page.getSize();
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Header Custom atau Default
    const headerTitle = customHeader ? customHeader.split('\n')[0].substring(0, 30) : "SPINDO LAUNDRY";
    page.drawText(headerTitle, { x: 120, y: height - 50, size: 20, font: fontBold, color: rgb(0.04, 0.72, 0.51) });
    page.drawText("NOTA TRANSAKSI", { x: 140, y: height - 70, size: 14, font: fontBold });

    // Details
    let yPos = height - 110;
    page.drawText(`No. Invoice : ${invoiceNumber}`, { x: 30, y: yPos, size: 12, font }); yPos -= 20;
    page.drawText(`Pelanggan   : ${customerName} (${customerPhone})`, { x: 30, y: yPos, size: 12, font }); yPos -= 20;
    page.drawText(`Tanggal     : ${new Date().toLocaleDateString("id-ID")} ${timeString}`, { x: 30, y: yPos, size: 12, font }); yPos -= 20;
    page.drawText(`Status Bayar: ${statusBayar}`, { x: 30, y: yPos, size: 12, font }); yPos -= 30;

    // Line
    page.drawLine({ start: { x: 30, y: yPos }, end: { x: width - 30, y: yPos }, thickness: 1, color: rgb(0.8, 0.8, 0.8) }); yPos -= 20;

    // Items
    page.drawText("Item / Layanan", { x: 30, y: yPos, size: 12, font: fontBold });
    page.drawText("Subtotal", { x: width - 100, y: yPos, size: 12, font: fontBold });
    yPos -= 20;

    order.items.forEach((item: any) => {
      const itemName = `${item.service.name} (${item.quantity} ${item.service.unit})`;
      const itemPrice = (item.priceSnap * item.quantity).toLocaleString("id-ID");
      page.drawText(itemName, { x: 30, y: yPos, size: 11, font });
      page.drawText(`Rp ${itemPrice}`, { x: width - 100, y: yPos, size: 11, font });
      yPos -= 20;
    });

    // Line
    page.drawLine({ start: { x: 30, y: yPos }, end: { x: width - 30, y: yPos }, thickness: 1, color: rgb(0.8, 0.8, 0.8) }); yPos -= 20;

    // Total
    page.drawText("TOTAL TAGIHAN:", { x: width - 190, y: yPos, size: 12, font: fontBold });
    page.drawText(total, { x: width - 90, y: yPos, size: 14, font: fontBold, color: rgb(0.04, 0.72, 0.51) });
    yPos -= 40;

    // Footer
    const footerMsg = customFooter ? customFooter.split('\n')[0].substring(0, 50) : "Terima kasih telah menggunakan jasa kami.";
    page.drawText(footerMsg, { x: 75, y: yPos, size: 12, font });
    yPos -= 15;
    page.drawText("Cucian Anda sedang kami proses (ANTREAN).", { x: 70, y: yPos, size: 10, font: font, color: rgb(0.4, 0.4, 0.4) });

    const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: false });
    return pdfBytes;
  } catch (err) {
    console.error("[API] Gagal membuat PDF:", err);
    return null;
  }
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
        },
        payments: true
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
    const { customerId, paymentTerm, items, notes, estimatedCompletionDate, paymentMethod, amountPaid, headerText, footerText } = body;

    // Validasi parameter wajib
    if (!customerId || !paymentTerm || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Parameter transaksi tidak lengkap atau tidak valid" },
        { status: 400 }
      );
    }

    // Ambil branchId dari User (opsional)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    let branchId = user?.branchId || null;

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

    // Tentukan paymentStatus. Jika CASH dan bayar penuh, langsung PAID.
    const paymentStatus = (paymentMethod === "CASH" && amountPaid >= totalPrice) ? "PAID" : "UNPAID";

    // Simpan data order secara atomic dalam database
    const newOrder = await prisma.order.create({
      data: {
        invoiceNumber,
        status: "QUEUED",
        paymentTerm,
        paymentStatus,
        totalPrice,
        notes: notes || null,
        estimatedCompletionDate: estimatedCompletionDate ? new Date(estimatedCompletionDate) : null,
        tenant: { connect: { id: tenantId } },
        customer: { connect: { id: customerId } },
        user: { connect: { id: userId } },
        ...(branchId ? { branch: { connect: { id: branchId } } } : {}),
        items: {
          create: orderItemsToCreate,
        },
        ...(paymentMethod === "CASH" && amountPaid > 0 ? {
          payments: {
            create: [{
              amount: amountPaid,
              paymentMethod: "CASH",
              userId: userId,
            }]
          }
        } : {})
      },
      include: {
        customer: true,
        items: {
          include: { service: true },
        },
      },
    });

    // Picu pembuatan PDF Nota secara synchronous
    const pdfBase64 = await generatePdfBase64(newOrder, headerText, footerText);

    // [NEW] Kirim PDF secara otomatis via WA Gateway (di-background agar tidak memblokir)
    if (pdfBase64) {
      Promise.resolve().then(async () => {
        try {
          const captionMsg = `${headerText ? headerText + '\n\n' : ''}Berikut kami lampirkan nota digital resmi untuk transaksi Anda (Invoice: *${newOrder.invoiceNumber}*).${footerText ? '\n\n' + footerText : ''}`;
          
          const response = await fetch("http://localhost:3001/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              target: newOrder.customer.phone,
              message: captionMsg,
              media: {
                mimetype: "application/pdf",
                data: pdfBase64,
                filename: `${newOrder.invoiceNumber}.pdf`
              }
            })
          });
          const result = await response.json();
          console.log("[API] Hasil Pengiriman WA Otomatis:", result);
        } catch (e) {
          console.error("[API] Gagal mengirim ke WA Gateway:", e);
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Order berhasil disimpan",
      order: newOrder,
      pdfBase64,
    });
  } catch (error: any) {
    console.error("Kesalahan API POST Orders:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
