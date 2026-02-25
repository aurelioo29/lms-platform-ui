"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  teacherCreateSchema,
  teacherUpdateSchema,
} from "@/features/manage-account/teachers/teachers-schemas";

function zodErrorsToMap(result) {
  const map = {};
  result.error.issues.forEach((i) => {
    const key = i.path?.[0];
    if (!key) return;
    if (!map[key]) map[key] = i.message;
  });
  return map;
}

function generatePassword(length = 12) {
  // campuran huruf besar/kecil + angka + simbol
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  const sym = "!@#$%^&*()-_=+[]{};:,.?";
  const all = lower + upper + nums + sym;

  // pastikan ada minimal 1 dari tiap kategori
  const pick = (s) => s[Math.floor(Math.random() * s.length)];
  let out = [pick(lower), pick(upper), pick(nums), pick(sym)];

  for (let i = out.length; i < length; i++) out.push(pick(all));

  // shuffle
  out = out.sort(() => Math.random() - 0.5);
  return out.join("");
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function TeacherFormDialog({
  mode = "create", // "create" | "edit"
  open,
  onOpenChange,
  triggerLabel,
  initial,
  onSubmit, // (payload, { setFieldError }) => Promise
}) {
  const isEdit = mode === "edit";

  const schema = useMemo(
    () => (isEdit ? teacherUpdateSchema : teacherCreateSchema),
    [isEdit],
  );

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    send_verification: true,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    // reset when opened
    setFieldErrors({});
    setSubmitting(false);

    if (isEdit && initial) {
      setValues({
        name: initial.name ?? "",
        email: initial.email ?? "",
        password: "",
        send_verification: true,
      });
    } else {
      setValues({
        name: "",
        email: "",
        password: "",
        send_verification: true,
      });
    }
  }, [open, isEdit, initial]);

  function setField(key, val) {
    setValues((v) => ({ ...v, [key]: val }));
    setFieldErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setFieldErrors({});
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      setFieldErrors(zodErrorsToMap(parsed));
      return;
    }

    // payload: in edit mode, don't send empty password
    let payload = parsed.data;
    if (isEdit && payload.password === "") {
      const { password, ...rest } = payload;
      payload = rest;
    }

    setSubmitting(true);
    try {
      await onSubmit(payload, {
        setFieldError: (field, message) => {
          setFieldErrors((prev) => ({ ...prev, [field]: message }));
        },
      });
    } finally {
      setSubmitting(false);
    }
  }

  const title = isEdit ? "Edit Teacher" : "Create Teacher";

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Name</label>
        <Input
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
        />
        {fieldErrors.name ? (
          <div className="text-xs text-destructive">{fieldErrors.name}</div>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Email</label>
        <Input
          value={values.email}
          onChange={(e) => setField("email", e.target.value)}
          inputMode="email"
        />
        {fieldErrors.email ? (
          <div className="text-xs text-destructive">{fieldErrors.email}</div>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">
          Password{" "}
          {isEdit ? (
            <span className="text-xs text-muted-foreground">(optional)</span>
          ) : null}
        </label>

        <div className="flex gap-2">
          <Input
            value={values.password}
            onChange={(e) => setField("password", e.target.value)}
            type="text" // supaya admin bisa lihat; kalau mau aman, ganti "password"
            placeholder={
              isEdit ? "Leave empty to keep current" : "Enter password"
            }
          />

          {!isEdit ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setField("password", generatePassword(12))}
              >
                Generate
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setField("password", "Teacher@2026!")} // default template kamu
              >
                Default
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  if (!values.password) return;
                  await copyToClipboard(values.password);
                }}
                disabled={!values.password}
              >
                Copy
              </Button>
            </>
          ) : null}
        </div>

        {fieldErrors.password ? (
          <div className="text-xs text-destructive">{fieldErrors.password}</div>
        ) : null}

        {!isEdit ? (
          <div className="text-[11px] text-muted-foreground">
            Tip: klik <span className="font-medium">Generate</span> buat
            password random yang lebih aman.
          </div>
        ) : null}
      </div>

      {!isEdit ? (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!values.send_verification}
            onChange={(e) => setField("send_verification", e.target.checked)}
          />
          Send verification email
        </label>
      ) : null}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );

  // Create dialog has trigger button in header. Edit dialog is controlled only.
  if (!triggerLabel) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
