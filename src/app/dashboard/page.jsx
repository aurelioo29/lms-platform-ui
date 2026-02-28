// app/dashboard/page.jsx
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/features/auth/use-auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import {
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  Sparkles,
} from "lucide-react";

function formatHoursLeft(hours) {
  if (hours <= 1) return "1 hr";
  if (hours < 24) return `${hours} hrs`;
  const days = Math.ceil(hours / 24);
  return `${days} day${days > 1 ? "s" : ""}`;
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function PriorityPill({ label, variant = "secondary" }) {
  // You can map to your own rules later
  const styles =
    variant === "danger"
      ? "bg-red-50 text-red-700 border-red-100"
      : variant === "warn"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-slate-50 text-slate-700 border-slate-100";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles}`}
    >
      {label}
    </span>
  );
}

function CourseThumb({ tone = "lavender" }) {
  // Simple decorative thumbnail block (swap with next/image later)
  const bg =
    tone === "mint"
      ? "bg-emerald-50"
      : tone === "sky"
        ? "bg-sky-50"
        : tone === "amber"
          ? "bg-amber-50"
          : "bg-violet-50";

  const iconBg =
    tone === "mint"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "sky"
        ? "bg-sky-100 text-sky-700"
        : tone === "amber"
          ? "bg-amber-100 text-amber-700"
          : "bg-violet-100 text-violet-700";

  return (
    <div
      className={`relative flex h-14 w-20 items-center justify-center overflow-hidden rounded-xl border ${bg}`}
    >
      <div className={`rounded-lg p-2 ${iconBg}`}>
        <GraduationCap className="h-4 w-4" />
      </div>
      <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/40" />
      <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-white/40" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useMe();

  const user = data?.user;

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  // Mock data — replace later with real API results
  const { inProgress, newEnrollment } = useMemo(() => {
    return {
      inProgress: [
        {
          id: 1,
          title: "Mastering UI/UX Design: A Guide to Better Interfaces",
          materials: 5,
          completion: null, // null means not started
          deadlineHours: 24,
          tone: "sky",
          cta: "Start",
        },
        {
          id: 2,
          title: "Creating Engaging Learning Journeys for Modern Teams",
          materials: 12,
          completion: 64,
          deadlineHours: 12,
          tone: "mint",
          cta: "Continue",
        },
      ],
      newEnrollment: [
        {
          id: 101,
          title: "Enhancing Learning Engagement Through Thoughtful UI/UX",
          materials: 10,
          tone: "lavender",
          tags: ["Prototyping", "Not Urgent"],
        },
        {
          id: 102,
          title: "UI/UX 101 — For Beginners to be Great and Good Designer",
          materials: 7,
          tone: "amber",
          tags: ["Prototyping", "Not Urgent"],
        },
        {
          id: 103,
          title: "Mastering UI Design for Impactful Experiences",
          materials: 12,
          tone: "sky",
          tags: ["Prototyping", "Not Urgent"],
        },
      ],
    };
  }, []);

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!user) return null;

  const greeting = getTimeGreeting();

  return (
    <div className="w-full">
      {/* Page container */}
      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* Top header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-[22px] font-semibold tracking-tight sm:text-2xl">
              {greeting},{" "}
              <span className="inline-flex items-center gap-1">
                {user.name} <span aria-hidden>👋</span>
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome to our Learning Management System Platform!
            </p>

            <div className="pt-2 text-xs text-muted-foreground">
              You login as a{" "}
              <span className="font-medium text-foreground">{user.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push("/dashboard/profile")}
            >
              <BookOpen className="h-4 w-4" />
              My Learning
            </Button>
          </div>
        </div>

        {/* Feature banner */}
        <Card className="mt-6 border-emerald-100 bg-emerald-50/60">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Badge className="bg-emerald-600 hover:bg-emerald-600">New</Badge>
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-700" />
                  <p className="text-sm font-semibold">Feature Discussion</p>
                </div>
                <p className="mt-1 text-sm text-emerald-900/80">
                  Learning content now has a “Feature Discussion” to explain the
                  material problem chat.
                </p>
              </div>
            </div>

            <Button
              className="gap-2 self-start sm:self-auto"
              variant="outline"
              onClick={() => router.push("/dashboard/discussions")}
            >
              Go to detail <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* In progress section */}
        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">
                In progress learning content
              </h2>
              <span className="text-xs text-muted-foreground">ⓘ</span>
            </div>
            <Button
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={() => router.push("/dashboard/courses")}
            >
              View all
            </Button>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="hidden grid-cols-[1.4fr_.7fr_.6fr_.7fr_auto] items-center gap-4 border-b bg-muted/30 px-4 py-3 text-xs font-medium text-muted-foreground sm:grid">
                <div>Course</div>
                <div>Content</div>
                <div>Completion</div>
                <div>Deadline</div>
                <div />
              </div>

              <div className="divide-y">
                {inProgress.map((item) => {
                  const deadlineLabel = formatHoursLeft(item.deadlineHours);
                  const isDanger = item.deadlineHours <= 12;

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[1.4fr_.7fr_.6fr_.7fr_auto] sm:items-center sm:gap-4"
                    >
                      {/* Course */}
                      <div className="flex items-center gap-3">
                        <CourseThumb tone={item.tone} />
                        <div className="min-w-0">
                          <div className="text-xs text-muted-foreground">
                            Course
                          </div>
                          <div className="truncate text-sm font-semibold">
                            {item.title}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex items-center justify-between sm:block">
                        <div className="text-xs text-muted-foreground sm:mb-1">
                          Content
                        </div>
                        <div className="text-sm font-medium">
                          {item.materials} Material
                        </div>
                      </div>

                      {/* Completion */}
                      <div className="flex items-center justify-between sm:block">
                        <div className="text-xs text-muted-foreground sm:mb-2">
                          Completion
                        </div>
                        {typeof item.completion === "number" ? (
                          <div className="flex items-center gap-3">
                            <div className="w-28">
                              <Progress value={item.completion} />
                            </div>
                            <div className="text-sm font-medium">
                              {item.completion}%
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">-</div>
                        )}
                      </div>

                      {/* Deadline */}
                      <div className="flex items-center justify-between sm:block">
                        <div className="text-xs text-muted-foreground sm:mb-1">
                          Deadline
                        </div>
                        <div
                          className={`inline-flex items-center gap-2 text-sm font-medium ${
                            isDanger ? "text-red-600" : "text-foreground"
                          }`}
                        >
                          <Clock className="h-4 w-4" />
                          {deadlineLabel}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="pt-1 sm:pt-0">
                        <Button
                          className="w-full sm:w-auto"
                          onClick={() =>
                            router.push(`/dashboard/courses/${item.id}`)
                          }
                        >
                          {item.cta}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New enrollment */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">New enrollment</h2>
              <span className="text-xs text-muted-foreground">ⓘ</span>
            </div>
            <Button
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={() => router.push("/dashboard/enroll")}
            >
              View all
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {newEnrollment.map((item) => (
              <Card
                key={item.id}
                className="group overflow-hidden transition hover:shadow-md"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant="secondary" className="text-[11px]">
                      {item.materials} materials
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <CourseThumb tone={item.tone} />
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground">
                        Course
                      </div>
                      <div className="line-clamp-2 text-sm font-semibold">
                        {item.title}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex flex-wrap gap-2">
                    {item.tags?.map((t, idx) => (
                      <PriorityPill
                        key={`${item.id}-${idx}`}
                        label={t}
                        variant={
                          t.toLowerCase().includes("urgent")
                            ? "warn"
                            : "secondary"
                        }
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    className="mt-4 w-full gap-2"
                    onClick={() => router.push(`/dashboard/courses/${item.id}`)}
                  >
                    View course <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* small decorative footer bar */}
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-muted to-transparent opacity-60" />
              </Card>
            ))}
          </div>
        </div>

        {/* Footer spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
