import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany();
    for (const t of tenants) {
      let b = await prisma.branch.findFirst({ where: { tenantId: t.id } });
      if (!b) {
        b = await prisma.branch.create({
          data: {
            name: "Cabang Pusat",
            address: "Jalan Sudirman No 1",
            tenantId: t.id,
          }
        });
      }
      await prisma.user.updateMany({
        where: { tenantId: t.id, branchId: null },
        data: { branchId: b.id }
      });
    }
    return NextResponse.json({ success: true, message: "Cabang berhasil diinjeksi!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
