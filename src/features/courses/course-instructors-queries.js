import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { coursesKeys } from "@/features/courses/courses-queries";

async function assignInstructor({ courseId, userId, role = "main" }) {
  return apiFetch(`/api/admin/courses/${courseId}/instructors`, {
    method: "POST",
    body: JSON.stringify({
      user_id: userId,
      role,
    }),
  });
}

export function useAssignCourseInstructor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assignInstructor,
    onSuccess: () => {
      // refresh course list etc
      qc.invalidateQueries({ queryKey: coursesKeys.all });
    },
  });
}
