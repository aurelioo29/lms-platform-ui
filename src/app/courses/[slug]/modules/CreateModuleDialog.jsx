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

import { useCreateModule } from "@/features/course-modules/module-queries";
import { alertSuccess, handleApiError } from "@/lib/ui/alerts";

function toIntOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function nextTick() {
  return new Promise((r) => setTimeout(r, 0));
}

export default function CreateModuleDialog({ courseId, open, onOpenChange }) {
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState("");

  const createMutation = useCreateModule(courseId);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setOrder("");
    }
  }, [open]);

  const canSubmit = useMemo(() => {
    const t = title.trim();
    const o = toIntOrNull(order);
    const orderOk = o === null || o >= 1;
    return t.length >= 3 && orderOk && !createMutation.isPending;
  }, [title, order, createMutation.isPending]);

  async function submit() {
    try {
      const orderInt = toIntOrNull(order);

      const payload = {
        title: title.trim(),
        ...(orderInt !== null ? { sort_order: orderInt } : {}),
      };

      await createMutation.mutateAsync(payload);

      onOpenChange?.(false);
      await nextTick();

      await alertSuccess({
        title: "Berhasil",
        message: "Module berhasil dibuat. Sekarang isi lesson-nya.",
        confirmText: "OK",
      });
    } catch (err) {
      await handleApiError(err, {
        fallbackMessage: "Gagal membuat module.",
      });
    }
  }

  const loading = createMutation.isPending;

  return (
    <Dialog open={!!open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Module</DialogTitle>
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
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">
                Urutan (Opsional)
              </div>
              <div className="text-[11px] text-muted-foreground">
                Urutan module pada course content.
              </div>
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

            <div className="text-[11px] text-muted-foreground">
              Kosongkan kalau tidak peduli dengan urutan.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={loading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="cursor-pointer"
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
