import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, apiUpload } from "@/lib/api"; // sesuaikan kalau beda
import {
  quizSchema,
  quizQuestionAdminListSchema,
  quizQuestionAdminSchema,
  quizQuestionOptionAdminListSchema,
  quizQuestionOptionAdminSchema,
  quizPublicNullableSchema,
} from "./quiz-schema";

export const quizKeys = {
  all: ["quizzes"],
  questions: (quizId) => ["quizzes", quizId, "questions"],
  options: (questionId) => ["quiz-questions", questionId, "options"],
};

// --------------------
// QUIZ (create only)
// POST /api/admin/courses/{course}/quizzes
// --------------------
export function useCreateQuiz(courseId) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiFetch(`/api/admin/courses/${courseId}/quizzes`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return quizSchema.parse(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quizKeys.all });
    },
  });
}

// --------------------
// QUESTIONS
// GET /api/admin/courses/quizzes/{quiz}/questions
// POST /api/admin/courses/quizzes/{quiz}/questions
// PUT /api/admin/courses/quiz-questions/{quizQuestion}
// DELETE /api/admin/courses/quiz-questions/{quizQuestion}
// --------------------
export function useQuizQuestions(quizId, { enabled = true } = {}) {
  return useQuery({
    queryKey: quizKeys.questions(quizId),
    enabled: !!quizId && enabled,
    queryFn: async () => {
      const res = await apiFetch(
        `/api/admin/courses/quizzes/${quizId}/questions`,
      );
      return quizQuestionAdminListSchema.parse(res);
    },
  });
}

export function useCreateQuizQuestion(quizId) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, mediaFile }) => {
      // kalau upload video → multipart
      if (data.media_type === "upload") {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (typeof v === "boolean") fd.append(k, v ? "1" : "0");
          else fd.append(k, String(v));
        });

        if (mediaFile) fd.append("media_file", mediaFile);

        const res = await apiUpload(
          `/api/admin/courses/quizzes/${quizId}/questions`,
          fd,
        );
        return quizQuestionAdminSchema.parse(res);
      }

      // youtube/none → json
      const res = await apiFetch(
        `/api/admin/courses/quizzes/${quizId}/questions`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      return quizQuestionAdminSchema.parse(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quizKeys.questions(quizId) });
    },
  });
}

export function useUpdateQuizQuestion() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, quizId, data, mediaFile }) => {
      if (data.media_type === "upload" && mediaFile) {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (typeof v === "boolean") fd.append(k, v ? "1" : "0");
          else fd.append(k, String(v));
        });
        fd.append("media_file", mediaFile);

        const res = await apiUpload(
          `/api/admin/courses/quiz-questions/${questionId}`,
          fd,
          { method: "POST" }, // kalau backend kamu PUT multipart susah, pakai POST + _method
        );
        return quizQuestionAdminSchema.parse(res);
      }

      const res = await apiFetch(
        `/api/admin/courses/quiz-questions/${questionId}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
      );
      return quizQuestionAdminSchema.parse(res);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: quizKeys.questions(vars.quizId) });
    },
  });
}

export function useDeleteQuizQuestion() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId }) => {
      return apiFetch(`/api/admin/courses/quiz-questions/${questionId}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_data, vars) => {
      if (vars?.quizId)
        qc.invalidateQueries({ queryKey: quizKeys.questions(vars.quizId) });
    },
  });
}

// --------------------
// OPTIONS
// GET /api/admin/courses/quiz-questions/{question}/options
// POST /api/admin/courses/quiz-questions/{question}/options
// PUT /api/admin/courses/quiz-question-options/{option}
// DELETE /api/admin/courses/quiz-question-options/{option}
// --------------------
export function useQuizQuestionOptions(questionId, { enabled = true } = {}) {
  return useQuery({
    queryKey: quizKeys.options(questionId),
    enabled: !!questionId && enabled,
    queryFn: async () => {
      const res = await apiFetch(
        `/api/admin/courses/quiz-questions/${questionId}/options`,
      );
      return quizQuestionOptionAdminListSchema.parse(res);
    },
  });
}

export function useCreateQuizQuestionOption(questionId) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await apiFetch(
        `/api/admin/courses/quiz-questions/${questionId}/options`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      return quizQuestionOptionAdminSchema.parse(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quizKeys.options(questionId) });
    },
  });
}

export function useUpdateQuizQuestionOption() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ optionId, payload }) => {
      const res = await apiFetch(
        `/api/admin/courses/quiz-question-options/${optionId}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );
      return quizQuestionOptionAdminSchema.parse(res);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: quizKeys.options(vars.questionId) });
    },
  });
}

export function useDeleteQuizQuestionOption() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ optionId }) => {
      return apiFetch(`/api/admin/courses/quiz-question-options/${optionId}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: quizKeys.options(vars.questionId) });
    },
  });
}

export function fetchQuizPublicByLesson(lessonId) {
  return apiFetch(`/api/courses/lessons/${lessonId}/quiz`).then((res) =>
    quizPublicNullableSchema.parse(res?.data ?? res),
  );
}
