import { apiFetch } from "@/lib/api";

export async function getActivityLogs(params = {}) {
  const search = new URLSearchParams();

  // pagination
  if (params.page) search.set("page", String(params.page));
  if (params.per_page) search.set("per_page", String(params.per_page));

  // filters
  if (params.course_id) search.set("course_id", String(params.course_id));
  if (params.user_id) search.set("user_id", String(params.user_id));
  if (params.event_type) search.set("event_type", params.event_type);
  if (params.ref_type) search.set("ref_type", params.ref_type);
  if (params.ref_id) search.set("ref_id", String(params.ref_id));
  if (params.date_from) search.set("date_from", params.date_from);
  if (params.date_to) search.set("date_to", params.date_to);

  const qs = search.toString();
  return apiFetch(`/api/dev/activity-logs${qs ? `?${qs}` : ""}`);
}
