import { z } from "zod";

export const resourceTypeEnum = z.enum([
  "pdf",
  "video_embed",
  "video_upload",
  "image",
  "file",
]);

export const lessonSummarySchema = z.object({
  id: z.number(),
  module_id: z.number(),
  title: z.string(),
  content_type: z.enum(["lesson", "assignment", "resource"]).optional(),
  resource_type: resourceTypeEnum.optional().nullable(), // ✅ add
  sort_order: z.number().optional(),
  published_at: z.string().nullable().optional(),
});

export const moduleSchema = z.object({
  id: z.number(),
  course_id: z.number(),
  title: z.string(),
  sort_order: z.number().optional(),
  lessons: z.array(lessonSummarySchema).optional().default([]),
});

export const moduleListSchema = z.array(moduleSchema);

export const lessonDetailSchema = z.object({
  id: z.number(),
  module_id: z.number(),
  title: z.string(),

  content_type: z.enum(["lesson", "assignment", "resource"]),
  content_json: z.any().nullable().optional(),

  // ✅ for resources
  resource_type: resourceTypeEnum.optional().nullable(),
  resource_url: z.string().url().optional().nullable(),
  resource_mime: z.string().optional().nullable(),

  module: z
    .object({
      id: z.number(),
      title: z.string(),
      course_id: z.number(),
    })
    .optional()
    .nullable(),
});
