import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export const courseParticipantsKeys = {
  all: ["course-participants"],
  list: (courseId, params) => ["course-participants", courseId, params ?? {}],
};

export async function getCourseParticipants(courseId, params = {}) {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.per_page) sp.set("per_page", String(params.per_page));
  if (params.q) sp.set("q", params.q);

  // endpoint kamu:
  // GET /api/courses/{course}/participants
  return apiFetch(`/api/courses/${courseId}/participants?${sp.toString()}`);
}

export function useCourseParticipants(courseId, params) {
  return useQuery({
    queryKey: courseParticipantsKeys.list(courseId, params),
    queryFn: () => getCourseParticipants(courseId, params),
    enabled: !!courseId,
    staleTime: 10_000,
  });
}
