"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { studentSchema } from "@/features/manage-account/students/student-schema";
import { alertInfo } from "@/lib/ui/alerts";

// util: generate random password (simple but decent)
function generatePassword(len = 12) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()_+-=";
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function StudentFormDialog({
  mode = "create", // "create" | "edit"
  open,
  onOpenChange,
  initial,
  onSubmit,
  triggerLabel = "Create Student",
}) {
  const isEdit = mode === "edit";

  const defaultValues = useMemo(
    () => ({
      name: initial?.name ?? "",
      email: initial?.email ?? "",
      password: "",
      use_generic_password: false,
    }),
    [initial],
  );

  const form = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const useGeneric = watch("use_generic_password");
  const passwordValue = watch("password");

  // reset form when dialog open/close or initial changes
  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
  }, [open, reset, defaultValues]);

  // helpers for backend validation mapping
  function setFieldError(field, message) {
    setError(field, { type: "server", message: message || "Invalid" });
  }

  async function submit(values) {
    // normalize payload
    const payload = {
      name: values.name?.trim(),
      email: values.email?.trim(),
      password: (values.password ?? "").trim(),
      use_generic_password: !!values.use_generic_password,
    };

    // kalau generic true dan password kosong, backend akan handle.
    // tapi biar lebih “jelas” UI, kita biarkan schema yang ngejaga.

    await onSubmit?.(payload, { setFieldError });
  }

  const title = isEdit ? "Edit Student" : "Create Student";
  const desc = isEdit
    ? "Update akun student. Password opsional jika tidak ingin diganti."
    : "Buat akun student baru.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Trigger hanya dipakai kalau mode create biasanya */}
      {isEdit ? null : (
        <DialogTrigger asChild>
          <Button type="button">{triggerLabel}</Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Nama student" {...register("name")} />
            {errors.name ? (
              <p className="text-xs text-destructive">
                {String(errors.name.message)}
              </p>
            ) : null}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="email@student.com"
              autoComplete="off"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">
                {String(errors.email.message)}
              </p>
            ) : null}
          </div>

          {/* Password row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password">Password</Label>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-2 text-xs"
                  onClick={() => {
                    const pw = generatePassword(12);
                    setValue("password", pw, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  disabled={isSubmitting}
                >
                  Generate
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-2 text-xs"
                  onClick={async () => {
                    const pw = (passwordValue || "").trim();
                    if (!pw) {
                      await alertInfo({
                        title: "Belum ada password",
                        message:
                          "Generate dulu atau ketik password, baru bisa dicopy.",
                      });
                      return;
                    }
                    await navigator.clipboard.writeText(pw);
                    await alertInfo({
                      title: "Copied",
                      message: "Password sudah dicopy ke clipboard.",
                    });
                  }}
                  disabled={isSubmitting}
                >
                  Copy
                </Button>
              </div>
            </div>

            <Input
              id="password"
              type="text"
              placeholder={
                useGeneric
                  ? "Generic password aktif (opsional isi)"
                  : "Minimal 8 karakter"
              }
              {...register("password")}
              disabled={isSubmitting}
            />

            {errors.password ? (
              <p className="text-xs text-destructive">
                {String(errors.password.message)}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                {isEdit
                  ? "Kalau kosong, password tidak berubah (kecuali kamu aktifkan generic)."
                  : "Isi password atau aktifkan generic password."}
              </p>
            )}
          </div>

          {/* Generic password toggle */}
          {/* <div className="flex items-start gap-3 rounded-md border p-3">
            <Checkbox
              id="use_generic_password"
              checked={!!useGeneric}
              onCheckedChange={(v) => {
                const checked = v === true;
                setValue("use_generic_password", checked, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              disabled={isSubmitting}
            />
            <div className="space-y-1">
              <Label htmlFor="use_generic_password" className="cursor-pointer">
                Use generic password
              </Label>
              <p className="text-xs text-muted-foreground">
                Kalau aktif dan password kosong, backend akan set default.
              </p>
              <p className="text-[11px] text-muted-foreground">
                (Saran: tetap generate random untuk keamanan. Generic itu… ya
                generic.)
              </p>
            </div>
          </div> */}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
