"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  courseCreateSchema,
  courseEditSchema,
} from "@/features/courses/course-schema";

// util: generate readable key
function generateEnrollKey(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing 0/O/1/I
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function CourseFormDialog({
  mode = "create", // "create" | "edit"
  open,
  onOpenChange,
  initial,
  onSubmit,
  triggerLabel = "New Course",
}) {
  const isEdit = mode === "edit";
  const schema = isEdit ? courseEditSchema : courseCreateSchema;

  const defaultValues = useMemo(
    () => ({
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      status: initial?.status ?? "draft",
      enroll_key: "",
    }),
    [initial],
  );

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
  }, [open, reset, defaultValues]);

  function setFieldError(field, message) {
    setError(field, { type: "server", message: message || "Invalid" });
  }

  async function submit(values) {
    const payload = {
      title: (values.title ?? "").trim(),
      description: (values.description ?? "").trim() || null,
      status: values.status,
      enroll_key: (values.enroll_key ?? "").trim() || null,
    };

    await onSubmit?.(payload, { setFieldError });
  }

  const title = isEdit ? "Edit Course" : "Create Course";
  const desc = isEdit
    ? "Update course info. You can also change status."
    : "Create a new course. Yes, you can publish immediately—because we’re efficient now.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isEdit ? null : (
        <DialogTrigger asChild>
          <Button type="button">{triggerLabel}</Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Basic CPR"
              {...register("title")}
              disabled={isSubmitting}
            />
            {errors.title ? (
              <p className="text-xs text-destructive">
                {String(errors.title.message)}
              </p>
            ) : null}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              className="min-h-[90px] resize-none"
              {...register("description")}
              disabled={isSubmitting}
            />
            {errors.description ? (
              <p className="text-xs text-destructive">
                {String(errors.description.message)}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Optional. Unlike the bugs.
              </p>
            )}
          </div>

          {/* Status (shadcn Select) */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              disabled={isSubmitting}
              defaultValue={defaultValues.status}
              onValueChange={(v) =>
                setValue("status", v, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">draft</SelectItem>
                <SelectItem value="published">published</SelectItem>
                <SelectItem value="archived">archived</SelectItem>
              </SelectContent>
            </Select>

            {/* hidden input to keep RHF happy */}
            <input type="hidden" {...register("status")} />

            {errors.status ? (
              <p className="text-xs text-destructive">
                {String(errors.status.message)}
              </p>
            ) : null}
          </div>

          {/* Enroll key (clean layout) */}
          <div className="space-y-2">
            <Label htmlFor="enroll_key">Enroll Key</Label>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <Input
                id="enroll_key"
                placeholder="Optional (min 4 chars)"
                {...register("enroll_key")}
                disabled={isSubmitting}
              />

              <Button
                type="button"
                variant="outline"
                className="h-9 sm:h-10 sm:self-start sm:shrink-0"
                onClick={() =>
                  setValue("enroll_key", generateEnrollKey(10), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                disabled={isSubmitting}
              >
                Generate
              </Button>
            </div>

            {errors.enroll_key ? (
              <p className="text-xs text-destructive">
                {String(errors.enroll_key.message)}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                If you want table “Copy key” later, backend must return/store
                the plain key. Hash alone can’t be copied.
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
