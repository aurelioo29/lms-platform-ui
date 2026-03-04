import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { quizPublicSchema } from "./quiz-schema";

export const quizKeys = {
  all: ["quizzes"],
  publicByLesson: (lessonId) => [...quizKeys.all, "publicByLesson", lessonId],
  publicByQuiz: (quizId) => [...quizKeys.all, "publicByQuiz", quizId],
};

export function fetchQuizPublicByLesson(lessonId) {
  return apiFetch(`/api/courses/lessons/${lessonId}/quiz`).then((res) =>
    quizPublicSchema.parse(res),
  );
}

export function useQuizPublicByLesson(lessonId, enabled = true) {
  return useQuery({
    queryKey: quizKeys.publicByLesson(lessonId),
    queryFn: () => fetchQuizPublicByLesson(lessonId),
    enabled: !!lessonId && enabled,
  });
}

/** Submit attempt (recommended: backend grades it) */
export function useSubmitQuizAttempt(quizId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      apiFetch(`/api/courses/quizzes/${quizId}/attempts`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      // optional invalidate attempts / progress
      qc.invalidateQueries({ queryKey: quizKeys.publicByQuiz(quizId) });
    },
  });
}
