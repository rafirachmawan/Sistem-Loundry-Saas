import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama terlalu panjang"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().optional().nullable(),
  role: z.enum(["OWNER", "KASIR"]),
  branchId: z.string().optional().nullable(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100).optional(),
  email: z.string().email("Format email tidak valid").optional(),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(["OWNER", "KASIR"]).optional(),
  branchId: z.string().optional().nullable(),
});
