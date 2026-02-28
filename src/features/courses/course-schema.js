import { z } from "zod";

export const courseStatusEnum = z.enum(["draft", "published", "archived"]);

const instructorUserSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const courseInstructorSchema = z.object({
  id: z.number(),
  course_id: z.number().optional(),
  user_id: z.number().optional(),
  role: z.enum(["main", "assistant"]).optional(),
  instructor: instructorUserSchema.optional().nullable(),
});

export const courseSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  status: courseStatusEnum,

  enroll_key_hash: z.string().nullable().optional(),
  enroll_key_enc: z.string().nullable().optional(),
  enroll_key_plain: z.string().nullable().optional(),

  published_at: z.string().nullable().optional(),
  created_by: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),

  // ✅ ADD THESE (biar ga ke-strip)
  courseInstructors: z.array(courseInstructorSchema).optional().default([]),
  course_instructors: z.array(courseInstructorSchema).optional().default([]),
});

export const courseListSchema = z.array(courseSchema);

const teacherIdRequiredSchema = z.preprocess((v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}, z.number().int().positive("Teacher wajib dipilih"));

const teacherIdSchema = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}, z.number().int().positive().optional());

export const courseCreateSchema = z.object({
  title: z.string().min(3, "Title min 3 chars"),
  description: z.string().optional().nullable(),
  status: courseStatusEnum.default("draft"),
  enroll_key: z.string().min(4, "Enroll key min 4 chars").optional().nullable(),
  auto_generate_key: z.boolean().optional().nullable(),

  // ✅ NOW REQUIRED
  teacher_id: teacherIdRequiredSchema,
  teacher_role: z.enum(["main", "assistant"]).default("main"),
});

export const courseEditSchema = z.object({
  title: z.string().min(3, "Title min 3 chars").optional(),
  description: z.string().optional().nullable(),
  status: courseStatusEnum.optional(),
  enroll_key: z.string().min(4, "Enroll key min 4 chars").optional().nullable(),
  auto_generate_key: z.boolean().optional().nullable(),

  // ✅ NEW
  teacher_id: teacherIdSchema,
  teacher_role: z.enum(["main", "assistant"]).optional(),
});

export const courseUpsertResponseSchema = z.object({
  data: courseSchema,
  enroll_key: z.string().nullable().optional(),
});
