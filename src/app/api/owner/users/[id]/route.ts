import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Handler PUT untuk mengupdate data pengguna (Kasir)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userRole = request.headers.get("x-user-role");

    if (!tenantId || userRole !== "OWNER") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Hanya pemilik (owner) yang dapat mengubah data pengguna" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, phone, password, role } = body;

    // Pastikan user yang akan diupdate milik tenant ini
    const existingUser = await prisma.user.findFirst({
      where: { id, tenantId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // Pengecekan email unik jika email diubah
    if (email && email.toLowerCase().trim() !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
      if (emailTaken) {
        return NextResponse.json(
          { success: false, message: "Email sudah digunakan oleh akun lain" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (role) updateData.role = role === "OWNER" ? "OWNER" : "KASIR";

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
      updateData.plainPassword = password;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true }
    });

    return NextResponse.json({ success: true, message: "Pengguna berhasil diperbarui", user: updatedUser });
  } catch (error: any) {
    console.error("Kesalahan API PUT Users:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

// Handler DELETE untuk menghapus pengguna
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userRole = request.headers.get("x-user-role");
    // Untuk mengecek agar tidak menghapus dirinya sendiri
    const currentUserId = request.headers.get("x-user-id");

    if (!tenantId || userRole !== "OWNER") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Hanya pemilik yang dapat menghapus pengguna" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (id === currentUserId) {
      return NextResponse.json(
        { success: false, message: "Anda tidak dapat menghapus akun Anda sendiri" },
        { status: 400 }
      );
    }

    // Pastikan user ada dan milik tenant ini
    const existingUser = await prisma.user.findFirst({
      where: { id, tenantId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // Pastikan tidak menghapus satu-satunya owner
    if (existingUser.role === "OWNER") {
      const ownerCount = await prisma.user.count({
        where: { tenantId, role: "OWNER" }
      });
      
      if (ownerCount <= 1) {
        return NextResponse.json(
          { success: false, message: "Gagal menghapus: Tenant harus memiliki minimal 1 Owner" },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (error: any) {
    console.error("Kesalahan API DELETE Users:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
