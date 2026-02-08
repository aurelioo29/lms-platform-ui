"use client";

import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { forgotPasswordSchema } from "@/features/auth/forgot-password-schema";
import { useForgotPassword } from "@/features/auth/use-auth";

import { alertSuccess, handleApiError } from "@/lib/ui/alerts";

export function ForgotPasswordForm({ className, ...props }) {
  const router = useRouter();
  const mutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  async function onSubmit(values) {
    try {
      await mutation.mutateAsync(values);

      await alertSuccess({
        title: "Cek Email Kamu",
        message:
          "Link reset password akan berhasil terkirim. Silahkan cek inbox / spam.",
        confirmText: "OK",
      });

      router.replace("/login");
    } catch (e) {
      await handleApiError(e, {
        setFieldError: (field, message) =>
          setError(field, { type: "server", message }),
        fallbackMessage: "Terjadi error. Coba lagi.",
        hideServerDetails: true,
      });
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

            <h1 className="text-xl font-bold">Forgot password?</h1>

            <FieldDescription>
              Masukkan email akun kamu. Kami akan kirim link untuk reset
              password.
            </FieldDescription>
          </div>

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
            {errors.email?.message && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </Field>

          <Field>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send reset link"}
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
