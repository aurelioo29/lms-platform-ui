import { apiFetch, getCsrfCookie } from "@/lib/api";

export async function enrollWithKeyApi(courseId, enroll_key) {
  await getCsrfCookie();

  return apiFetch(`/api/courses/${courseId}/enroll`, {
    method: "POST",
    body: JSON.stringify({ enroll_key }),
  });
}
