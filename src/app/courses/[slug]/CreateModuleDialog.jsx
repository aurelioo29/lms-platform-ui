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

export default function CreateModuleDialog({ courseId }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState("");

  const createModule = useCreateModule(courseId);

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
    return t.length >= 3 && orderOk && !createModule.isPending;
  }, [title, order, createModule.isPending]);

  async function submit() {
    try {
      const sort_order = toIntOrNull(order);

      await createModule.mutateAsync({
        title: title.trim(),
        ...(sort_order !== null ? { sort_order } : {}),
      });

      // ✅ Tutup dialog dulu biar ga tabrakan sama swal
      setOpen(false);

      await alertSuccess({
        title: "Berhasil",
        message: "Module berhasil dibuat. Sekarang isi lesson-nya",
        confirmText: "OK",
      });
    } catch (e) {
      await handleApiError(e, { fallbackMessage: "Gagal membuat module." });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>+ Create Module</Button>

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
              placeholder="contoh: Topik 1. Pengantar"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground">
                Urutan (opsional)
              </div>
              <div className="text-[11px] text-muted-foreground">
                angka kecil tampil duluan
              </div>
            </div>

            <Input
              type="number"
              min={1}
              placeholder="contoh: 1"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createModule.isPending}
          >
            Batal
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {createModule.isPending ? "Membuat..." : "Buat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
