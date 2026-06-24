import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handler GET untuk lookup pelanggan real-time
export async function GET(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const branchId = request.headers.get("x-branch-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: tenant_id tidak valid" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const limit = searchParams.get("limit");

    const whereClause: any = {
      tenantId,
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ],
    };

    if (branchId) {
      whereClause.branchId = branchId;
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
      ...(limit !== "all" && { take: 10 }), // Batasi 10 hasil saja untuk kecepatan POS jika bukan 'all'
    });

    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    console.error("Kesalahan API GET Customers:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

// Handler POST untuk registrasi inline pelanggan baru
export async function POST(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const branchId = request.headers.get("x-branch-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: tenant_id tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, phone, address } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Nama dan nomor WhatsApp wajib diisi" },
        { status: 400 }
      );
    }

    // Bersihkan input nomor WA/Telepon (hanya ambil angka)
    const cleanPhone = phone.replace(/\D/g, "");

    // (Opsional) Cek nomor dihapus sesuai permintaan agar nomor WA bisa duplikat.

    // Buat pelanggan baru
    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        address: address?.trim() || null,
        tenantId,
        branchId: branchId || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pelanggan baru berhasil didaftarkan",
      customer,
    });
  } catch (error: any) {
    console.error("Kesalahan API POST Customers:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
