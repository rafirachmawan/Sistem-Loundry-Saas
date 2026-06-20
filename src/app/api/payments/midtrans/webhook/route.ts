import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const midtransClient = require("midtrans-client");

export async function POST(request: Request) {
  try {
    const notificationJson = await request.json();

    // 1. Verifikasi Signature Midtrans (Abaikan jika di Sandbox tanpa verifikasi, namun disarankan untuk Production)
    // Di sini kita percayakan pada Core API untuk parsing
    const apiClient = new midtransClient.CoreApi({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    const statusResponse = await apiClient.transaction.notification(notificationJson);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let paymentStatus = "UNPAID";

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        // Pembayaran butuh verifikasi manual (CC)
        paymentStatus = "UNPAID";
      } else if (fraudStatus == "accept") {
        paymentStatus = "PAID";
      }
    } else if (transactionStatus == "settlement") {
      paymentStatus = "PAID";
    } else if (transactionStatus == "cancel" || transactionStatus == "deny" || transactionStatus == "expire") {
      paymentStatus = "UNPAID";
    } else if (transactionStatus == "pending") {
      paymentStatus = "UNPAID";
    }

    if (paymentStatus === "PAID") {
      // 2. Update status pembayaran di database berdasarkan invoiceNumber
      await prisma.order.update({
        where: { invoiceNumber: orderId },
        data: { paymentStatus: "PAID" },
      });

      console.log(`[Midtrans Webhook] Pembayaran sukses untuk invoice: ${orderId}`);
    }

    return NextResponse.json({ success: true, message: "Webhook diterima" });
  } catch (error: any) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
