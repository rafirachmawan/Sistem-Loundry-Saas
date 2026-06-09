import { Router, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth.middleware.js";

const router = Router();

// Semua rute pelanggan membutuhkan autentikasi JWT
router.use(authenticateJWT);

// GET /api/v1/customers (Lookup pelanggan)
router.get("/", async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const tenantId = req.user!.tenantId;
    const search = (req.query.search as string) || "";

    const customers = await prisma.customer.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
        ],
      },
      orderBy: { name: "asc" },
      take: 10, // batasi 10 untuk POS
    });

    return res.json({ success: true, customers });
  } catch (error) {
    console.error("Kesalahan BE GET Customers:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
    });
  }
});

// POST /api/v1/customers (Registrasi inline pelanggan baru)
router.post("/", async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const tenantId = req.user!.tenantId;
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Nama dan nomor WhatsApp wajib diisi",
      });
    }

    const cleanPhone = phone.replace(/\D/g, "");

    // Cek jika nomor telepon sudah terdaftar untuk tenant yang sama
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        tenantId,
        phone: cleanPhone,
      },
    });

    if (existingCustomer) {
      return res.json({
        success: true,
        message: "Pelanggan sudah terdaftar",
        customer: existingCustomer,
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        tenantId,
      },
    });

    return res.json({
      success: true,
      message: "Pelanggan baru berhasil didaftarkan",
      customer,
    });
  } catch (error) {
    console.error("Kesalahan BE POST Customers:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
    });
  }
});

export default router;
