import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
  courseListSchema,
  courseSchema,
  courseUpsertResponseSchema,
} from "./course-schema";

export const coursesKeys = {
  all: ["courses"],

  // ADMIN
  adminList: (params) => [...coursesKeys.all, "admin", "list", params ?? {}],

  // STUDENT / PUBLIC-ish
  publishedList: (params) => [...coursesKeys.all, "published", params ?? {}],

  // DETAIL
  bySlug: (slug) => [...coursesKeys.all, "slug", slug],

  // ENROLL
  enroll: () => [...coursesKeys.all, "enroll"],
};

async function fetchAdminCourses(params = {}) {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.q) sp.set("q", params.q);

  const res = await apiFetch(
    `/api/admin/courses${sp.toString() ? `?${sp.toString()}` : ""}`,
  );

  return courseListSchema.parse(Array.isArray(res) ? res : (res?.data ?? res));
}

async function createCourse(payload) {
  const res = await apiFetch("/api/admin/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return courseUpsertResponseSchema.parse(res);
}

async function updateCourse(id, payload) {
  const res = await apiFetch(`/api/admin/courses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return courseUpsertResponseSchema.parse(res);
}

async function publishCourse(id, payload) {
  const res = await apiFetch(`/api/admin/courses/${id}/publish`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return courseSchema.parse(res);
}

async function archiveCourse(id) {
  const res = await apiFetch(`/api/admin/courses/${id}/archive`, {
    method: "POST",
  });
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

async function fetchCourseBySlug(slug) {
  const res = await apiFetch(`/api/courses/slug/${slug}`);
  return courseSchema.parse(res);
}

export function useCourseBySlug(slug) {
  return useQuery({
    queryKey: coursesKeys.bySlug(slug),
    queryFn: () => fetchCourseBySlug(slug),
    enabled: !!slug,
  });
}

// =========================
// Hooks
// =========================

export function usePublishedCourses(params) {
  return useQuery({
    queryKey: coursesKeys.publishedList(params),
    queryFn: () => fetchPublishedCourses(params),
  });
}

export function useEnrollWithKey() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, enroll_key }) =>
      enrollWithKey(courseId, enroll_key),
    onSuccess: () => {
      // refresh list published (optional) + anything else
      qc.invalidateQueries({ queryKey: coursesKeys.all });
    },
  });
}

// =========================
// STUDENT fetchers
// =========================
async function fetchPublishedCourses(params = {}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);

  const res = await apiFetch(
    `/api/courses${sp.toString() ? `?${sp.toString()}` : ""}`,
  );

  // BE index returns array of courses
  return courseListSchema.parse(res);
}

async function enrollWithKey(courseId, enroll_key) {
  const res = await apiFetch(`/api/courses/${courseId}/enroll`, {
    method: "POST",
    body: JSON.stringify({ enroll_key }),
  });

  // BE returns { message, data }
  return res;
}
