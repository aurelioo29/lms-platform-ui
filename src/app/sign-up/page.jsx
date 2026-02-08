import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      {/* Base gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background to-muted/40" />

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Glow blobs */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Content */}
      <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm">
          {/* Premium card wrapper */}
          <div className="rounded-2xl border bg-background/80 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="p-6">
              <SignupForm />
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
