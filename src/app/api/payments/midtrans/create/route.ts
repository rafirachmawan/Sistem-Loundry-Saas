import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const midtransClient = require("midtrans-client");

export async function POST(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ success: false, message: "orderId diperlukan" }, { status: 400 });
    }

    // 1. Ambil detail order dari database
    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: { customer: true, items: { include: { service: true } } },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order tidak ditemukan" }, { status: 404 });
    }

    // 2. Inisialisasi Midtrans Snap
    let snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    // 3. Susun parameter Midtrans
    let parameter = {
      transaction_details: {
        order_id: order.invoiceNumber, // Gunakan invoiceNumber sebagai ID transaksi di Midtrans
        gross_amount: order.totalPrice,
      },
      customer_details: {
        first_name: order.customer.name,
        phone: order.customer.phone,
      },
    };

    // 4. Generate Token
    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error: any) {
    console.error("Midtrans Create Transaction Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
