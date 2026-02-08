"use client";

import Link from "next/link";
import { GalleryVerticalEnd, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/features/auth/reset-password-schema";
import { useResetPassword } from "@/features/auth/use-auth";
import { getPasswordStrength } from "@/lib/password-strength";

import { alertError, alertSuccess, handleApiError } from "@/lib/ui/alerts";

export function ResetPasswordForm({ className, ...props }) {
  const router = useRouter();
  const params = useSearchParams();
  const mutation = useResetPassword();

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const token = useMemo(() => params.get("token") || "", [params]);
  const email = useMemo(() => params.get("email") || "", [params]);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    setValue("token", token);
    setValue("email", email);
  }, [token, email, setValue]);

  const password = watch("password") || "";
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  async function onSubmit(values) {
    try {
      await mutation.mutateAsync(values);

      await alertSuccess({
        title: "Password berhasil direset",
        message: "Silakan login menggunakan password baru kamu.",
        confirmText: "Ke Login",
      });

      router.replace("/login");
    } catch (e) {
      // 422 validation → tampilkan popup + set error per field
      if (e?.status === 422) {
        await handleApiError(e, {
          setFieldError: (field, message) =>
            setError(field, { type: "server", message }),
          fallbackMessage: "Data belum valid. Coba periksa lagi.",
          hideServerDetails: true,
        });
        return;
      }

      // selain 422: token invalid/expired, dll
      await alertError({
        title: "Gagal reset password",
        message: e?.message || "Link reset invalid/expired. Minta link baru.",
        confirmText: "OK",
      });

      router.replace("/forgot-password");
    }
  }

  const isLoading = mutation.isPending;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">LMS Platform</span>
            </Link>

            <h1 className="text-xl font-bold">Reset password</h1>

            <FieldDescription>
              Atur password baru untuk akun{" "}
              <span className="font-medium">{email || "..."}</span>
            </FieldDescription>
          </div>

          {/* token/email hidden */}
          <input type="hidden" {...register("token")} />
          <input type="hidden" {...register("email")} />

          {/* PASSWORD */}
          <Field>
            <FieldLabel htmlFor="password">New password</FieldLabel>

            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground cursor-pointer hover:bg-muted/60 disabled:opacity-50"
                aria-label={showPass ? "Hide password" : "Show password"}
              >
                {showPass ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Strength */}
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Password strength
                  </p>
                  <p className="text-xs font-medium">{strength.label}</p>
                </div>

                <div className="mt-1 h-2 w-full rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      strength.className,
                    )}
                    style={{ width: `${strength.bar}%` }}
                  />
                </div>

                {strength.hints.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {strength.hints.slice(0, 2).map((h) => (
                      <li key={h}>• {h}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {errors.password?.message && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </Field>

          {/* CONFIRM */}
          <Field>
            <FieldLabel htmlFor="password_confirmation">
              Confirm password
            </FieldLabel>

            <div className="relative">
              <Input
                id="password_confirmation"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                className="pr-10"
                {...register("password_confirmation")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground cursor-pointer hover:bg-muted/60 disabled:opacity-50"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {errors.password_confirmation?.message && (
              <p className="text-sm text-destructive">
                {errors.password_confirmation.message}
              </p>
            )}
          </Field>

          <Field>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save new password"}
            </Button>
          </Field>

          <div className="text-center text-sm">
            <Link
              href="/login"
              className="underline underline-offset-4 text-muted-foreground hover:text-foreground"
            >
              Back to login
            </Link>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
