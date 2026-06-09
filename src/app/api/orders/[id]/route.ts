import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handler PATCH untuk memperbarui status order (Visual Tracker & Pickup Gatekeeper)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const { id } = await params;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: tenant_id tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, paymentStatus } = body;

    // Ambil detail order saat ini
    const order = await prisma.order.findUnique({
      where: { id, tenantId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order tidak ditemukan" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // 1. Logika Pembaruan Status Produksi
    if (status) {
      // Pickup Gatekeeper Lock:
      // Jika status akan diubah ke COMPLETED (DIAMBIL) tapi order postpaid & unpaid, TOLAK di sisi backend.
      if (status === "COMPLETED") {
        if (order.paymentTerm === "POSTPAID" && order.paymentStatus === "UNPAID" && paymentStatus !== "PAID") {
          return NextResponse.json(
            { 
              success: false, 
              message: "Fraud Guard: Cucian bernilai postpaid tidak dapat diambil sebelum status pembayaran lunas!" 
            },
            { status: 400 }
          );
        }
      }
      updateData.status = status;
    }

    // 2. Logika Pelunasan Pembayaran
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    // Eksekusi pembaruan ke database
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order berhasil diperbarui",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Kesalahan API PATCH Order ID:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
