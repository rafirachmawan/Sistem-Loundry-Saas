import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handler POST untuk penagihan WA otomatis (simulasi mock)
export async function POST(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: tenant_id tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "ID Order wajib disertakan" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId },
      include: { customer: true, tenant: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    // Susun pesan chat template penagihan sopan
    const customerName = order.customer.name;
    const customerPhone = order.customer.phone;
    const invoiceNumber = order.invoiceNumber;
    const laundryName = order.tenant.name;
    const total = order.totalPrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
    const timeString = new Date().toLocaleTimeString("id-ID");
    const uniqueMsgId = Math.random().toString(36).substring(2, 7).toUpperCase();

    const smsTemplate = `
=========================================
[WA GATEWAY REMINDER MOCK] MESSAGE ID: ${uniqueMsgId}
=========================================
Halo Kak ${customerName},

Kami dari *${laundryName}* ingin menginfokan bahwa cucian Kakak dengan nomor invoice *${invoiceNumber}* telah SELESAI diproses dan saat ini siap diambil di gerai kami.

Adapun nilai tagihan Kakak sebesar: *${total}*

Mohon bantuannya untuk melakukan pembayaran saat pengambilan atau mengonfirmasi jika ingin menggunakan pembayaran digital (QRIS/Transfer). 

Terima kasih atas kepercayaannya! 🙏
*Pesan penagihan otomatis dikirim pada ${timeString}.*
=========================================
`;

    // Kirim pesan WA melalui Fonnte Gateway
    const token = process.env.FONNTE_TOKEN;
    if (token && token !== "your-fonnte-token-here") {
      try {
        const response = await fetch("https://api.fonnte.com/send", {
          method: "POST",
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            target: customerPhone,
            message: smsTemplate,
            countryCode: "62"
          })
        });
        const fonnteData = await response.json();
        if (!fonnteData.status) {
          console.error("Fonnte error:", fonnteData);
        }
      } catch (err) {
        console.error("Gagal koneksi ke Fonnte:", err);
      }
    } else {
      console.log("[SIMULASI WA] Token Fonnte belum diatur. Pesan:\n", smsTemplate);
    }

    return NextResponse.json({
      success: true,
      message: `Pengingat WhatsApp berhasil dikirim ke nomor ${customerPhone}`,
    });
  } catch (error: any) {
    console.error("Kesalahan API POST Remind:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
