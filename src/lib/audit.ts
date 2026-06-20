import { prisma } from "@/lib/prisma";

export async function logAudit({
  action,
  entity,
  entityId,
  details,
  userId,
  tenantId,
}: {
  action: string;
  entity: string;
  entityId: string;
  details?: string;
  userId: string;
  tenantId: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        details,
        userId,
        tenantId,
      },
    });
  } catch (error) {
    console.error("Gagal mencatat AuditLog:", error);
  }
}
