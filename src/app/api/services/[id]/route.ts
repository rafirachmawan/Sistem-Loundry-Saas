import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handler PATCH untuk memperbarui master harga layanan oleh Owner
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userRole = request.headers.get("x-user-role");
    const { id } = await params;

    // Keamanan: Hanya OWNER yang diizinkan memodifikasi master harga layanan
    if (!tenantId || userRole !== "OWNER") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Hanya pemilik (owner) yang diizinkan mengubah harga" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, price, unit } = body;

    // Cek keberadaan layanan dan kepemilikan tenant
    const existingService = await prisma.service.findFirst({
      where: { id, tenantId },
    });

    if (!existingService) {
      return NextResponse.json(
        { success: false, message: "Layanan tidak ditemukan atau bukan milik tenant Anda" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json(
          { success: false, message: "Nominal harga tidak valid" },
          { status: 400 }
        );
      }
      updateData.price = parsedPrice;
    }
    if (unit !== undefined) updateData.unit = unit.trim();

    // Update database
    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Master layanan berhasil diperbarui",
      service: updatedService,
    });
  } catch (error: any) {
    console.error("Kesalahan API PATCH Service ID:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
