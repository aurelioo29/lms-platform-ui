import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiUpload } from "@/lib/api";
import { moduleListSchema, lessonDetailSchema } from "./module-schema";

export const moduleKeys = {
  all: ["course-modules"],
  publicByCourse: (courseId) => [...moduleKeys.all, "public", courseId],
  adminByCourse: (courseId) => [...moduleKeys.all, "admin", courseId],
  lessonDetail: (lessonId) => ["lesson-detail", lessonId],
};

// =======================
// READ (Student/Public)
// =======================
export function fetchPublicModules(courseId) {
  return apiFetch(`/api/courses/${courseId}/modules`).then((res) =>
    moduleListSchema.parse(res),
  );
}

export function usePublicModules(courseId, enabled = true) {
  return useQuery({
    queryKey: moduleKeys.publicByCourse(courseId),
    queryFn: () => fetchPublicModules(courseId),
    enabled: !!courseId && enabled,
  });
}

export function fetchLessonDetailPublic(lessonId) {
  return apiFetch(`/api/courses/lessons/${lessonId}`).then((res) =>
    lessonDetailSchema.parse(res),
  );
}

export function useLessonDetailPublic(lessonId, enabled = true) {
  return useQuery({
    queryKey: moduleKeys.lessonDetail(lessonId),
    queryFn: () => fetchLessonDetailPublic(lessonId),
    enabled: !!lessonId && enabled,
  });
}

// =======================
// READ (Admin)
// =======================
export function fetchAdminModules(courseId) {
  return apiFetch(`/api/admin/courses/${courseId}/modules`).then((res) =>
    moduleListSchema.parse(res),
  );
}

export function useAdminModules(courseId, enabled = true) {
  return useQuery({
    queryKey: moduleKeys.adminByCourse(courseId),
    queryFn: () => fetchAdminModules(courseId),
    enabled: !!courseId && enabled,
  });
}

// =======================
// MUTATIONS (Admin)
// =======================
export function useCreateModule(courseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiFetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: moduleKeys.adminByCourse(courseId) }),
  });
}

export function useUpdateModule(courseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ moduleId, ...payload }) =>
      apiFetch(`/api/admin/courses/modules/${moduleId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: moduleKeys.adminByCourse(courseId) }),
  });
}

export function useDeleteModule(courseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (moduleId) =>
      apiFetch(`/api/admin/courses/modules/${moduleId}`, { method: "DELETE" }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: moduleKeys.adminByCourse(courseId) }),
  });
}

// Lessons
export function useCreateLesson(courseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiFetch(`/api/admin/courses/lessons`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: moduleKeys.adminByCourse(courseId) }),
  });
}

export function useUpdateLesson(courseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, ...payload }) =>
      apiFetch(`/api/admin/courses/lessons/${lessonId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: moduleKeys.adminByCourse(courseId) }),
  });
}

export function useDeleteLesson(courseId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lessonId) =>
      apiFetch(`/api/admin/courses/lessons/${lessonId}`, { method: "DELETE" }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: moduleKeys.adminByCourse(courseId) }),
  });
}

export function useCreateLessonAsset(courseId) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (formData) =>
      apiUpload("/api/admin/courses/lesson-assets", formData, {
        method: "POST",
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: moduleKeys.adminByCourse(courseId) }),
  });
}
