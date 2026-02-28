import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { z } from "zod";

export const teachersKeys = {
  all: ["admin", "teachers"],
};

const teacherSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
});

const teacherListSchema = z.array(teacherSchema);

async function fetchAdminTeachers(params = {}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.per_page) sp.set("per_page", String(params.per_page));
  if (params.sort) sp.set("sort", params.sort);
  if (params.dir) sp.set("dir", params.dir);

  const res = await apiFetch(
    `/api/admin/teachers${sp.toString() ? `?${sp.toString()}` : ""}`,
  );

  // ✅ your controller returns: { data: paginator }
  // paginator has: { data: [...] }
  const list = res?.data?.data ?? [];

  return teacherListSchema.parse(list);
}

export function useAdminTeachers(params) {
  return useQuery({
    queryKey: [...teachersKeys.all, params ?? {}],
    queryFn: () => fetchAdminTeachers(params),
  });
}
