import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Nama wajib diisi.")
      .max(50, "Maksimal 50 karakter."),
    email: z.string().email("Format email tidak valid."),
    password: z
      .string()
      .min(8, "Minimal 8 karakter.")
      .max(24, "Maksimal 24 karakter."),
    password_confirmation: z
      .string()
      .min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi password tidak sama.",
    path: ["password_confirmation"],
  });
