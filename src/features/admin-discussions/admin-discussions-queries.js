import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { discussionCourseListResponseSchema } from "./admin-discussions-schema";

export const adminDiscussionKeys = {
  all: ["admin-discussion-courses"],
  list: (params) => ["admin-discussion-courses", params ?? {}],
};

async function fetchAdminDiscussionCourses(params = {}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.page) sp.set("page", String(params.page));

  const res = await apiFetch(
    `/api/admin/discussion-courses${sp.toString() ? `?${sp}` : ""}`,
  );

  return discussionCourseListResponseSchema.parse(res);
}

export function setCourseDiscussionLock(courseId, locked) {
  return apiFetch(`/api/admin/courses/${courseId}/discussions/lock`, {
    method: "PATCH",
    body: JSON.stringify({ locked }),
  });
}

export function useAdminDiscussionCourses(params) {
  return useQuery({
    queryKey: adminDiscussionKeys.list(params),
    queryFn: () => fetchAdminDiscussionCourses(params),
  });
}

export function useSetCourseDiscussionLock() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, locked }) =>
      setCourseDiscussionLock(courseId, locked),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminDiscussionKeys.all });
    },
  });
}

export function getDiscussionCourses(params = {}) {
  const sp = new URLSearchParams();

  if (params.page) sp.set("page", String(params.page));
  if (params.per_page) sp.set("per_page", String(params.per_page));
  if (params.q) sp.set("q", params.q);
  if (params.sort) sp.set("sort", params.sort);
  if (params.dir) sp.set("dir", params.dir);

  return apiFetch(`/api/admin/discussion-courses?${sp.toString()}`);
}

export function getAdminDiscussions(params = {}) {
  const sp = new URLSearchParams();

  if (params.page) sp.set("page", String(params.page));
  if (params.per_page) sp.set("per_page", String(params.per_page));
  if (params.q) sp.set("q", params.q);
  if (params.status) sp.set("status", params.status);
  if (params.course_id) sp.set("course_id", String(params.course_id));

  return apiFetch(`/api/admin/discussions?${sp.toString()}`);
}

export function toggleDiscussionLock(id) {
  return apiFetch(`/api/admin/discussions/${id}/toggle-lock`, {
    method: "PATCH",
  });
}
