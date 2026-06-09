import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { laundryName, ownerName, email, password } = body;

    if (!laundryName || !ownerName || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Semua kolom input wajib diisi" },
        { status: 400 }
      );
    }

    // Periksa apakah email sudah digunakan
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email sudah terdaftar di sistem" },
        { status: 400 }
      );
    }

    // Gunakan transaksi database untuk menyimpan Tenant, Owner, dan default Services
    const hashedOwnerPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat Tenant baru
      const tenant = await tx.tenant.create({
        data: {
          name: laundryName,
        },
      });

      // 2. Buat User baru dengan role OWNER
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedOwnerPassword,
          name: ownerName,
          role: "OWNER",
          tenantId: tenant.id,
        },
      });

      // 3. Buat default Services laundry
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

    // Buat JWT Token
    const token = await signJWT({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: "OWNER",
      tenantId: result.tenant.id,
    });

    // Set cookie menggunakan cookies API Next.js 15+
    const cookieStore = await cookies();
    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 86400, // 24 jam
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        tenantId: result.user.tenantId,
        tenantName: result.tenant.name,
      },
    });
  } catch (error: any) {
    console.error("Kesalahan API Pendaftaran:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
