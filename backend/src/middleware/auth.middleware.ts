import { Request, Response, NextFunction } from "express";
import { verifyJWT, JWTPayload } from "../lib/jwt.js";

// Perluas tipe Request Express untuk menampung data user hasil verifikasi
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export function authenticateJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): any {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Autentikasi diperlukan. Kirim header Authorization: Bearer <Token>",
    });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      success: false,
      message: "Format header otorisasi harus Bearer <Token>",
    });
  }

  const token = parts[1];
  const payload = verifyJWT(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: "Sesi tidak valid atau telah kedaluwarsa",
    });
  }

  // Inject payload ke request object
  req.user = payload;
  next();
}
