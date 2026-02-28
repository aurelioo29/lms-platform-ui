"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { enrollWithKeyApi } from "./enrollment-api";

// optional: response schema biar aman
const enrollResponseSchema = z.object({
  message: z.string().optional(),
  data: z.any().optional(),
});

export const enrollmentKeys = {
  enroll: (courseId) => ["courses", "enroll", courseId],
};

// ⚠️ ini penting: samain sama keys course list kamu
// kalau kamu punya coursesKeys di courses-queries.js, pake itu
export function useEnrollWithKey() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, enroll_key }) => {
      const res = await enrollWithKeyApi(courseId, enroll_key);
      return enrollResponseSchema.parse(res);
    },

    onSuccess: async (_data, variables) => {
      // invalidate course list (published courses page)
      // sesuaikan key kamu:
      qc.invalidateQueries({ queryKey: ["courses"] });

      // kalau kamu punya "myCourses" query, invalidate juga:
      qc.invalidateQueries({ queryKey: ["my-courses"] });

      // kalau kamu punya detail course query:
      qc.invalidateQueries({
        queryKey: ["courses", "slug", variables?.slug],
      });
    },
  });
}
