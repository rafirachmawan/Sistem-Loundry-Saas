import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handler GET untuk mengambil daftar master harga layanan milik tenant aktif
export async function GET(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: tenant_id tidak valid" },
        { status: 400 }
      );
    }

    const services = await prisma.service.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, services });
  } catch (error: any) {
    console.error("Kesalahan API GET Services:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
