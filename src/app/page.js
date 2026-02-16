import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  CalendarDays,
  GraduationCap,
  ShieldCheck,
  Users,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Kalender Tahunan",
    desc: "Lihat agenda pelatihan setahun penuh, rapi dan bisa dipantau semua role.",
  },
  {
    icon: GraduationCap,
    title: "Online Courses",
    desc: "Employee join course, instructor upload materi, semua kebaca progress-nya.",
  },
  {
    icon: BarChart3,
    title: "Training Hours",
    desc: "Rekap jam pelatihan otomatis — cocok buat laporan, audit, dan evaluasi.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Role-Based",
    desc: "Akses terkontrol: Director, Head Dept, Instructor, Employee, Superadmin.",
  },
];

const steps = [
  {
    title: "Setup role & akun",
    desc: "Bikin struktur akses sesuai organisasi. Nggak ada lagi ‘kok aku bisa edit semua?’",
  },
  {
    title: "Susun kalender & course",
    desc: "Head Training atur event, instructor siapin materi, employee tinggal join.",
  },
  {
    title: "Pantau progress & jam",
    desc: "Dashboard nunjukin progress course dan total training hours tanpa Excel ritual.",
  },
];

const roles = [
  {
    title: "Director",
    points: ["View annual calendar", "View training hours (global)"],
  },
  {
    title: "Head of Training",
    points: [
      "Create events",
      "Manage instructors",
      "TOR submissions",
      "View hours",
    ],
  },
  {
    title: "Instructor",
    points: ["Self-register", "View schedule", "Manage teaching content"],
  },
  {
    title: "Employee",
    points: ["Join courses", "Track own progress", "View annual calendar"],
  },
  {
    title: "Superadmin",
    points: ["Toggle editing on/off (the power button)", "Full system control"],
  },
];

function Background() {
  return (
    <>
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
    </>
  );
}

function Section({ id, title, kicker, children }) {
  return (
    <section id={id} className="scroll-mt-24 py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="mb-8 md:mb-10">
          {kicker ? (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              {kicker}
            </div>
          ) : null}
          {title ? (
            <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              {title}
            </h2>
          ) : null}
        </div>

        {children}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <Background />

      <div className="relative">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
            <Link href="/" className="flex items-center gap-3">
              <div className="rounded-xl border bg-background/70 p-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/50">
                <Image
                  src="/images/logo-email.png"
                  alt="LMS Platform"
                  width={28}
                  height={28}
                  priority
                />
              </div>
              <span className="text-sm font-semibold tracking-tight">
                LMS Platform
              </span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Fitur
              </Link>
              <Link
                href="#how"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cara Kerja
              </Link>
              <Link
                href="#roles"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Role
              </Link>
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Masuk
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground md:hidden"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
              >
                Mulai Gratis <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="py-14 md:py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-2 md:px-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Modern • Premium • Simple
              </div>

              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                Stop pindah-pindah sistem.
                <span className="text-primary"> Atur semuanya</span> di satu
                tempat.
              </h1>

              <p className="max-w-xl text-pretty text-base leading-7 text-muted-foreground md:text-lg">
                LMS yang fokus: kalender tahunan, course online, jam pelatihan,
                dan laporan. Kalau bisa dibuat sederhana, ngapain dipersulit.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-foreground/90"
                >
                  Mulai Gratis <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex h-11 items-center justify-center rounded-full border bg-background/60 px-6 text-sm font-medium backdrop-blur transition hover:bg-background/80"
                >
                  Lihat fitur
                </Link>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Secure access
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> Role-based
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4" /> Audit-friendly
                </span>
              </div>
            </div>

            {/* Preview card */}
            <div className="relative">
              <div className="rounded-2xl border bg-background/70 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/50">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Dashboard Preview</p>
                      <p className="text-xs text-muted-foreground">
                        Calendar • Courses • Training Hours
                      </p>
                    </div>
                    <span className="rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                      Live
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border bg-background/60 p-3">
                      <p className="text-xs text-muted-foreground">
                        Training Hours
                      </p>
                      <p className="mt-2 text-2xl font-semibold">128</p>
                      <p className="text-xs text-muted-foreground">This year</p>
                    </div>
                    <div className="rounded-xl border bg-background/60 p-3">
                      <p className="text-xs text-muted-foreground">Courses</p>
                      <p className="mt-2 text-2xl font-semibold">24</p>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                    <div className="col-span-2 rounded-xl border bg-background/60 p-3">
                      <p className="text-xs text-muted-foreground">
                        Next Session
                      </p>
                      <p className="mt-2 font-medium">
                        Patient Safety • 09:00 - 11:00
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Instructor: Dr. A • Room: Lab 2
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <Section
          id="features"
          kicker="Core Features"
          title="Semua yang kamu butuh, tanpa ribet"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border bg-background/70 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/50"
                >
                  <div className="mb-3 inline-flex rounded-xl border bg-background/60 p-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* HOW IT WORKS */}
        <Section id="how" kicker="Flow" title="Cara kerja yang manusiawi">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {steps.map((s, idx) => (
              <div
                key={s.title}
                className="rounded-2xl border bg-background/70 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/50"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background/60 text-sm font-semibold">
                    {idx + 1}
                  </span>
                  <h3 className="text-base font-semibold">{s.title}</h3>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ROLES */}
        <Section
          id="roles"
          kicker="Access Control"
          title="Role-based, biar aman dan nggak chaos"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {roles.map((r) => (
              <div
                key={r.title}
                className="rounded-2xl border bg-background/70 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/50"
              >
                <h3 className="text-base font-semibold">{r.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <Section
          id="cta"
          kicker="Ready?"
          title="Mulai sekarang, biar besok nggak panik"
        >
          <div className="rounded-2xl border bg-background/70 p-6 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/50 md:p-8">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">
                  LMS yang fokus, cepat, dan rapi.
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Buat sistem training yang bisa dipakai semua orang, bukan cuma
                  yang “kuat mental”.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:bg-foreground/90"
                >
                  Mulai Gratis <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-full border bg-background/60 px-6 text-sm font-medium backdrop-blur transition hover:bg-background/80"
                >
                  Masuk
                </Link>
              </div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="border-t bg-background/40 py-10 backdrop-blur">
          <div className="mx-auto max-w-6xl px-6 md:px-10">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} LMS Platform • Built for clarity, not
              confusion.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
