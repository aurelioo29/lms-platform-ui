import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token tidak ditemukan"),
    email: z.string().email("Email tidak valid"),
    password: z
      .string()
      .min(8, "Minimal 8 karakter")
      .max(24, "Maksimal 24 karakter"),
    password_confirmation: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi password tidak sama",
    path: ["password_confirmation"],
  });
