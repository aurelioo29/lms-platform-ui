import { z } from "zod";

export const userMiniSchema = z.object({
  id: z.number(),
  name: z.string().nullable().optional(),
});

export const discussionSchema = z.object({
  id: z.number(),
  course_id: z.number(),
  user_id: z.number(),
  title: z.string(),
  body_json: z.any(), // Quill delta (array/object). Keep flexible.
  status: z.enum(["open", "locked", "hidden"]).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  user: userMiniSchema.optional(),
  comments: z.array(z.any()).optional(),
  reactions: z.array(z.any()).optional(),
});

export const paginateSchema = z.object({
  current_page: z.number(),
  data: z.array(discussionSchema),
  last_page: z.number(),
  per_page: z.number(),
  total: z.number(),
});

export const discussionListResponseSchema = z.object({
  data: z.object({
    // your controller returns { data: paginate(...) }
    current_page: z.number(),
    data: z.array(discussionSchema),
    last_page: z.number(),
    per_page: z.number(),
    total: z.number(),
  }),
});

export const discussionDetailResponseSchema = z.object({
  data: discussionSchema,
});
