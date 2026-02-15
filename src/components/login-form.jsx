"use client";

import Link from "next/link";
import { GalleryVerticalEnd, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/features/auth/login-schema";
import { useLogin, useResendVerification } from "@/features/auth/use-auth";

import {
  alertError,
  alertSuccess,
  alertConfirm,
  handleApiError,
} from "@/lib/ui/alerts";

export function LoginForm({ className, ...props }) {
  const router = useRouter();
  const loginMutation = useLogin();
  const resendMutation = useResendVerification();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const emailValue = watch("email") || "";
  const isLoading = loginMutation.isPending;

  async function onSubmit(values) {
    try {
      await loginMutation.mutateAsync(values);
      router.push("/dashboard");
    } catch (e) {
      // ✅ email belum verifikasi (409)
      if (e?.status === 409 && e?.payload?.code === "EMAIL_NOT_VERIFIED") {
        const result = await alertConfirm({
          title: "Email belum diverifikasi",
          message: "Kami bisa kirim ulang link verifikasi ke email kamu.",
          confirmText: "Kirim ulang",
          cancelText: "Nanti",
          icon: "warning",
          reverseButtons: true,
        });

        if (result.isConfirmed) {
          try {
            await resendMutation.mutateAsync(emailValue);

            await alertSuccess({
              title: "Terkirim",
              message: "Link verifikasi sudah dikirim ulang. Cek inbox/spam.",
              confirmText: "OK",
            });
          } catch (err) {
            await alertError({
              title: "Gagal mengirim",
              message: err?.message || "Coba lagi nanti.",
              confirmText: "OK",
            });
          }
        }

        return;
      }

      // ✅ sisanya: 422 / 401 / fallback ditangani helper
      await handleApiError(e, {
        setFieldError: (field, message) =>
          setError(field, { type: "server", message }),
        fallbackMessage: "Terjadi error. Coba lagi.",
        // kalau kamu mau pesan server mentah tampil, set false
        hideServerDetails: true,
      });
    }
  }

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

            <h1 className="text-xl font-bold">Welcome back</h1>

            <FieldDescription>
              Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
            </FieldDescription>
          </div>

          {/* EMAIL */}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              autoComplete="email"
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email?.message && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </Field>

          {/* PASSWORD */}
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                className="pr-10"
                {...register("password")}
              />

              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="mt-2 flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>

            {errors.password?.message && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </Field>

          <Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </Field>

          <FieldSeparator>Or</FieldSeparator>

          <Field className="grid gap-4 sm:grid-cols-1">
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              className="w-full hover:cursor-pointer flex items-center justify-center gap-2"
              onClick={() => {
                window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/redirect`;
              }}
            >
              <span className="inline-flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 424 432"
                  aria-hidden="true"
                  focusable="false"
                  className="shrink-0"
                >
                  <path
                    fill="currentColor"
                    d="M214 186v-1h201q3 12 3 36q0 93-56.5 150.5T213 429q-88 0-150.5-62T0 216T62 65T213 3q87 0 144 57l-57 56q-33-33-86-33q-54 0-92.5 39.5t-38.5 95t38.5 94.5t92.5 39q31 0 55-9.5t37.5-24.5t20.5-29.5t10-27.5H214v-74z"
                  />
                </svg>
              </span>
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
