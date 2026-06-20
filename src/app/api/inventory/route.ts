import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil daftar stok barang untuk cabang kasir saat ini
export async function GET(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userId = request.headers.get("x-user-id");

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: "Kredensial tidak valid" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    let branchId = user?.branchId;

    if (!branchId) {
      const firstBranch = await prisma.branch.findFirst({ where: { tenantId } });
      if (!firstBranch) {
        return NextResponse.json({ success: true, items: [] });
      }
      branchId = firstBranch.id;
    }

    const items = await prisma.inventoryItem.findMany({
      where: { branchId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("Error API GET Inventory:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

// POST: Tambah barang baru ke inventaris
export async function POST(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userId = request.headers.get("x-user-id");

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: "Kredensial tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, sku, unit } = body;

    if (!name || !unit) {
      return NextResponse.json(
        { success: false, message: "Nama dan Unit wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    let branchId = user?.branchId;

    if (!branchId) {
      const firstBranch = await prisma.branch.findFirst({ where: { tenantId } });
      if (!firstBranch) {
        return NextResponse.json(
          { success: false, message: "Tidak ada cabang aktif untuk menambahkan barang" },
          { status: 400 }
        );
      }
      branchId = firstBranch.id;
    }

    const newItem = await prisma.inventoryItem.create({
      data: {
        name: name.trim(),
        sku: sku?.trim() || null,
        unit: unit.trim(),
        stock: 0, // Awal mula selalu 0
        branchId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Barang berhasil ditambahkan",
      item: newItem,
    });
  } catch (error: any) {
    console.error("Error API POST Inventory:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
