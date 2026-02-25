import { apiFetch, getCsrfCookie } from "@/lib/api";

export async function getStudents(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (String(v).trim() === "") return;
    qs.set(k, String(v));
  });

  return apiFetch(`/api/admin/students?${qs.toString()}`);
}

export async function createStudent(data) {
  await getCsrfCookie();
  return apiFetch(`/api/admin/students`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateStudent(id, data) {
  await getCsrfCookie();
  return apiFetch(`/api/admin/students/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteStudent(id) {
  await getCsrfCookie();
  return apiFetch(`/api/admin/students/${id}`, {
    method: "DELETE",
  });
}
