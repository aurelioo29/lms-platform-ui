"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import QuillEditor from "@/components/editors/QuillEditor";

import { discussionSchema } from "@/features/discussions/discussion-schema";

import { alertError } from "@/lib/ui/alerts";

export function DiscussionFormDialog({
  mode = "create",
  open,
  onOpenChange,
  onSubmit,

  triggerLabel,

  initial,
  courses = [],
}) {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [status, setStatus] = useState("open");

  const [body, setBody] = useState(null);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!initial) return;

    setTitle(initial.title || "");
    setCourseId(initial.course_id || "");
    setStatus(initial.status || "open");
    setBody(initial.body_json || null);
  }, [initial]);

  function setFieldError(field, msg) {
    setErrors((prev) => ({
      ...prev,
      [field]: msg,
    }));
  }

  async function submit() {
    try {
      const payload = {
        course_id: Number(courseId),
        title,
        body_json: body,
        status,
      };

      discussionSchema.parse(payload);

      await onSubmit(payload, { setFieldError });
    } catch (e) {
      if (e.errors) {
        const msgs = e.errors.map((x) => x.message);

        alertError({
          messages: msgs,
        });
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerLabel && (
        <DialogTrigger asChild>
          <Button>{triggerLabel}</Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Discussion" : "Edit Discussion"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* COURSE */}

          <div>
            <div className="text-sm font-medium">Course</div>

            <select
              className="w-full border rounded-md h-10 px-2"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">Select Course</option>

              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* TITLE */}

          <div>
            <div className="text-sm font-medium">Title</div>

            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* BODY */}

          <div>
            <div className="text-sm font-medium">Body</div>

            <QuillEditor
              value={body}
              onChange={(html, delta, src, editor) => {
                setBody(editor.getContents());
              }}
            />
          </div>

          {/* STATUS */}

          <div>
            <div className="text-sm font-medium">Status</div>

            <select
              className="w-full border rounded-md h-10 px-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="open">Open</option>

              <option value="locked">Locked</option>

              <option value="hidden">Hidden</option>
            </select>
          </div>

          {/* ACTIONS */}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button onClick={submit}>Save Discussion</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
