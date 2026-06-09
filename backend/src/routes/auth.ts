import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signJWT } from "../lib/jwt.js";
import { authenticateJWT, AuthenticatedRequest } from "../middleware/auth.middleware.js";

const router = Router();

// Endpoint POST /api/v1/auth/login
router.post("/login", async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { tenant: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // Buat JWT Token
    const token = signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "OWNER" | "KASIR",
      tenantId: user.tenantId,
    });

    return res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
      },
    });
  } catch (error) {
    console.error("Kesalahan BE Auth Login:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
    });
  }
});

// Endpoint GET /api/v1/auth/me (Verifikasi Sesi/Token)
router.get("/me", authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const user = req.user!;
    
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { tenant: true }
    });

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        tenantId: dbUser.tenantId,
        tenantName: dbUser.tenant.name,
      }
    });
  } catch (error) {
    console.error("Kesalahan BE Auth Me:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan internal server",
    });
  }
});

export default router;
