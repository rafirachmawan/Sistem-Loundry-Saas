import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "laundry-saas-super-secret-key-that-is-very-long-and-secure-123";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: "OWNER" | "KASIR";
  tenantId: string;
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}
