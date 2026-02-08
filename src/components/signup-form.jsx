"use client";

import Link from "next/link";
import { GalleryVerticalEnd, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
import { registerSchema } from "@/features/auth/register-schema";
import { useRegister } from "@/features/auth/use-auth";
import { getPasswordStrength } from "@/lib/password-strength";

import { alertError, alertSuccess, handleApiError } from "@/lib/ui/alerts";

export function SignupForm({ className, ...props }) {
  const router = useRouter();
  const registerMutation = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // kalau mau tetap munculin error merah per field, set ke true
  const SHOW_INLINE_ERRORS = false;

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
    mode: "onSubmit",
  });

  const nameValue = watch("name") || "";
  const password = watch("password") || "";
  const confirm = watch("password_confirmation") || "";

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const isTypingPassword = password.length > 0;
  const isTypingName = nameValue.length > 0;
  const isTypingConfirm = confirm.length > 0;

  const confirmMatch =
    password.length > 0 && confirm.length > 0 && password === confirm;

  const isLoading = registerMutation.isPending || isSubmitting;

  async function onInvalid(clientErrors) {
    const list = [];

    if (clientErrors?.name?.message) list.push(clientErrors.name.message);
    if (clientErrors?.email?.message) list.push(clientErrors.email.message);
    if (clientErrors?.password?.message)
      list.push(clientErrors.password.message);
    if (clientErrors?.password_confirmation?.message)
      list.push(clientErrors.password_confirmation.message);

    if (list.length === 0) list.push("Form belum valid. Coba periksa lagi.");

    // ✅ tidak ada label frontend/backend
    await alertError({
      title: "Periksa input kamu",
      messages: list,
      confirmText: "Oke",
    });
  }

  async function onSubmit(values) {
    try {
      await registerMutation.mutateAsync(values);

      await alertSuccess({
        title: "Akun berhasil dibuat",
        message:
          "Kami sudah mengirim link verifikasi ke email kamu. Silakan verifikasi dulu, lalu login.",
        confirmText: "OK",
      });

      router.push("/login");
    } catch (e) {
      // ✅ satu pintu untuk semua error API
      await handleApiError(e, {
        // optional: tetap kasih error state ke field (kalau nanti mau inline)
        setFieldError: (field, message) =>
          setError(field, { type: "server", message }),
        hideServerDetails: true, // ✅ ini yang mencegah pesan backend mentah seperti rule password
        fallbackMessage: "Gagal registrasi. Coba lagi.",
      });
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
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

            <h1 className="text-xl font-bold">Create your account</h1>

            <FieldDescription>
              Already have an account? <Link href="/login">Sign in</Link>
            </FieldDescription>
          </div>

          {/* NAME */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="name">Name (Max 50 characters)</FieldLabel>
              {isTypingName && (
                <span className="text-xs text-muted-foreground">
                  {nameValue.length}/50
                </span>
              )}
            </div>

            <Input
              id="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              disabled={isLoading}
              {...register("name")}
            />

            {SHOW_INLINE_ERRORS && errors.name?.message && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </Field>

          {/* EMAIL */}
          <Field>
            <FieldLabel htmlFor="email">Email address</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              autoComplete="email"
              disabled={isLoading}
              {...register("email")}
            />
            {SHOW_INLINE_ERRORS && errors.email?.message && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </Field>

          {/* PASSWORD */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              {isTypingPassword && (
                <span className="text-xs text-muted-foreground">
                  {password.length}/24
                </span>
              )}
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground cursor-pointer hover:bg-muted/60 disabled:opacity-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              8–24 karakter. Disarankan kombinasi huruf besar, angka, simbol.
            </p>

            {isTypingPassword && (
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

            {SHOW_INLINE_ERRORS && errors.password?.message && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </Field>

          {/* CONFIRM PASSWORD */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password_confirmation">
                Confirm password
              </FieldLabel>

              {isTypingConfirm && (
                <span
                  className={cn(
                    "text-xs",
                    confirmMatch ? "text-emerald-600" : "text-muted-foreground",
                  )}
                >
                  {confirmMatch ? "Match" : "Not match"}
                </span>
              )}
            </div>

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

            {SHOW_INLINE_ERRORS && errors.password_confirmation?.message && (
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
              {isLoading ? "Creating..." : "Create Account"}
            </Button>
          </Field>

          <p className="text-center text-xs text-muted-foreground">
            By creating an account, you agree to our Terms & Privacy Policy.
          </p>
        </FieldGroup>
      </form>
    </div>
  );
}
