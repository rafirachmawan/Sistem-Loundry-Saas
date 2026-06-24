import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Helper untuk validasi role developer
function verifyDeveloper(request: Request) {
  const userRole = request.headers.get("x-user-role");
  return userRole === "DEVELOPER";
}

// GET: Mengambil daftar seluruh tenant dengan statistik agregat
export async function GET(request: Request) {
  try {
    if (!verifyDeveloper(request)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Otorisasi diperlukan." },
        { status: 403 }
      );
    }

    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          where: {
            role: "OWNER",
          },
          select: {
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            users: true,
            customers: true,
            orders: true,
          },
        },
      },
    });

    const tenantsWithStats = await Promise.all(
      tenants.map(async (tenant) => {
        const revenueResult = await prisma.order.aggregate({
          _sum: {
            totalPrice: true,
          },
          where: {
            tenantId: tenant.id,
            paymentStatus: "PAID",
          },
        });

        const expiredAt =
          tenant.tier === "STARTER"
            ? new Date(new Date(tenant.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000)
            : new Date(new Date(tenant.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);

        const owner = tenant.users[0] || null;

        return {
          id: tenant.id,
          name: tenant.name,
          tier: tenant.tier,
          createdAt: tenant.createdAt,
          expiredAt: expiredAt ? expiredAt.toISOString() : null,
          userCount: tenant._count.users,
          customerCount: tenant._count.customers,
          orderCount: tenant._count.orders,
          revenue: revenueResult._sum.totalPrice || 0,
          ownerName: owner ? owner.name : "N/A",
          ownerPhone: owner ? owner.phone : "N/A",
        };
      })
    );

    return NextResponse.json({ success: true, tenants: tenantsWithStats });
  } catch (error: any) {
    console.error("Kesalahan API GET Developer Tenants:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

// POST: Onboard tenant baru beserta owner dan default services
export async function POST(request: Request) {
  try {
    if (!verifyDeveloper(request)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Otorisasi diperlukan." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tenantName, ownerName, ownerEmail, ownerPhone, ownerPassword, tier } = body;

    if (!tenantName || !ownerName || !ownerEmail || !ownerPhone || !ownerPassword) {
      return NextResponse.json(
        { success: false, message: "Seluruh field pendaftaran wajib diisi." },
        { status: 400 }
      );
    }

    // Periksa apakah email user sudah digunakan
    const existingUser = await prisma.user.findUnique({
      where: { email: ownerEmail.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email owner sudah terdaftar di sistem. Gunakan email lain." },
        { status: 400 }
      );
    }

    // Jalankan dalam prisma transaction untuk keamanan data
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat Tenant baru
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName.trim(),
          tier: tier || "STARTER",
        },
      });

      // 2. Hash password owner
      const hashedPassword = await bcrypt.hash(ownerPassword, 10);

      // 3. Buat User OWNER di bawah tenant tersebut
      const user = await tx.user.create({
        data: {
          name: ownerName.trim(),
          email: ownerEmail.toLowerCase().trim(),
          password: hashedPassword,
          phone: ownerPhone,
          role: "OWNER",
          tenantId: tenant.id,
        },
      });

      // 4. Seeding 3 layanan default untuk mempercepat onboarding
      await tx.service.createMany({
        data: [
          {
            name: "Cuci Setrika Kiloan",
            price: 7000,
            unit: "KG",
            tenantId: tenant.id,
          },
          {
            name: "Setrika Kiloan",
            price: 5000,
            unit: "KG",
            tenantId: tenant.id,
          },
          {
            name: "Cuci Bedcover",
            price: 25000,
            unit: "PCS",
            tenantId: tenant.id,
          },
        ],
      });

      return { tenant, user };
    });

    return NextResponse.json({
      success: true,
      message: "Tenant dan Owner baru berhasil didaftarkan dengan layanan default.",
      data: result,
    });
  } catch (error: any) {
    console.error("Kesalahan API POST Developer Tenants Onboarding:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus tenant beserta seluruh data terkait secara transaksional
export async function DELETE(request: Request) {
  try {
    if (!verifyDeveloper(request)) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Otorisasi diperlukan." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "ID Tenant diperlukan untuk menghapus." },
        { status: 400 }
      );
    }

    // Dapatkan tenant developer agar tidak bisa menghapus diri sendiri/tenant pengembang
    const developerEmail = request.headers.get("x-user-email");
    const developerUser = await prisma.user.findFirst({
      where: { email: developerEmail || "" },
    });

    if (developerUser && developerUser.tenantId === tenantId) {
      return NextResponse.json(
        { success: false, message: "Gagal: Anda tidak dapat menghapus tenant developer sistem yang sedang Anda gunakan." },
        { status: 400 }
      );
    }

    // Melakukan cascade delete data secara transaksional
    await prisma.$transaction(async (tx) => {
      // Hapus OrderItem
      await tx.orderItem.deleteMany({
        where: {
          order: {
            tenantId,
          },
        },
      });

      // Hapus Order
      await tx.order.deleteMany({
        where: {
          tenantId,
        },
      });

      // Hapus Customer
      await tx.customer.deleteMany({
        where: {
          tenantId,
        },
      });

      // Hapus Service
      await tx.service.deleteMany({
        where: {
          tenantId,
        },
      });

      // Hapus User
      await tx.user.deleteMany({
        where: {
          tenantId,
        },
      });

      // Terakhir, Hapus Tenant
      await tx.tenant.delete({
        where: {
          id: tenantId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Tenant dan seluruh data terkait berhasil dihapus dari database secara permanen.",
    });
  } catch (error: any) {
    console.error("Kesalahan API DELETE Developer Tenants:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat menghapus tenant." },
      { status: 500 }
    );
  }
}
