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

import { useUpdateModule } from "@/features/course-modules/module-queries";
import { alertSuccess, handleApiError } from "@/lib/ui/alerts";

function toIntOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export default function EditModuleDialog({
  courseId,
  module,
  open,
  onOpenChange,
}) {
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState("");

  const updateMutation = useUpdateModule(courseId);

  useEffect(() => {
    if (open && module) {
      setTitle(module.title ?? "");
      setOrder(module.sort_order ? String(module.sort_order) : "");
    }

    if (!open) {
      setTitle("");
      setOrder("");
    }
  }, [open, module]);

  const canSubmit = useMemo(() => {
    const t = title.trim();
    const o = toIntOrNull(order);
    const orderOk = o === null || o >= 1;
    return t.length >= 3 && orderOk && !updateMutation.isPending;
  }, [title, order, updateMutation.isPending]);

  async function submit() {
    try {
      const sort_order = toIntOrNull(order);

      await updateMutation.mutateAsync({
        moduleId: module.id,
        title: title.trim(),
        ...(sort_order !== null ? { sort_order } : {}),
      });

      onOpenChange?.(false);

      await alertSuccess({
        title: "Berhasil",
        message: "Module berhasil diupdate.",
        confirmText: "OK",
      });
    } catch (err) {
      await handleApiError(err, {
        fallbackMessage: "Gagal mengupdate module.",
      });
    }
  }

  return (
    <Dialog open={!!open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Module</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Judul Module
            </div>
            <Input
              placeholder="Contoh: Topik 1. Pengantar"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) submit();
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Urutan (Opsional)
            </div>
            <Input
              type="number"
              min={1}
              placeholder="Contoh: 1"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) submit();
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
