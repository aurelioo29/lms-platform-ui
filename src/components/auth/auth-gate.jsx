"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMe } from "@/features/auth/use-auth";

function ShieldIllustration() {
  return (
    <svg
      viewBox="0 0 400 260"
      className="h-36 w-auto"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* soft blob */}
      <path
        d="M319 82c27 36 22 90-6 123-28 33-79 46-122 42-43-5-77-27-98-56-22-29-31-65-18-96 13-31 48-57 89-69 41-12 88-9 115 6 27 15 40 41 40 50Z"
        className="fill-muted/40"
      />
      {/* shield */}
      <path
        d="M200 42c46 26 82 25 82 25v74c0 56-33 92-82 112-49-20-82-56-82-112V67s36 1 82-25Z"
        className="fill-background"
      />
      <path
        d="M200 42c46 26 82 25 82 25v74c0 56-33 92-82 112-49-20-82-56-82-112V67s36 1 82-25Z"
        className="stroke-border"
        strokeWidth="2"
      />
      {/* check */}
      <path
        d="M170 140l18 18 44-48"
        className="stroke-foreground"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* rings */}
      <circle
        cx="200"
        cy="130"
        r="78"
        className="stroke-muted-foreground/20"
        strokeWidth="2"
      />
      <circle
        cx="200"
        cy="130"
        r="104"
        className="stroke-muted-foreground/10"
        strokeWidth="2"
      />
    </svg>
  );
}

function Dots() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/70" />
    </div>
  );
}

export function AuthGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading } = useMe();
  const user = data?.user;

  useEffect(() => {
    if (!isLoading && !user) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50">
        {/* background */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-background" />

        {/* content */}
        <div className="relative grid h-full place-items-center p-6">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border bg-card/70 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-col items-center text-center gap-3">
                <ShieldIllustration />

                <div className="space-y-1">
                  <div className="text-lg font-semibold">
                    Checking authentication
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Verifying your session and permissions. Hang tight.
                  </div>
                </div>

                <div className="pt-2">
                  <Dots />
                </div>
              </div>
            </div>

            {/* tiny footer line */}
            <div className="mt-3 text-center text-xs text-muted-foreground">
              LMS Platform • Secure session check
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return children;
}
