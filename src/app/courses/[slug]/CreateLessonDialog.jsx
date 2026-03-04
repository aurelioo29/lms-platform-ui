"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import QuillEditor from "@/components/editors/QuillEditor";
import {
  useCreateLesson,
  useCreateLessonAsset,
} from "@/features/course-modules/module-queries";

import { useCreateQuiz } from "@/features/quizzes/quiz-queries";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

const schema = z
  .object({
    module_id: z.coerce.number().min(1, "Select a module"),
    title: z.string().min(3, "Title min 3 chars"),
    sort_order: z.coerce.number().min(1).optional(),

    content_type: z
      .enum(["lesson", "resource", "assignment"])
      .default("lesson"),
    lock_mode: z.enum(["open", "complete"]).default("open"),

    resource_type: z
      .enum(["pdf", "video_embed", "video_upload", "image", "file"])
      .optional(),

    resource_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  })
  .superRefine((val, ctx) => {
    if (val.content_type === "resource") {
      if (!val.resource_type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select resource type",
          path: ["resource_type"],
        });
      }

      if (val.resource_type === "video_embed") {
        const url = (val.resource_url || "").trim();
        if (!url) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Embed URL is required for video embed",
            path: ["resource_url"],
          });
        }
      }
    }
  });

export default function CreateLessonDialog({
  open,
  onOpenChange,
  courseId,
  moduleId,
}) {
  const router = useRouter();

  const createLesson = useCreateLesson(courseId);
  const createAsset = useCreateLessonAsset(courseId);
  const createQuiz = useCreateQuiz(courseId);

  const [body, setBody] = useState(null);
  const [resourceFile, setResourceFile] = useState(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      module_id: moduleId ?? "",
      title: "",
      sort_order: 1,
      content_type: "lesson",
      lock_mode: "open",
      resource_type: "pdf",
      resource_url: "",
    },
    mode: "onSubmit",
  });

  const contentType = form.watch("content_type");
  const resourceType = form.watch("resource_type");

  const isLesson = contentType === "lesson";
  const isResource = contentType === "resource";
  const isAssignment = contentType === "assignment";

  const isBusy =
    createLesson.isPending || createAsset.isPending || createQuiz.isPending;

  useEffect(() => {
    if (!open) return;

    form.reset({
      module_id: moduleId ?? "",
      title: "",
      sort_order: 1,
      content_type: "lesson",
      lock_mode: "open",
      resource_type: "pdf",
      resource_url: "",
    });

    setBody(null);
    setResourceFile(null);
  }, [open, moduleId]); // yes, keep moduleId

  const canSubmit = useMemo(() => {
    if (!moduleId) return false;
    if (isBusy) return false;
    return true;
  }, [moduleId, isBusy]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      // ✅ Assignment = Quiz flow
      if (values.content_type === "assignment") {
        // 1) create quiz
        const createdQuiz = await createQuiz.mutateAsync({
          title: values.title,
          type: "mcq",
          // optionally:
          // time_limit_seconds: null,
          // attempt_limit: null,
          // published_at: null,
        });

        // 2) create a lesson placeholder so it appears in module list
        await createLesson.mutateAsync({
          module_id: values.module_id,
          title: values.title,
          sort_order: values.sort_order,
          content_type: "assignment",
          lock_mode: values.lock_mode,
          content_json: { kind: "quiz", quiz_id: createdQuiz.id },
        });

        onOpenChange(false);
        router.push(`/dashboard/admin/quizzes/${createdQuiz.id}`);
        return;
      }

      // ✅ Lesson / Resource flow
      const createdLesson = await createLesson.mutateAsync({
        module_id: values.module_id,
        title: values.title,
        sort_order: values.sort_order,
        content_type: values.content_type,
        lock_mode: values.lock_mode,
        content_json: isLesson ? body : null,
      });

      // ✅ Resource asset
      if (isResource) {
        const fd = new FormData();
        fd.append("lesson_id", String(createdLesson.id));
        fd.append("type", values.resource_type);

        if (values.resource_type === "video_embed") {
          fd.append("url", (values.resource_url || "").trim());
        } else {
          if (!resourceFile) {
            form.setError("resource_type", {
              type: "manual",
              message: "Please choose a file first.",
            });
            return;
          }
          fd.append("file", resourceFile);
        }

        await createAsset.mutateAsync(fd);
      }

      onOpenChange(false);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Failed to create content");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[780px]">
        <DialogHeader>
          <DialogTitle>Create content</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            <div className="mt-1 space-y-1">
              <div>
                • <b>Lesson</b> = rich text (Quill)
              </div>
              <div>
                • <b>Resource</b> = upload / embed
              </div>
              <div>
                • <b>Assignment</b> = Quiz (create then manage questions)
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              {...form.register("title")}
              placeholder="e.g. Quiz: Intro AI"
            />
            {form.formState.errors.title ? (
              <p className="text-xs text-red-600">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input type="number" {...form.register("sort_order")} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Content type</Label>
              <Controller
                control={form.control}
                name="content_type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lesson">Lesson</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                      <SelectItem value="assignment">
                        Assignment (Quiz)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Lock mode</Label>
              <Controller
                control={form.control}
                name="lock_mode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Lock mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {isLesson ? (
            <div className="space-y-2">
              <Label>Content</Label>
              <QuillEditor value={body} onChange={setBody} height={180} />
              <p className="text-xs text-muted-foreground">
                Stored as Quill delta in <code>lessons.content_json</code>.
              </p>
            </div>
          ) : null}

          {isResource ? (
            <div className="space-y-3 rounded-lg border p-3">
              <div className="space-y-2">
                <Label>Resource type</Label>
                <Controller
                  control={form.control}
                  name="resource_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="video_embed">Video Embed</SelectItem>
                        <SelectItem value="video_upload">
                          Video Upload
                        </SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="file">File</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.resource_type ? (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.resource_type.message}
                  </p>
                ) : null}
              </div>

              {resourceType === "video_embed" ? (
                <div className="space-y-2">
                  <Label>Embed URL</Label>
                  <Input
                    placeholder="https://youtube.com/... or https://vimeo.com/..."
                    {...form.register("resource_url")}
                  />
                  {form.formState.errors.resource_url ? (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.resource_url.message}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Upload file</Label>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setResourceFile(e.target.files?.[0] || null)
                    }
                  />
                </div>
              )}
            </div>
          ) : null}

          {isAssignment ? (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="font-medium">Quiz will be created</div>
              <div className="text-muted-foreground">
                You’ll be redirected to manage questions. Because quizzes have
                lots of questions. Nature is healing.
              </div>
            </div>
          ) : null}

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
