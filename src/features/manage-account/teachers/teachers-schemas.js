import { z } from "zod";

export const teacherCreateSchema = z.object({
  name: z.string().min(2, "Name minimal 2 karakter").max(100),
  email: z.string().email("Email tidak valid").max(150),
  password: z.string().min(8, "Password minimal 8 karakter"),
  send_verification: z.boolean().optional().default(true),
});

export const teacherUpdateSchema = z.object({
  name: z.string().min(2, "Name minimal 2 karakter").max(100).optional(),
  email: z.string().email("Email tidak valid").max(150).optional(),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .optional()
    .or(z.literal("")),
});
