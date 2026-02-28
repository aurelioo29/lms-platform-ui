import { apiFetch } from "@/lib/api";

export function getMyCourses(params = {}) {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.per_page) sp.set("per_page", String(params.per_page));
  if (params.q) sp.set("q", params.q);

  return apiFetch(`/api/courses/my/courses?${sp.toString()}`);
}
