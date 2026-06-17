import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userRole = request.headers.get("x-user-role");

    if (!tenantId || userRole !== "OWNER") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 }
      );
    }

    const branchId = params.id;

    // Check if branch belongs to tenant
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, tenantId },
    });

    if (!branch) {
      return NextResponse.json(
        { success: false, message: "Cabang tidak ditemukan" },
        { status: 404 }
      );
    }

    // Perlu dicek apakah cabang memiliki relasi users
    const usersInBranch = await prisma.user.count({
      where: { branchId }
    });

    if (usersInBranch > 0) {
      return NextResponse.json(
        { success: false, message: "Gagal menghapus: Cabang ini masih memiliki Kasir yang ditugaskan." },
        { status: 400 }
      );
    }

    await prisma.branch.delete({
      where: { id: branchId },
    });

    return NextResponse.json({ success: true, message: "Cabang berhasil dihapus" });
  } catch (error: any) {
    console.error("Kesalahan API DELETE Branch:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userRole = request.headers.get("x-user-role");

    if (!tenantId || userRole !== "OWNER") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 }
      );
    }

    const branchId = params.id;
    const body = await request.json();
    const { name, address, manager, status } = body;

    const branch = await prisma.branch.findFirst({
      where: { id: branchId, tenantId },
    });

    if (!branch) {
      return NextResponse.json(
        { success: false, message: "Cabang tidak ditemukan" },
        { status: 404 }
      );
    }

    const updatedBranch = await prisma.branch.update({
      where: { id: branchId },
      data: {
        name: name !== undefined ? name.trim() : branch.name,
        address: address !== undefined ? address.trim() : branch.address,
        manager: manager !== undefined ? manager?.trim() || null : branch.manager,
        status: status !== undefined ? status : branch.status,
      },
    });

    return NextResponse.json({ success: true, message: "Data cabang diperbarui", branch: updatedBranch });
  } catch (error: any) {
    console.error("Kesalahan API PUT Branch:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
