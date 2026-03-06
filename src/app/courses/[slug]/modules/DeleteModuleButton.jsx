"use client";

import { Trash2 } from "lucide-react";
import { useDeleteModule } from "@/features/course-modules/module-queries";
import { alertConfirm, alertSuccess, handleApiError } from "@/lib/ui/alerts";

export default function DeleteModuleButton({
  courseId,
  moduleId,
  moduleTitle,
  iconOnly = false,
}) {
  const deleteMutation = useDeleteModule(courseId);

  async function onDelete() {
    const result = await alertConfirm({
      title: "Hapus module?",
      message: `Module "${moduleTitle}" akan dihapus. Aksi ini tidak bisa dibatalkan.`,
      confirmText: "Ya, hapus",
      cancelText: "Batal",
      icon: "warning",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMutation.mutateAsync(moduleId);

      await alertSuccess({
        title: "Berhasil",
        message: "Module berhasil dihapus.",
        confirmText: "Oke",
      });
    } catch (err) {
      await handleApiError(err, {
        fallbackMessage: "Gagal menghapus module.",
      });
    }
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={onDelete}
        disabled={deleteMutation.isPending}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-destructive/10 disabled:opacity-50"
        aria-label={`Delete module ${moduleTitle}`}
        title="Delete module"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={deleteMutation.isPending}
      className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-destructive/10 disabled:opacity-50"
    >
      Delete
    </button>
  );
}
