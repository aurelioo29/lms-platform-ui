"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useEnrollWithKey } from "@/features/enrollments/enrollment-queries";

export default function EnrollDialog({
  open,
  onOpenChange,
  course,
  onSuccess,
}) {
  const [key, setKey] = useState("");
  const enrollMutation = useEnrollWithKey();

  useEffect(() => {
    if (!open) setKey("");
  }, [open, course?.id]);

  async function submit() {
    if (!course?.id) return;

    try {
      await enrollMutation.mutateAsync({
        courseId: course.id,
        enroll_key: key.trim(),
        slug: course.slug,
      });

      await Swal.fire({
        icon: "success",
        title: "Enrolled ✅",
        text: "Welcome to the course. No refunds. (jk)",
        timer: 1300,
        showConfirmButton: false,
      });

      // ✅ tell parent: this course is now enrolled
      onSuccess?.(course.id);

      onOpenChange(false);
    } catch (err) {
      const msg =
        err?.data?.errors?.enroll_key?.[0] ||
        err?.data?.message ||
        err?.message ||
        "Enroll failed. Check your key.";

      Swal.fire({
        icon: "error",
        title: "Enroll failed",
        text: msg,
      });
    }
  }

  const loading = enrollMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll Course</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-sm font-medium">{course?.title ?? "-"}</div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              Enroll Key
            </div>

            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Enter enroll key..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
              />
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
          <Button onClick={submit} disabled={loading || !key.trim()}>
            {loading ? "Enrolling..." : "Enroll"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
