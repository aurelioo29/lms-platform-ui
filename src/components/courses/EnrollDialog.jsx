"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EnrollDialog({
  open,
  onOpenChange,
  courseTitle,
  isLoading,
  onSubmit,
}) {
  const [key, setKey] = useState("");

  useEffect(() => {
    if (!open) setKey("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Enroll Course</DialogTitle>
          <DialogDescription>
            Masukkan enrollment key untuk:{" "}
            <span className="font-medium text-foreground">{courseTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Enrollment Key</label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="contoh: ABCD1234"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Key ini dari admin / instructor. Jangan pakai “feeling”.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => onSubmit(key)}
              disabled={isLoading || !key.trim()}
            >
              {isLoading ? "Enrolling..." : "Enroll"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
