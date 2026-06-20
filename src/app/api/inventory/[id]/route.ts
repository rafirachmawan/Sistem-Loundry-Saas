import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Penyesuaian stok (Tambah/Kurangi) dengan atomic transaction
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get("x-tenant-id");
    const userId = request.headers.get("x-user-id");
    const { id } = await params;

    if (!tenantId || !userId) {
      return NextResponse.json(
        { success: false, message: "Kredensial tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { type, quantity, reason } = body;

    if (!["IN", "OUT"].includes(type) || typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json(
        { success: false, message: "Parameter tidak valid (type harus IN/OUT, quantity > 0)" },
        { status: 400 }
      );
    }

    // Eksekusi transaksi atomik
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil item dan kunci baris jika memungkinkan (SQLite default behavior handle concurrency)
      const item = await tx.inventoryItem.findUnique({
        where: { id },
      });

      if (!item) {
        throw new Error("Barang tidak ditemukan");
      }

      // Hitung stok baru
      const newStock = type === "IN" ? item.stock + quantity : item.stock - quantity;

      if (newStock < 0) {
        throw new Error(`Stok tidak mencukupi (Sisa: ${item.stock})`);
      }

      // 2. Update stok
      const updatedItem = await tx.inventoryItem.update({
        where: { id },
        data: { stock: newStock },
      });

      // 3. Catat history (StockMovement)
      await tx.stockMovement.create({
        data: {
          itemId: id,
          type: type,
          quantity: quantity,
          reason: reason || (type === "IN" ? "Restock" : "Pemakaian"),
          userId: userId,
        },
      });

      return updatedItem;
    });

    return NextResponse.json({
      success: true,
      message: "Stok berhasil diperbarui",
      item: result,
    });
  } catch (error: any) {
    console.error("Error API PATCH Inventory:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Terjadi kesalahan internal" },
      { status: 400 } // Kembalikan 400 karena error bisnis dari transaction dilempar ke sini
    );
  }
}
