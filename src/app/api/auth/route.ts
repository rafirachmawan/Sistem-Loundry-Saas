import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email/Nama dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email atau nama pengguna
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { name: email.trim() }
        ]
      },
      include: { tenant: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Akun atau password salah" },
        { status: 401 }
      );
    }

    // Cek kesesuaian password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Akun atau password salah" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "OWNER" | "KASIR",
      tenantId: user.tenantId,
    });

    // Set cookie menggunakan async cookies API Next.js 15+
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
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
        tenantTier: user.tenant.tier,
        tenantCreatedAt: user.tenant.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Kesalahan API Login:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

// Handler GET untuk logout (menghapus cookie)
export async function GET() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    return NextResponse.json({ success: true, message: "Logout berhasil" });
  } catch (error: any) {
    console.error("Kesalahan API Logout:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat logout" },
      { status: 500 }
    );
  }
}
