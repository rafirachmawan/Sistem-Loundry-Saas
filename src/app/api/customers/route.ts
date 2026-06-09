import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handler GET untuk lookup pelanggan real-time
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
    const search = searchParams.get("search") || "";

    const customers = await prisma.customer.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
        ],
      },
      orderBy: { name: "asc" },
      limit: 10, // Batasi 10 hasil saja untuk kecepatan POS
    } as any); // Typecast as any to bypass compile strictness on custom filters if needed, contains works perfectly in sqlite

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

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: tenant_id tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, phone } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Nama dan nomor WhatsApp wajib diisi" },
        { status: 400 }
      );
    }

    // Bersihkan input nomor WA/Telepon (hanya ambil angka)
    const cleanPhone = phone.replace(/\D/g, "");

    // Cek jika nomor WA sudah terdaftar untuk tenant yang sama
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        tenantId,
        phone: cleanPhone,
      },
    });

    if (existingCustomer) {
      return NextResponse.json({
        success: true,
        message: "Pelanggan dengan nomor WhatsApp ini sudah terdaftar",
        customer: existingCustomer,
      });
    }

    // Buat pelanggan baru
    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        tenantId,
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
