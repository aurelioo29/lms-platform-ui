import { z } from "zod";

export const studentSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").max(120),
    email: z.string().email("Email tidak valid").max(190),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .optional()
      .or(z.literal("")),
    use_generic_password: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    const pwd = (val.password ?? "").trim();
    const generic = !!val.use_generic_password;

    // create/edit: password boleh kosong hanya kalau generic true
    if (!pwd && !generic) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Isi password atau aktifkan generic password.",
      });
    }
  });
