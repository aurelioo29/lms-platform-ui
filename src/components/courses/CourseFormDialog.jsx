"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Search, X } from "lucide-react";

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

function generateEnrollKey(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/**
 * ✅ Custom Teacher Dropdown (No shadcn Select)
 * - Stable inside Dialog
 * - Searchable
 * - Click outside closes
 * - Controlled via RHF setValue + watch
 */
function TeacherDropdown({
  teachers = [],
  value, // teacher_id string
  onChange,
  disabled,
  placeholder = "Select teacher",
}) {
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selected = useMemo(() => {
    if (!value) return null;
    return teachers.find((t) => String(t.id) === String(value)) ?? null;
  }, [teachers, value]);

  const filtered = useMemo(() => {
    const qq = (q ?? "").trim().toLowerCase();
    if (!qq) return teachers;
    return teachers.filter((t) =>
      String(t?.name ?? "")
        .toLowerCase()
        .includes(qq),
    );
  }, [teachers, q]);

  // click outside to close
  useEffect(() => {
    function onDocMouseDown(e) {
      if (!open) return;
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  // close on ESC
  useEffect(() => {
    function onKeyDown(e) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const label = selected ? selected.name : placeholder;

  return (
    <div className="relative" ref={wrapRef}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border px-3 text-left text-sm",
          "bg-background hover:bg-accent/40",
          "disabled:cursor-not-allowed disabled:opacity-60",
          open ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : "",
        ].join(" ")}
      >
        <span className={selected ? "" : "text-muted-foreground"}>{label}</span>
        <ChevronDown
          className={["h-4 w-4 opacity-70", open ? "rotate-180" : ""].join(" ")}
        />
      </button>

      {/* Panel */}
      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-[200] w-full rounded-md border bg-background shadow-lg">
          {/* Search */}
          <div className="flex items-center gap-2 border-b px-2 py-2">
            <Search className="h-4 w-4 opacity-60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search teacher..."
              className="h-8 w-full bg-transparent text-sm outline-none"
              autoFocus
            />
            {q ? (
              <button
                type="button"
                className="rounded p-1 hover:bg-accent"
                onClick={() => setQ("")}
                aria-label="Clear search"
              >
                <X className="h-4 w-4 opacity-70" />
              </button>
            ) : null}
          </div>

          {/* Items */}
          <div className="max-h-56 overflow-auto p-1">
            {filtered.length ? (
              filtered.map((t) => {
                const id = String(t.id);
                const active = String(value || "") === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onChange?.(id);
                      setOpen(false);
                      setQ("");
                    }}
                    className={[
                      "flex w-full items-center justify-between rounded-md px-2 py-2 text-sm",
                      "hover:bg-accent",
                      active ? "bg-accent" : "",
                    ].join(" ")}
                  >
                    <span className="truncate">{t.name}</span>
                    {active ? (
                      <span className="text-xs text-muted-foreground">
                        selected
                      </span>
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="px-2 py-3 text-sm text-muted-foreground">
                No teachers found
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CourseFormDialog({
  mode = "create",
  open,
  onOpenChange,
  initial,
  onSubmit,
  triggerLabel = "New Course",
  teachers = [],
}) {
  const isEdit = mode === "edit";
  const schema = isEdit ? courseEditSchema : courseCreateSchema;

  const defaultValues = useMemo(
    () => ({
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      status: initial?.status ?? "draft",
      enroll_key: "",

      // store teacher_id as string for FE
      teacher_id: initial?.teacher_id ? String(initial.teacher_id) : "",
      teacher_role: initial?.teacher_role ?? "main",
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
    watch,
    formState: { errors, isSubmitting },
  } = form;

  // reset when dialog opens
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

      teacher_id: values.teacher_id ?? "",
      teacher_role: values.teacher_role ?? "main",
    };

    await onSubmit?.(payload, { setFieldError });
  }

  const dialogTitle = isEdit ? "Edit Course" : "Create Course";
  const dialogDesc = isEdit
    ? "Update course info."
    : "Create a new course. Try not to create 47 drafts and call it ‘versioning’.";

  const statusVal = watch("status") || "draft";
  const roleVal = watch("teacher_role") || "main";
  const teacherIdVal = watch("teacher_id") || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isEdit ? null : (
        <DialogTrigger asChild>
          <Button type="button">{triggerLabel}</Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDesc}</DialogDescription>
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
                Optional. Unlike validation.
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              disabled={isSubmitting}
              value={statusVal}
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
              <SelectContent className="z-[80]">
                <SelectItem value="draft">draft</SelectItem>
                <SelectItem value="published">published</SelectItem>
                <SelectItem value="archived">archived</SelectItem>
              </SelectContent>
            </Select>

            <input type="hidden" {...register("status")} />

            {errors.status ? (
              <p className="text-xs text-destructive">
                {String(errors.status.message)}
              </p>
            ) : null}
          </div>

          {/* Teacher (✅ custom dropdown) */}
          <div className="space-y-2">
            <Label>Teacher</Label>

            <div className="grid gap-2 sm:grid-cols-2">
              <TeacherDropdown
                teachers={teachers}
                value={teacherIdVal}
                disabled={isSubmitting}
                onChange={(id) =>
                  setValue("teacher_id", id, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                placeholder="Select teacher"
              />

              <Select
                disabled={isSubmitting}
                value={roleVal}
                onValueChange={(v) =>
                  setValue("teacher_role", v, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="z-[80]">
                  <SelectItem value="main">main</SelectItem>
                  <SelectItem value="assistant">assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* hidden inputs for RHF */}
            <input type="hidden" {...register("teacher_id")} />
            <input type="hidden" {...register("teacher_role")} />

            {errors.teacher_id ? (
              <p className="text-xs text-destructive">
                {String(errors.teacher_id.message)}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Teacher will be assigned after course is saved.
              </p>
            )}
          </div>

          {/* Enroll key */}
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
            ) : null}
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
