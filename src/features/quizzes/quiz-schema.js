import { z } from "zod";

/** =========================
 *  ADMIN (full data)
 *  ========================= */
export const quizSchema = z.object({
  id: z.number(),
  course_id: z.number(),
  lesson_id: z.number().nullable().optional(),
  title: z.string(),
  type: z.string(), // "mcq"
  time_limit_seconds: z.number().nullable().optional(),
  attempt_limit: z.number().nullable().optional(),
  published_at: z.string().nullable().optional(),
});

export const quizQuestionAdminSchema = z.object({
  id: z.number(),
  quiz_id: z.number(),
  question_type: z.enum([
    "mcq_single",
    "mcq_multi",
    "essay",
    "rating",
    "matching",
    "true_false",
  ]),
  prompt: z.string(),
  prompt_json: z.any().nullable().optional(),
  points: z.number().default(1),
  sort_order: z.number().default(1),

  media_type: z.enum(["none", "upload", "youtube"]).default("none"),
  media_url: z.string().nullable().optional(),
  media_path: z.string().nullable().optional(),
  media_meta: z.any().nullable().optional(),

  require_watch: z.boolean().default(false),
  min_watch_seconds: z.number().nullable().optional(),
});

export const quizQuestionOptionAdminSchema = z.object({
  id: z.number(),
  question_id: z.number(),
  label: z.string().nullable().optional(), // "A" optional
  text: z.string(),
  is_correct: z.boolean().default(false),
  sort_order: z.number().default(1),
});

export const quizQuestionAdminListSchema = z.array(quizQuestionAdminSchema);
export const quizQuestionOptionAdminListSchema = z.array(
  quizQuestionOptionAdminSchema,
);

/** =========================
 *  PUBLIC (student)
 *  ========================= */
export const quizOptionPublicSchema = z.object({
  id: z.number(),
  label: z.string().nullable().optional(),
  text: z.string(),
  // 🚫 NO is_correct here
});

export const quizQuestionPublicSchema = z.object({
  id: z.number(),
  question_type: z.enum(["mcq_single", "mcq_multi", "true_false", "essay"]),
  prompt: z.string(),
  points: z.number().default(1),
  sort_order: z.number().default(1),

  media_type: z.enum(["none", "upload", "youtube"]).default("none"),
  media_url: z.string().nullable().optional(),

  options: z.array(quizOptionPublicSchema).default([]),
});

export const quizPublicSchema = z.object({
  id: z.number(),
  title: z.string(),
  type: z.string(),
  questions: z.array(quizQuestionPublicSchema).default([]),
});

export const quizPublicNullableSchema = z.union([quizPublicSchema, z.null()]);
