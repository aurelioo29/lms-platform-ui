"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MoreHorizontal, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { getMyCourses } from "@/features/my-courses/my-courses-queries";

// Optional helper
function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `Edited ${day}d ago`;
  if (hr > 0) return `Edited ${hr}h ago`;
  if (min > 0) return `Edited ${min}m ago`;
  return "Edited just now";
}

function ProgressRing({ value = 0 }) {
  // value: 0..100
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = 10;
  const stroke = 3;
  const c = 2 * Math.PI * radius;
  const offset = c - (v / 100) * c;

  return (
    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span>Completed:</span>
      <div className="inline-flex items-center gap-1.5">
        <svg width="26" height="26" viewBox="0 0 26 26" className="block">
          <circle
            cx="13"
            cy="13"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth={stroke}
          />
          <circle
            cx="13"
            cy="13"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 13 13)"
          />
        </svg>
        <span className="font-medium text-foreground">{v}%</span>
      </div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
      {children}
    </span>
  );
}

function CourseCard({ course, onOpen }) {
  const c = course?.course ?? course; // kalau nested pakai course.course
  const title = c?.title ?? "-";
  const assignedCount = course?.assigned_count ?? 1;
  const category = course?.category ?? "Design";
  const urgency = course?.urgency ?? "Not Urgent";
  const progress = course?.progress_percent ?? 0;
  const editedAt =
    course?.updated_at ?? course?.last_accessed_at ?? course?.created_at;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group overflow-hidden rounded-xl border bg-background text-left shadow-sm transition hover:shadow-md"
      title={title}
    >
      {/* cover */}
      <div className="relative h-28 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-sky-200 to-amber-200" />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] text-white">
          <span className="font-medium">{assignedCount}</span> Assigned
        </div>
      </div>

      {/* body */}
      <div className="p-4">
        <div className="line-clamp-2 text-base font-semibold leading-snug group-hover:underline">
          {title}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge>{category}</Badge>
          <Badge>{urgency}</Badge>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background hover:bg-muted"
              title="Enroll / Invite"
              aria-label="Enroll / Invite"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <UserPlus className="h-4 w-4" />
            </button>

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background hover:bg-muted"
              title="More"
              aria-label="More"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {timeAgo(editedAt)}
          </div>
          <ProgressRing value={progress} />
        </div>
      </div>
    </button>
  );
}

export default function MyCoursesClient({ initialPaginator }) {
  const router = useRouter();

  const [paginator, setPaginator] = useState(initialPaginator);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters (clean: cuma search + pagination + sort)
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest | title_asc | title_desc

  const rows = useMemo(() => paginator?.data ?? [], [paginator]);
  const total = paginator?.total ?? 0;
  const lastPage = paginator?.last_page ?? 1;

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyCourses({
        page,
        per_page: perPage,
        q,
        sort, // pastikan backend terima, kalau belum ya ignore aman
      });
      setPaginator(res?.data ?? null);
    } catch (e) {
      setError(e?.payload?.message || e?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, q, sort]);

  useEffect(() => {
    if (!initialPaginator) fetchList();
  }, [initialPaginator, fetchList]);

  const canPrev = page > 1 && !loading;
  const canNext = page < lastPage && !loading;

  const onOpenCourse = (row) => {
    const c = row?.course ?? row; // nested safe
    const slug = c?.slug;

    if (!slug) return; // optional: bisa alert kalau mau
    router.push(`/courses/${slug}`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>My Courses</CardTitle>
              <div className="mt-1 text-xs text-muted-foreground">
                All list courses you’re enrolled in.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                className="h-9 rounded-md border bg-transparent px-2 text-sm"
                value={sort}
                onChange={(e) => {
                  setPage(1);
                  setSort(e.target.value);
                }}
              >
                <option value="newest">Date (Newest)</option>
                <option value="oldest">Date (Oldest)</option>
                <option value="title_asc">Title (A–Z)</option>
                <option value="title_desc">Title (Z–A)</option>
              </select>

              <select
                className="h-9 rounded-md border bg-transparent px-2 text-sm"
                value={String(perPage)}
                onChange={(e) => {
                  setPage(1);
                  setPerPage(Number(e.target.value));
                }}
              >
                {[8, 12, 16, 24].map((n) => (
                  <option key={n} value={String(n)}>
                    {n}/page
                  </option>
                ))}
              </select>

              <Button
                type="button"
                variant="outline"
                onClick={fetchList}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>

          {/* ✅ clean header like your reference: "X content" + search */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{total}</span>{" "}
              content
            </div>

            <div className="w-full md:max-w-[420px]">
              <Input
                placeholder="Search..."
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading courses...
            </div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No courses found. Either you’re not enrolled… or you’re living
              peacefully. Hard to say.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rows.map((c) => (
                <CourseCard
                  key={c.id}
                  course={c}
                  onOpen={() => onOpenCourse(c)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{page}</span> /{" "}
              <span className="font-medium text-foreground">{lastPage}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!canPrev}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!canNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
