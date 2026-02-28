import { z } from "zod";

export const discussionCourseSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  status: z.string().optional(),

  discussions_count: z.number(),
  locked_count: z.number(),
  last_discussion_at: z.string().nullable().optional(),

  discussions_locked: z.boolean().optional(),
});

export const paginateSchema = z.object({
  current_page: z.number(),
  data: z.array(discussionCourseSchema),
  last_page: z.number(),
  per_page: z.number(),
  total: z.number(),
});

export const discussionCourseListResponseSchema = z.object({
  data: paginateSchema,
});
