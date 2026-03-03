"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/auth.queries";
import { setAuthCookie } from "@/lib/api";

export default function CallbackClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const qc = useQueryClient();

  useEffect(() => {
    const token = sp.get("token");
    const error = sp.get("error");

    if (error) {
      router.replace("/login?error=google_failed");
      return;
    }

    if (!token) {
      router.replace("/login?error=missing_token");
      return;
    }

    // simpan token dulu
    setAuthCookie(token);

    // lalu refresh auth state, baru lempar dashboard
    (async () => {
      try {
        await qc.invalidateQueries({ queryKey: authKeys.me });
      } finally {
        router.replace("/dashboard");
      }
    })();
  }, [sp, router, qc]);

  return <p style={{ padding: 24 }}>Signing you in with Google...</p>;
}
