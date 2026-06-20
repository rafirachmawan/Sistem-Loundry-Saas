import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createUserSchema } from "@/lib/validations/user-schema";

// Mapping limits for tiers
const TIER_LIMITS: Record<string, number> = {
  STARTER: 2,
  PRO: 5,
  ENTERPRISE: -1,
};

// Handler GET untuk mengambil daftar pengguna (Kasir) milik tenant aktif
export async function GET(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");

    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: tenant_id tidak valid" },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        branch: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { tier: true }
    });

    return NextResponse.json({ 
      success: true, 
      users,
      tier: tenant?.tier || "STARTER",
      maxUsers: TIER_LIMITS[tenant?.tier || "STARTER"]
    });
  } catch (error: any) {
    console.error("Kesalahan API GET Users:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

// Handler POST untuk menambah pengguna (Kasir) baru
export async function POST(request: Request) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userRole = request.headers.get("x-user-role");

    if (!tenantId || userRole !== "OWNER") {
      return NextResponse.json(
        { success: false, message: "Akses ditolak: Hanya pemilik (owner) yang dapat menambah pengguna" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = createUserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, phone, role, branchId } = validationResult.data;

    const newRole = role === "OWNER" ? "OWNER" : "KASIR";

    // Pengecekan Limit Tier
    const currentTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: { select: { users: true } }
      }
    });

    if (!currentTenant) {
      return NextResponse.json({ success: false, message: "Tenant tidak ditemukan" }, { status: 404 });
    }

    const limit = TIER_LIMITS[currentTenant.tier] || TIER_LIMITS.STARTER;
    
    if (limit !== -1 && currentTenant._count.users >= limit) {
      return NextResponse.json(
        { success: false, message: `Batas maksimal akun (${limit} pengguna) untuk paket ${currentTenant.tier} Anda sudah penuh. Silakan upgrade paket Anda.` },
        { status: 403 }
      );
    }

    // Pengecekan Email Unik
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email ini sudah digunakan oleh akun lain" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        password: hashedPassword,
        role: newRole,
        tenantId,
        branchId: branchId || null,
      },
      select: { id: true, name: true, email: true, role: true, branch: { select: { name: true } } }
    });

    return NextResponse.json({ success: true, message: "Pengguna berhasil ditambahkan", user });
  } catch (error: any) {
    console.error("Kesalahan API POST Users:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
