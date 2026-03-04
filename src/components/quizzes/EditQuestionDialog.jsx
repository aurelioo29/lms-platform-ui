"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { useUpdateQuizQuestion } from "@/features/quizzes/quiz-queries";

const schema = z.object({
  question_type: z.enum(["mcq_single", "mcq_multi"]),
  prompt: z.string().min(3),
  points: z.coerce.number().min(1),
  sort_order: z.coerce.number().min(1).optional(),

  media_type: z.enum(["none", "youtube", "upload"]),
  media_url: z.string().url().optional().or(z.literal("")),
  require_watch: z.boolean().default(false),
  min_watch_seconds: z.coerce.number().min(1).optional().nullable(),

  options: z
    .array(z.object({ label: z.string().min(1), is_correct: z.boolean() }))
    .min(2),
});

export default function EditQuestionDialog({
  open,
  onOpenChange,
  quizId,
  question,
}) {
  const update = useUpdateQuizQuestion();
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
  });

  useEffect(() => {
    if (!open || !question) return;
    form.reset({
      question_type: question.question_type,
      prompt: question.prompt,
      points: question.points ?? 1,
      sort_order: question.sort_order ?? 1,
      media_type: question.media_type ?? "none",
      media_url: question.media_url ?? "",
      require_watch: !!question.require_watch,
      min_watch_seconds: question.min_watch_seconds ?? null,
      // options editing: nanti ambil dari API options (lebih akurat)
      options: [
        { label: "", is_correct: false },
        { label: "", is_correct: false },
      ],
    });
    setVideoFile(null);
  }, [open, question]);

  const isBusy = update.isPending;

  const canSubmit = useMemo(() => !!question && !isBusy, [question, isBusy]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await update.mutateAsync({
        questionId: question.id,
        quizId,
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

      onOpenChange(false);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to update question");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle>Edit question</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Question</Label>
            <Input {...form.register("prompt")} />
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

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit}>
              {isBusy ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
