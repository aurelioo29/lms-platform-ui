"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import CourseCard from "@/components/courses/CourseCard";
import EnrollDialog from "@/components/courses/EnrollDialog";
import {
  useEnrollWithKey,
  usePublishedCourses,
} from "@/features/courses/courses-queries";

function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-3 w-[65%]" />
          </div>
        </div>

        <Skeleton className="h-16 w-full rounded-xl" />

        <div className="flex gap-2 pt-1">
          <Skeleton className="h-9 flex-1 rounded-md" />
        </div>
      </CardContent>

      <div className="h-1 w-full bg-gradient-to-r from-transparent via-muted to-transparent opacity-60" />
    </Card>
  );
}

export default function CoursesClient({ initialQuery = "" }) {
  const [q, setQ] = useState(initialQuery);
  const debouncedQ = useDebouncedValue(q, 350);

  const queryParam = useMemo(() => {
    const trimmed = debouncedQ?.trim();
    return trimmed ? trimmed : undefined;
  }, [debouncedQ]);

  const {
    data: courses = [],
    isLoading,
    isError,
    error,
  } = usePublishedCourses({
    q: queryParam,
  });

  const enrollMutation = useEnrollWithKey();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <div className="w-full">
      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* ===== Header (Title left, Search right) ===== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              List All Courses
            </h1>
            <p className="text-sm text-muted-foreground">
              Browse published courses and enroll using an enrollment key.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-[11px]">
                Published only
              </Badge>
              <Badge variant="outline" className="text-[11px]">
                Total: {isLoading ? "…" : courses.length}
              </Badge>
            </div>
          </div>

          {/* Right: Search */}
          <div className="w-full sm:w-auto">
            <div className="relative w-full sm:w-[360px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search course title..."
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* ===== Error ===== */}
        {isError ? (
          <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
            <div className="font-semibold text-red-800">
              Failed to load courses
            </div>
            <div className="mt-1 text-red-800/80">
              {error?.message || "Unknown error"}
            </div>
          </div>
        ) : null}

        {/* ===== Grid ===== */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))
            : courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={(c) => {
                    setSelected(c);
                    setOpen(true);
                  }}
                />
              ))}
        </div>

        {/* ===== Empty ===== */}
        {!isLoading && courses.length === 0 ? (
          <Card className="mt-10">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border bg-muted/20">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-sm font-semibold">No courses found</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Try a different keyword, or ask admin to publish some courses.
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* ===== Enroll Modal ===== */}
        <EnrollDialog
          open={open}
          onOpenChange={setOpen}
          courseTitle={selected?.title || "-"}
          isLoading={enrollMutation.isPending}
          onSubmit={async (enroll_key) => {
            if (!selected) return;

            try {
              await enrollMutation.mutateAsync({
                courseId: selected.id,
                enroll_key,
              });

              setOpen(false);
              alert("Enrolled successfully ✅");
            } catch (e) {
              const msg =
                e?.data?.errors?.enroll_key?.[0] ||
                e?.data?.enroll_key?.[0] ||
                e?.message ||
                "Enroll failed";

              alert(msg);
            }
          }}
        />
      </div>
    </div>
  );
}
