"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useCreateCourse } from "@/features/courses/courses-queries";

// ✅ pakai helpers kamu
import { alertSuccess, handleApiError } from "@/lib/ui/alerts";

function toIntOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export default function CreateCourseModal({ open, onOpenChange, onCreated }) {
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(""); // ✅ NEW: order input (string)

  const createMutation = useCreateCourse();

  useEffect(() => {
    if (!open) {
      setTitle("");
      setOrder("");
    }
  }, [open]);

  const canSubmit = useMemo(() => {
    const t = title.trim();
    const o = toIntOrNull(order);
    const orderOk = o === null || o >= 1; // optional, tapi kalau diisi harus >= 1
    return t.length >= 3 && orderOk && !createMutation.isPending;
  }, [title, order, createMutation.isPending]);

  async function submit() {
    try {
      const orderInt = toIntOrNull(order);

      const res = await createMutation.mutateAsync({
        title: title.trim(),
        description: null,
        status: "draft",
        ...(orderInt !== null ? { sort_order: orderInt } : {}),
      });

      // ✅ 1) close dialog dulu
      onOpenChange(false);

      // ✅ 2) tunggu 1 frame biar dialog ke-unmount
      await new Promise((r) => setTimeout(r, 50));

      // ✅ 3) baru munculin alert
      await alertSuccess({
        title: "Created",
        message: "Course created. Now go make it actually good.",
        confirmText: "OK",
      });

      onCreated?.(res);
    } catch (err) {
      await handleApiError(err, {
        fallbackMessage: "Create course failed.",
      });
    }
  }

  const loading = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Course Module</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Title
            </div>
            <Input
              placeholder="e.g. Computer Vision 101"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) submit();
              }}
            />
          </div>

          {/* Order / Urutan */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">
                Order / Urutan (Optional)
              </div>
              <div className="text-[11px] text-muted-foreground">
                Angka kecil tampil duluan
              </div>
            </div>

            <Input
              type="number"
              min={1}
              placeholder="e.g. 1"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) submit();
              }}
            />

            <div className="text-[11px] text-muted-foreground">
              Kosongkan kalau nggak peduli urutan.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
