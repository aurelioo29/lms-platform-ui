import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  courseListSchema,
  courseSchema,
  courseUpsertResponseSchema,
} from "./course-schema";

export const coursesKeys = {
  all: ["courses"],
  adminList: (params) => [...coursesKeys.all, "admin", "list", params ?? {}],
};

async function fetchAdminCourses(params = {}) {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.q) sp.set("q", params.q);

  const res = await apiFetch(
    `/api/admin/courses${sp.toString() ? `?${sp.toString()}` : ""}`,
  );

  // BE adminIndex returns array of courses
  return courseListSchema.parse(res);
}

async function createCourse(payload) {
  const res = await apiFetch("/api/admin/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // ✅ BE store returns { data: course, enroll_key }
  return courseUpsertResponseSchema.parse(res);
}

async function updateCourse(id, payload) {
  const res = await apiFetch(`/api/admin/courses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  // ✅ BE update returns { data: course, enroll_key }
  return courseUpsertResponseSchema.parse(res);
}

async function publishCourse(id, payload) {
  const res = await apiFetch(`/api/admin/courses/${id}/publish`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // BE publish returns plain course
  return courseSchema.parse(res);
}

async function archiveCourse(id) {
  const res = await apiFetch(`/api/admin/courses/${id}/archive`, {
    method: "POST",
  });

  // BE archive returns plain course
  return courseSchema.parse(res);
}

export function useAdminCourses(params) {
  return useQuery({
    queryKey: coursesKeys.adminList(params),
    queryFn: () => fetchAdminCourses(params),
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => qc.invalidateQueries({ queryKey: coursesKeys.all }),
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateCourse(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: coursesKeys.all }),
  });
}

export function usePublishCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => publishCourse(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: coursesKeys.all }),
  });
}

export function useArchiveCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => archiveCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: coursesKeys.all }),
  });
}
