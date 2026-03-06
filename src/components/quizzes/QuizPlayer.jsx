"use client";

import { useMemo, useState } from "react";
import {
  useQuizPublicByLesson,
  useSubmitQuizAttempt,
} from "@/features/quizzes/quiz-public-queries";
import { Button } from "@/components/ui/button";

export default function QuizPlayer({ lessonId }) {
  const {
    data: quiz,
    isLoading,
    isError,
    error,
  } = useQuizPublicByLesson(lessonId, true);

  const [answers, setAnswers] = useState({});

  const quizId = quiz?.id;
  const submitAttempt = useSubmitQuizAttempt(quizId);

  const questions = useMemo(() => {
    if (!quiz?.questions) return [];
    return [...quiz.questions].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );
  }, [quiz]);

  const answeredCount = useMemo(() => {
    return questions.reduce((acc, q) => {
      const v = answers[q.id];
      if (q.question_type === "essay")
        return acc + (typeof v === "string" && v.trim() ? 1 : 0);
      if (q.question_type === "mcq_multi")
        return acc + (Array.isArray(v) && v.length ? 1 : 0);
      return acc + (typeof v === "number" ? 1 : 0);
    }, 0);
  }, [answers, questions]);

  const total = questions.length;
  const progress = total ? Math.round((answeredCount / total) * 100) : 0;

  if (isLoading) return <div className="py-4">Loading quiz…</div>;
  if (isError)
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed: {error?.message}
      </div>
    );
  if (!quiz)
    return (
      <div className="py-4 text-sm text-muted-foreground">Quiz not found.</div>
    );

  function setAnswer(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit() {
    const payload = {
      answers: questions.map((q) => {
        const v = answers[q.id];
        if (q.question_type === "mcq_multi") {  
          return { question_id: q.id, option_ids: Array.isArray(v) ? v : [] };
        }
        if (q.question_type === "essay") {
          return { question_id: q.id, text: typeof v === "string" ? v : "" };
        }
        return {
          question_id: q.id,
          option_id: typeof v === "number" ? v : null,
        };
      }),
    };

    try {
      const res = await submitAttempt.mutateAsync(payload);
      alert("Submitted ✅");
      console.log("attempt result:", res);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to submit attempt");
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Answer carefully. No, the quiz won’t accept “feeling confident” as
            an answer.
          </p>
        </div>

        <div className="shrink-0 rounded-xl border bg-background px-3 py-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {answeredCount}/{total}
            </span>
          </div>
          <div className="mt-2 h-2 w-44 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-foreground"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q, idx) => (
          <QuestionBlock
            key={q.id}
            index={idx + 1}
            q={q}
            value={answers[q.id]}
            onChange={(val) => setAnswer(q.id, val)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button onClick={handleSubmit} disabled={submitAttempt.isPending}>
          {submitAttempt.isPending ? "Submitting..." : "Submit answers"}
        </Button>
      </div>
    </div>
  );
}

function QuestionBlock({ index, q, value, onChange }) {
  const options = Array.isArray(q.options) ? q.options : [];
  const hasVideo = q.media_type === "youtube" && Boolean(q.media_url);

  const header = (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">
        Question {index} • {q.points ?? 1} pts
        <span className="mx-2">•</span>
        <span className="uppercase tracking-wide">{q.question_type}</span>
      </div>
      <div className="text-base font-semibold leading-snug">{q.prompt}</div>
    </div>
  );

  const answerUI =
    q.question_type === "essay" ? (
      <textarea
        className="w-full rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
        rows={4}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer..."
      />
    ) : q.question_type === "mcq_multi" ? (
      options.length ? (
        <MultiChoice
          q={q}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          compact={hasVideo}
        />
      ) : (
        <EmptyOptions />
      )
    ) : options.length ? (
      <SingleChoice
        q={q}
        value={typeof value === "number" ? value : null}
        onChange={onChange}
        compact={hasVideo}
      />
    ) : (
      <EmptyOptions />
    );

  return (
    <div className="rounded-2xl border bg-background p-5">
      {hasVideo ? (
        // ✅ VIDEO LEFT, TITLE+OPTIONS RIGHT
        <div className="grid gap-5 md:grid-cols-[1.6fr_1fr]">
          {/* Left: Video */}
          <div className="overflow-hidden rounded-xl ">
            <div className="mx-auto max-w-[680px]">
              <iframe
                className="w-full aspect-video"
                src={toYoutubeEmbed(q.media_url)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Right: Title + Options */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              {header}
              <div className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                #{index}
              </div>
            </div>

            <div className="space-y-2">{answerUI}</div>
          </div>
        </div>
      ) : (
        // ✅ NORMAL (NO VIDEO)
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            {header}
            <div className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
              #{index}
            </div>
          </div>

          {answerUI}
        </div>
      )}
    </div>
  );
}

function EmptyOptions() {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
      No options provided for this question. (Backend didn’t send them.)
    </div>
  );
}

function SingleChoice({ q, value, onChange, compact = false }) {
  return (
    <div className={compact ? "space-y-2" : "space-y-2.5"}>
      {q.options.map((opt) => {
        const checked = value === opt.id;

        return (
          <label
            key={opt.id}
            className={[
              "group flex items-start gap-3 rounded-xl border cursor-pointer transition",
              compact ? "p-2.5" : "p-3",
              checked
                ? "border-foreground/30 bg-foreground/5"
                : "hover:bg-muted/40",
            ].join(" ")}
          >
            <input
              type="radio"
              name={`q-${q.id}`}
              className="mt-1"
              checked={checked}
              onChange={() => onChange(opt.id)}
            />

            <div className="min-w-0">
              <div className="text-sm leading-snug">
                {opt.label ? (
                  <span className="font-semibold">{opt.label}. </span>
                ) : null}
                <span className="break-words">{opt.text}</span>
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

function MultiChoice({ q, value, onChange, compact = false }) {
  function toggle(optId) {
    const set = new Set(value);
    if (set.has(optId)) set.delete(optId);
    else set.add(optId);
    onChange(Array.from(set));
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-2.5"}>
      {q.options.map((opt) => {
        const checked = value.includes(opt.id);

        return (
          <label
            key={opt.id}
            className={[
              "group flex items-start gap-3 rounded-xl border cursor-pointer transition",
              compact ? "p-2.5" : "p-3",
              checked
                ? "border-foreground/30 bg-foreground/5"
                : "hover:bg-muted/40",
            ].join(" ")}
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={checked}
              onChange={() => toggle(opt.id)}
            />

            <div className="min-w-0">
              <div className="text-sm leading-snug">
                {opt.label ? (
                  <span className="font-semibold">{opt.label}. </span>
                ) : null}
                <span className="break-words">{opt.text}</span>
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

function toYoutubeEmbed(url) {
  try {
    const u = new URL(url);
    const id =
      u.searchParams.get("v") ||
      (u.hostname.includes("youtu.be") ? u.pathname.slice(1) : null);
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}
