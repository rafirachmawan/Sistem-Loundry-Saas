import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Helper untuk validasi role developer
function verifyDeveloper(request: Request) {
  const userRole = request.headers.get("x-user-role");
  return userRole === "DEVELOPER";
}

// GET: Mengambil daftar semua user terdaftar di platform
export async function GET(request: Request) {
  try {
    if (!verifyDeveloper(request)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Otorisasi diperlukan." },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
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
      createdAt: u.createdAt,
      tenantName: u.tenant.name,
      plainPassword: u.plainPassword,
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

    // Hindari developer menghapus akunnya sendiri
    const currentUserId = request.headers.get("x-user-id");
    if (currentUserId === userId) {
      return NextResponse.json(
        { success: false, message: "Gagal: Anda tidak dapat menghapus akun developer aktif yang sedang Anda gunakan saat ini." },
        { status: 400 }
      );
    }

    // Cari user yang akan dihapus
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    // Jalankan penghapusan user
    // Jika user memiliki order (misalnya dia kasir yang mencatat order), 
    // SQLite akan melempar foreign key constraint error karena model Order memiliki userId.
    // Oleh karena itu, kita ubah userId di order tersebut menjadi null atau kita hapus ordernya.
    // Pilihan paling aman adalah mengosongkan/nullify userId pada order yang dikaitkan,
    // namun Prisma schema mendefinisikan userId sebagai String non-nullable (userId String).
    // Jadi untuk menghapusnya, kita harus menghapus order-order milik kasir tersebut, 
    // atau melarang penghapusan kasir yang memiliki transaksi aktif.
    // Mari buat perlindungan: jika user adalah kasir dan memiliki order, kita lakukan transaksi:
    // hapus orderItem dari order kasir itu, lalu hapus order, baru hapus kasir.
    // Ini memastikan cascade delete berjalan sukses tanpa crash!
    await prisma.$transaction(async (tx) => {
      // Hapus OrderItem milik order user tersebut
      await tx.orderItem.deleteMany({
        where: {
          order: {
            userId: userId,
          },
        },
      });

      // Hapus Order milik user tersebut
      await tx.order.deleteMany({
        where: {
          userId: userId,
        },
      });

      // Hapus User
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

// PUT: Mengubah password user terdaftar
export async function PUT(request: Request) {
  try {
    if (!verifyDeveloper(request)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Otorisasi diperlukan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json(
        { success: false, message: "ID User dan password baru wajib diisi." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Kata sandi minimal harus 6 karakter." },
        { status: 400 }
      );
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password di database
    await prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedPassword,
        plainPassword: newPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kata sandi user berhasil diperbarui.",
    });
  } catch (error: any) {
    console.error("Kesalahan API PUT Developer Users:", error);
    return NextResponse.json(
      { success: false, message: `Terjadi kesalahan: ${error.message || error}` },
      { status: 500 }
    );
  }
}
