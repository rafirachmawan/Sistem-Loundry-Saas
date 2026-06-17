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

// Handler POST untuk menambah layanan baru
export async function POST(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userRole = request.headers.get("x-user-role");

    if (!tenantId || userRole !== "OWNER") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Hanya pemilik (owner) yang dapat menambah layanan" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, price, unit, planId } = body;

    // Cek batas layanan berdasarkan tier tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { tier: true, _count: { select: { services: true } } }
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: "Tenant tidak ditemukan" }, { status: 404 });
    }

    const currentServicesCount = tenant._count.services;
    
    // Override dari frontend mock jika tersedia
    let tier = tenant.tier.toUpperCase();
    if (planId === "pro") tier = "PRO";
    if (planId === "enterprise") tier = "ENTERPRISE";
    
    let limit = 3; // STARTER
    if (tier === "PRO") limit = 10;
    if (tier === "ENTERPRISE") limit = Infinity;

    if (currentServicesCount >= limit) {
      return NextResponse.json(
        { success: false, message: `Batas maksimal layanan untuk paket ${tier} telah tercapai (${limit} layanan). Upgrade paket Anda di menu Billing.` },
        { status: 403 }
      );
    }

    if (!name || price === undefined || !unit) {
      return NextResponse.json(
        { success: false, message: "Nama, harga, dan satuan wajib diisi" },
        { status: 400 }
      );
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { success: false, message: "Nominal harga tidak valid" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name: name.trim(),
        price: parsedPrice,
        unit: unit.trim().toUpperCase(),
        tenantId,
      },
    });

    return NextResponse.json({ success: true, message: "Layanan berhasil ditambahkan", service });
  } catch (error: any) {
    console.error("Kesalahan API POST Services:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
