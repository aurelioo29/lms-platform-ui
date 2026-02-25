import { apiFetch, getCsrfCookie } from "@/lib/api";

export async function getTeachers(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (String(v).trim() === "") return;
    qs.set(k, String(v));
  });

  return apiFetch(`/api/admin/teachers?${qs.toString()}`);
}

export async function createTeacher(data) {
  await getCsrfCookie();
  return apiFetch(`/api/admin/teachers`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTeacher(id, data) {
  await getCsrfCookie();
  return apiFetch(`/api/admin/teachers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTeacher(id) {
  await getCsrfCookie();
  return apiFetch(`/api/admin/teachers/${id}`, {
    method: "DELETE",
  });
}
