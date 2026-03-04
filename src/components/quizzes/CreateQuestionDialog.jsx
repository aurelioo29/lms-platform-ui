"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import QuillEditor from "@/components/editors/QuillEditor";

import { apiFetch } from "@/lib/api";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import VideoSelector from "./VideoSelector";
import QuestionOptionEditor from "./QuestionOptionEditor";

import {
  useCreateQuizQuestion,
  useCreateQuizQuestionOption,
} from "@/features/quizzes/quiz-queries";

const schema = z
  .object({
    question_type: z.enum(["mcq_single", "mcq_multi"]).default("mcq_single"),
    prompt: z.string().min(3, "Question min 3 chars"),
    points: z.coerce.number().min(1).default(1),
    sort_order: z.coerce.number().min(1).optional(),

    media_type: z.enum(["none", "youtube", "upload"]).default("none"),
    media_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    require_watch: z.boolean().default(false),
    min_watch_seconds: z.coerce.number().min(1).optional().nullable(),

    options: z
      .array(
        z.object({
          label: z.string().min(1, "Option required"),
          is_correct: z.boolean().default(false),
        }),
      )
      .min(2, "At least 2 options"),
  })
  .superRefine((val, ctx) => {
    if (val.media_type === "youtube") {
      const u = (val.media_url || "").trim();
      if (!u) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "YouTube URL is required",
          path: ["media_url"],
        });
      }
    }
  });

export default function CreateQuestionDialog({ open, onOpenChange, quizId }) {
  const createQuestion = useCreateQuizQuestion(quizId);
  const createOption = useCreateQuizQuestionOption(); // we'll call with questionId later (manual)

  const [body, setBody] = useState(null); // optional if you want Quill delta; otherwise use prompt string
  const [videoFile, setVideoFile] = useState(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      question_type: "mcq_single",
      prompt: "",
      points: 1,
      sort_order: 1,

      media_type: "none",
      media_url: "",
      require_watch: false,
      min_watch_seconds: null,

      options: [
        { label: "", is_correct: false },
        { label: "", is_correct: false },
      ],
    },
    mode: "onSubmit",
  });

  const isBusy = createQuestion.isPending;

  useEffect(() => {
    if (!open) return;
    form.reset();
    setVideoFile(null);
    setBody(null);
  }, [open]);

  const canSubmit = useMemo(() => {
    if (!quizId) return false;
    if (isBusy) return false;
    return true;
  }, [quizId, isBusy]);

  const onSubmit = form.handleSubmit(async (values) => {
    // NOTE: prompt sekarang pakai string. Kalau kamu mau Quill untuk prompt, ganti prompt -> body.
    try {
      // create question first
      const created = await createQuestion.mutateAsync({
        data: {
          question_type: values.question_type,
          prompt: values.prompt,
          points: values.points,
          sort_order: values.sort_order,

          media_type: values.media_type,
          media_url:
            values.media_type === "youtube" ? values.media_url.trim() : null,
          require_watch: values.require_watch,
          min_watch_seconds: values.min_watch_seconds ?? null,
        },
        mediaFile: values.media_type === "upload" ? videoFile : null,
      });

      // create options (sequential)
      const options = values.options || [];
      for (let i = 0; i < options.length; i++) {
        await apiFetch(
          `/api/admin/courses/quiz-questions/${created.id}/options`,
          {
            method: "POST",
            body: JSON.stringify({
              label: options[i].label,
              is_correct: options[i].is_correct,
              sort_order: i + 1,
            }),
          },
        );
      }

      onOpenChange(false);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to create question");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle>Create question</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              placeholder="e.g. What is Computer Vision?"
              {...form.register("prompt")}
            />
            {form.formState.errors.prompt ? (
              <p className="text-xs text-red-600">
                {form.formState.errors.prompt.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Question type</Label>
              <Controller
                control={form.control}
                name="question_type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq_single">MCQ Single</SelectItem>
                      <SelectItem value="mcq_multi">MCQ Multi</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Points</Label>
              <Input type="number" {...form.register("points")} />
            </div>

            <div className="space-y-2">
              <Label>Sort order</Label>
              <Input type="number" {...form.register("sort_order")} />
            </div>
          </div>

          <VideoSelector
            form={form}
            videoFile={videoFile}
            setVideoFile={setVideoFile}
          />

          <QuestionOptionEditor form={form} />

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit}>
              {isBusy ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
