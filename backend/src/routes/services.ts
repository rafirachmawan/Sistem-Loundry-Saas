import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateJWT);

// GET /api/v1/services (Fetch services)
router.get("/", async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const tenantId = req.user!.tenantId;

    const services = await prisma.service.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    });

    return res.json({ success: true, services });
  } catch (error) {
    console.error("Kesalahan BE GET Services:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
    });
  }
});

// PATCH /api/v1/services/:id (Update service price - OWNER only)
router.patch("/:id", async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const tenantId = req.user!.tenantId;
    const role = req.user!.role;
    const { id } = req.params;

    if (role !== "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak: Hanya pemilik (owner) yang diizinkan mengubah harga layanan",
      });
    }

    const { name, price, unit } = req.body;

    const existingService = await prisma.service.findFirst({
      where: { id, tenantId },
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: "Layanan tidak ditemukan atau bukan milik tenant Anda",
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Nominal harga tidak valid",
        });
      }
      updateData.price = parsedPrice;
    }
    if (unit !== undefined) updateData.unit = unit.trim();

    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      message: "Master harga layanan berhasil diperbarui",
      service: updatedService,
    });
  } catch (error) {
    console.error("Kesalahan BE PATCH Service ID:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
    });
  }
});

export default router;
