"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  GalleryVerticalEnd,
  Loader2,
  ShieldCheck,
  Mail,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { alertError, alertInfo, alertSuccess } from "@/lib/ui/alerts";

// --- utils kecil, aman di client ---
function safeParseJson(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function pickMessage(res, text) {
  const json = safeParseJson(text);
  const msg = json?.message;

  if (msg) return msg;

  if (typeof text === "string" && text.trim() && text.length < 200) {
    return text.trim();
  }

  // fallback by status
  if (res.status === 410) return "Link verifikasi sudah tidak berlaku.";
  if (res.status === 400) return "Link verifikasi tidak valid.";
  if (res.status === 401) return "Link verifikasi invalid / expired.";
  return `Verify failed (${res.status})`;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useSearchParams();

  // loading | success | already | error
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Memverifikasi email…");

  const verifyUrl = useMemo(() => params.get("verify_url"), [params]);

  useEffect(() => {
    const run = async () => {
      if (!verifyUrl) {
        setStatus("error");
        setMessage("Link tidak valid. Parameter verifikasi tidak ditemukan.");

        await alertError({
          title: "Link tidak valid",
          message: "Parameter verifikasi tidak ditemukan.",
        });

        router.replace("/login");
        return;
      }

      try {
        setStatus("loading");
        setMessage("Menghubungi server verifikasi…");

        const res = await fetch(verifyUrl, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        const text = await res.text();
        const msg = pickMessage(res, text);

        // ✅ sudah verified / dianggap expired (410)
        if (res.status === 410) {
          setStatus("already");
          setMessage(msg);

          await alertInfo({
            title: "Akun sudah aktif",
            message: msg || "Email kamu sudah terverifikasi. Silakan login.",
            confirmText: "Ke Halaman Login",
          });

          router.replace("/login");
          return;
        }

        // ✅ sukses
        if (res.ok) {
          setStatus("success");
          setMessage("Email berhasil diverifikasi. Mengarahkan ke login…");

          await alertSuccess({
            title: "Email terverifikasi",
            message: msg || "Verifikasi email berhasil. Silakan login.",
            confirmText: "Ke Halaman Login",
          });

          router.replace("/login");
          return;
        }

        // ❌ error lain
        throw new Error(msg);
      } catch (err) {
        setStatus("error");
        setMessage(err?.message || "Link verifikasi invalid / expired.");

        await alertError({
          title: "Gagal verifikasi",
          message: err?.message || "Link verifikasi invalid / expired.",
          confirmText: "Ke Halaman Login",
        });

        router.replace("/login");
      }
    };

    run();
  }, [verifyUrl, router]);

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background to-muted/40" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border bg-background/80 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="p-6">
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

                <h1 className="text-xl font-bold">Verify Email</h1>
                <p className="text-sm text-muted-foreground">
                  Kami cek dulu email kamu, biar akun aman.
                </p>
              </div>

              <div className="mt-6 rounded-xl border bg-background p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {status === "loading" && (
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    )}

                    {status === "success" && (
                      <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    )}

                    {status === "already" && (
                      <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    )}

                    {status === "error" && (
                      <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {status === "loading"
                        ? "Verifikasi berjalan"
                        : status === "success"
                          ? "Berhasil"
                          : status === "already"
                            ? "Sudah aktif"
                            : "Gagal"}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {message}
                    </p>

                    {status === "loading" && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        Jangan tutup tab ini dulu.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Kembali ke Login
                </Link>

                <span className="text-xs text-muted-foreground">
                  Secure access • LMS Platform
                </span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Secure access • LMS Platform
          </p>
        </div>
      </div>
    </div>
  );
}
