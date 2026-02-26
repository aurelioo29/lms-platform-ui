import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  discussionListResponseSchema,
  discussionDetailResponseSchema,
  discussionSchema,
} from "./discussion-schema";

export const discussionKeys = {
  all: ["discussions"],
  listByCourse: (courseId, params) => [
    "discussions",
    "course",
    courseId,
    params ?? {},
  ],
  detail: (id) => ["discussions", "detail", id],
};

async function fetchDiscussions(courseId, params = {}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.per_page) sp.set("per_page", String(params.per_page));

  // NOTE: because your routes live under /auth
  const res = await apiFetch(
    `/api/courses/${courseId}/discussions${sp.toString() ? `?${sp}` : ""}`,
  );

  return discussionListResponseSchema.parse(res);
}

async function fetchDiscussionDetail(id) {
  const res = await apiFetch(`/api/discussions/${id}`);
  return discussionDetailResponseSchema.parse(res);
}

async function createDiscussion(courseId, payload) {
  const res = await apiFetch(`/api/courses/${courseId}/discussions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // your controller returns the raw discussion (not wrapped) on create
  return discussionSchema.parse(res);
}

export function useCourseDiscussions(courseId, params) {
  return useQuery({
    enabled: !!courseId,
    queryKey: discussionKeys.listByCourse(courseId, params),
    queryFn: () => fetchDiscussions(courseId, params),
  });
}

export function useCreateDiscussion(courseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createDiscussion(courseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: discussionKeys.all });
    },
  });
}

export function useDiscussionDetail(discussionId) {
  return useQuery({
    queryKey: discussionKeys.detail(discussionId),
    enabled: !!discussionId,
    queryFn: async () => {
      const res = await apiFetch(`/api/discussions/${discussionId}`);
      // backend return { data: discussion }
      return discussionDetailResponseSchema.parse(res).data; // ✅ return discussion object
    },
  });
}

export function useCreateComment(discussionId) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      // payload: { body_json }
      const res = await apiFetch(`/api/discussions/${discussionId}/comments`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      // biasanya return comment / data
      return res.data ?? res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: discussionKeys.detail(discussionId) });
    },
  });
}
