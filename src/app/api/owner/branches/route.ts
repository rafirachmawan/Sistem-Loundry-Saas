import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: tenant_id tidak valid" },
        { status: 400 }
      );
    }

    const branches = await prisma.branch.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, branches });
  } catch (error: any) {
    console.error("Kesalahan API GET Branches:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userRole = request.headers.get("x-user-role");

    if (!tenantId || userRole !== "OWNER") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Hanya pemilik (owner) yang dapat menambah cabang" },
        { status: 403 }
      );
    }

    // Verify Tenant is Enterprise
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { tier: true }
    });

    if (!tenant) {
      return NextResponse.json({ success: false, message: "Tenant tidak ditemukan" }, { status: 404 });
    }

    if (tenant.tier !== "ENTERPRISE") {
      return NextResponse.json(
        { success: false, message: "Fitur multi-cabang hanya tersedia untuk paket Enterprise." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, address, manager } = body;

    if (!name || !address) {
      return NextResponse.json(
        { success: false, message: "Nama dan alamat cabang wajib diisi" },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        manager: manager?.trim() || null,
        tenantId,
      },
    });

    return NextResponse.json({ success: true, message: "Cabang berhasil ditambahkan", branch });
  } catch (error: any) {
    console.error("Kesalahan API POST Branches:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
