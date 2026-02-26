"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import QuillEditor from "@/components/editors/QuillEditor"; // adjust path
import { useCreateDiscussion } from "@/features/discussions/discussions-queries";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

// OPTIONAL toast (use whatever you already have)
// import { toast } from "sonner";

function formatSeconds(sec) {
  const s = Math.max(0, Math.floor(sec));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

export default function CreateDiscussionDialog({
  courseId,
  disabled,
  cooldownSeconds,
  onCooldownSet, // (seconds) => void
  onCreated, // (discussion) => void
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [bodyJson, setBodyJson] = useState(null);

  const createMutation = useCreateDiscussion(courseId);

  const canSubmit = useMemo(() => {
    const tOk = title.trim().length >= 3;
    // Quill delta usually has ops. Keep it permissive.
    const bOk = bodyJson && (bodyJson.ops?.length ?? 0) > 0;
    return tOk && bOk && !createMutation.isPending;
  }, [title, bodyJson, createMutation.isPending]);

  // Reset when opened/closed (optional)
  useEffect(() => {
    if (!open) {
      setTitle("");
      setBodyJson(null);
    }
  }, [open]);

  const submit = async () => {
    try {
      const payload = {
        title: title.trim(),
        body_json: bodyJson,
      };

      const created = await createMutation.mutateAsync(payload);

      // toast?.success("Post created"); // optional
      onCreated?.(created);
      setOpen(false);
    } catch (err) {
      // apiFetch usually throws Error(string), so we can parse if you include JSON
      // BUT simplest: handle cooldown based on known shape if you throw structured error.
      //
      // If your apiFetch returns the response JSON on error, great.
      // If not, upgrade apiFetch later. For now, handle 429 using err?.status if you have it.

      const status = err?.status;
      const retry = err?.retry_after_seconds;

      if (status === 429 && typeof retry === "number") {
        onCooldownSet?.(retry);
        // toast?.error(`Cooldown active. Try again in ${formatSeconds(retry)}`);
        return;
      }

      // toast?.error(String(err?.message ?? err));
      console.error(err);
    }
  };

  const btnLabel =
    cooldownSeconds > 0
      ? `Cooldown ${formatSeconds(cooldownSeconds)}`
      : "Add a post";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="gap-2"
          disabled={disabled || cooldownSeconds > 0}
        >
          <Plus className="h-4 w-4" />
          {btnLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a discussion post</DialogTitle>
          <DialogDescription>
            Ask a question about the course. Keep it clear so people can
            actually help you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. I don’t understand hashing vs encryption"
            />
            <div className="text-xs text-muted-foreground">
              Min 3 characters. (Yes, “help” counts, but please don’t.)
            </div>
          </div>

          <div className="space-y-2">
            <Label>Body</Label>
            <QuillEditor value={bodyJson} onChange={setBodyJson} height={260} />
            <div className="text-xs text-muted-foreground">
              Tip: include what you tried + where you got stuck.
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={!canSubmit}>
            {createMutation.isPending ? "Posting..." : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
