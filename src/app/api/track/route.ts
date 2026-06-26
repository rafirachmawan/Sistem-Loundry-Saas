import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoice = searchParams.get("invoice");

    if (!invoice) {
      return NextResponse.json(
        { error: "Nomor invoice wajib diisi" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { invoiceNumber: invoice.trim() },
      include: {
        customer: true,
        items: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Data invoice tidak ditemukan. Mohon periksa kembali nomor invoice Anda.",
        },
        { status: 404 },
      );
    }

    // Penyamaran Nama Pelanggan (Data Privacy)
    const customerName = order.customer?.name || "Pelanggan";
    const nameParts = customerName.split(" ");
    const maskedName = nameParts
      .map((p) => (p.length > 1 ? p[0] + "***" : p))
      .join(" ");

    // Formatting data untuk respon frontend
    const result = {
      id: order.invoiceNumber,
      customer: `${maskedName} (Disamarkan)`,
      status: order.status, // ANTREAN, PROSES, SIAP, SELESAI
      items: order.items.map((item) => ({
        name: item.service?.name || "Layanan",
        qty: `${item.quantity} ${item.service?.unit || "PCS"}`,
        price: item.priceSnap * item.quantity,
      })),
      total: order.totalPrice,
      estimatedDone: order.estimatedCompletionDate
        ? new Date(order.estimatedCompletionDate).toLocaleString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta",
          }) + " WIB"
        : "Menunggu Estimasi",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Tracker API Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
