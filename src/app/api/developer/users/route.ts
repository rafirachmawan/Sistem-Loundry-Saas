import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Helper untuk validasi role developer
function verifyDeveloper(request: Request) {
  const userRole = request.headers.get("x-user-role");
  return userRole === "DEVELOPER";
}

// GET: Mengambil daftar user terdaftar di platform (opsional filter tenantId)
export async function GET(request: Request) {
  try {
    if (!verifyDeveloper(request)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Otorisasi diperlukan." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    const whereClause = tenantId ? { tenantId } : {};

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone || "",
      createdAt: u.createdAt,
      tenantName: u.tenant.name,
    }));

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (error: any) {
    console.error("Kesalahan API GET Developer Users:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

// POST: Membuat user baru untuk tenant tertentu
export async function POST(request: Request) {
  try {
    if (!verifyDeveloper(request)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Otorisasi diperlukan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tenantId, name, email, password, role, phone } = body;

    if (!tenantId || !name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Semua field wajib diisi (tenantId, name, email, password, role)." },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Format email tidak valid." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email sudah digunakan oleh user lain." },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, message: "Tenant tidak ditemukan." },
        { status: 404 }
      );
    }

    if (password.length < 3) {
      return NextResponse.json(
        { success: false, message: "Kata sandi minimal harus 3 karakter." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        tenantId,
        name,
        email,
        password: hashedPassword,
        role,
        phone: phone || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User baru berhasil dibuat.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Kesalahan API POST Developer Users:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat membuat user." },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus user terdaftar
export async function DELETE(request: Request) {
  try {
    if (!verifyDeveloper(request)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Otorisasi diperlukan." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ID User diperlukan." },
        { status: 400 }
      );
    }

    const currentUserId = request.headers.get("x-user-id");
    if (currentUserId === userId) {
      return NextResponse.json(
        { success: false, message: "Gagal: Anda tidak dapat menghapus akun developer aktif yang sedang Anda gunakan saat ini." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({
        where: {
          order: {
            userId: userId,
          },
        },
      });

      await tx.order.deleteMany({
        where: {
          userId: userId,
        },
      });

      await tx.user.delete({
        where: {
          id: userId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "User dan data aktivitas transaksi terkait berhasil dihapus permanen.",
    });
  } catch (error: any) {
    console.error("Kesalahan API DELETE Developer Users:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menghapus user." },
      { status: 500 }
    );
  }
}

// PUT: Mengubah data atau password user terdaftar
export async function PUT(request: Request) {
  try {
    if (!verifyDeveloper(request)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Otorisasi diperlukan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, name, email, role, phone, newPassword } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "ID User wajib diisi." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;

    if (email !== undefined) {
      if (!email.includes("@")) {
        return NextResponse.json(
          { success: false, message: "Format email tidak valid." },
          { status: 400 }
        );
      }
      if (email !== targetUser.email) {
        const emailConflict = await prisma.user.findUnique({
          where: { email },
        });
        if (emailConflict) {
          return NextResponse.json(
            { success: false, message: "Email sudah digunakan oleh user lain." },
            { status: 400 }
          );
        }
      }
      updateData.email = email;
    }

    if (role !== undefined) {
      if (role !== "OWNER" && role !== "KASIR" && role !== "DEVELOPER") {
        return NextResponse.json(
          { success: false, message: "Peran (role) tidak valid." },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    if (phone !== undefined) updateData.phone = phone || null;

    if (newPassword !== undefined && newPassword !== "") {
      if (newPassword.length < 3) {
        return NextResponse.json(
          { success: false, message: "Kata sandi minimal harus 3 karakter." },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Data user berhasil diperbarui.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error("Kesalahan API PUT Developer Users:", error);
    return NextResponse.json(
      { success: false, message: `Terjadi kesalahan: ${error.message || error}` },
      { status: 500 }
    );
  }
}
