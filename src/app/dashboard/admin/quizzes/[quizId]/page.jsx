"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useQuizQuestions } from "@/features/quizzes/quiz-queries";
import CreateQuestionDialog from "@/components/quizzes/CreateQuestionDialog";
import QuestionCard from "@/components/quizzes/QuestionCard";

export default function QuizEditorPage() {
  const params = useParams();
  const quizId = useMemo(() => Number(params.quizId), [params.quizId]);

  const [openCreate, setOpenCreate] = useState(false);

  const {
    data: questions = [],
    isLoading,
    isError,
    error,
  } = useQuizQuestions(quizId);

  if (!quizId || Number.isNaN(quizId)) {
    return <div className="p-6">Invalid quiz id.</div>;
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Quiz #{quizId}</div>
          <div className="text-sm text-muted-foreground">
            Manage questions (MCQ). Add video/link per question if needed.
          </div>
        </div>

        <Button onClick={() => setOpenCreate(true)}>+ Add Question</Button>
      </div>

      {/* States */}
      {isLoading ? <div>Loading questions...</div> : null}

      {isError ? (
        <div className="rounded-md border p-3 text-sm text-red-600">
          {error?.message || "Failed to load questions"}
        </div>
      ) : null}

      {/* Empty state */}
      {!isLoading && !isError && questions.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-lg font-medium">No questions yet</div>
            <div className="text-sm text-muted-foreground mt-1">
              Click <b>Add Question</b> to create your first MCQ. Yes, your quiz
              is currently a philosophical concept.
            </div>
            <div className="mt-4">
              <Button onClick={() => setOpenCreate(true)}>
                + Add Question
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* List */}
      {!isLoading && !isError && questions.length > 0 ? (
        <div className="space-y-3">
          {questions.map((q) => (
            <QuestionCard key={q.id} quizId={quizId} question={q} />
          ))}
        </div>
      ) : null}

      {/* Dialog */}
      <CreateQuestionDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        quizId={quizId}
      />
    </div>
  );
}
