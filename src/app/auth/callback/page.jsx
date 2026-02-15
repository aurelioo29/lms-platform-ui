"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/auth.queries";

function setCookie(name, value, days = 7) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const qc = useQueryClient();

  const token = sp.get("token");
  const error = sp.get("error");

  useEffect(() => {
    if (error) {
      router.replace("/login?error=google_failed");
      return;
    }

    if (!token) return;

    // 1) Save token so apiFetch can read it
    setCookie("auth", token);

    // 2) Refresh /me query so Dashboard immediately has user
    qc.invalidateQueries({ queryKey: authKeys.me });

    // 3) Go to dashboard
    router.replace("/dashboard");
  }, [token, error, router, qc]);

  return <p style={{ padding: 24 }}>Signing you in with Google...</p>;
}
