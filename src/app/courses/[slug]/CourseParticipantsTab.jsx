"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCourseParticipants } from "@/features/courses/course-participants-queries";

function fmt(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
}

function RoleBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function AvatarCircle({ name = "?" }) {
  const letter = (name?.trim()?.[0] || "?").toUpperCase();
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted text-xs font-semibold text-muted-foreground">
      {letter}
    </div>
  );
}

export default function CourseParticipantsTab({ courseId }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const { data, isLoading, error, refetch } = useCourseParticipants(courseId, {
    page,
    per_page: perPage,
    q,
  });

  // ✅ If your API returns { data: paginator }
  const paginator = data?.data ?? null;
  const rows = useMemo(() => paginator?.data ?? [], [paginator]);
  const total = paginator?.total ?? 0;
  const lastPage = paginator?.last_page ?? 1;

  const canPrev = page > 1 && !isLoading;
  const canNext = page < lastPage && !isLoading;

  return (
    <div className="space-y-4 py-6">
      {/* Top controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full max-w-xl items-center gap-2">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Search by name or email..."
              className="pl-9"
              disabled={!courseId}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading || !courseId}
          >
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border bg-transparent px-2 text-sm"
            value={String(perPage)}
            onChange={(e) => {
              setPage(1);
              setPerPage(Number(e.target.value));
            }}
            disabled={!courseId}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={String(n)}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {String(error?.message ?? error)}
        </div>
      ) : null}

      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{total}</span>{" "}
        participants
      </div>

      {/* List container */}
      <div className="overflow-hidden rounded-xl border bg-background">
        {/* header */}
        <div className="grid grid-cols-12 border-b bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground">
          <div className="col-span-7">Name</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-3 text-right">Last access</div>
        </div>

        {!courseId ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading course…
          </div>
        ) : isLoading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading participants…
          </div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border">
              <Users className="h-5 w-5" />
            </div>
            No participants found.
            <div className="mt-1 text-xs">
              If you *swear* you enrolled: check `course_enrollments.status` is{" "}
              <span className="font-mono">active</span>, and your request is
              authenticated.
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {rows.map((r) => {
              const name = r.student?.name ?? "-";
              const email = r.student?.email ?? "";
              const role = r.student?.role ?? "-";

              return (
                <div
                  key={r.id}
                  className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/20"
                >
                  <div className="col-span-7 flex items-center gap-3">
                    <AvatarCircle name={name} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {email}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <RoleBadge>{role}</RoleBadge>
                  </div>

                  <div className="col-span-3 text-right text-sm text-muted-foreground">
                    {fmt(r.last_accessed_at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
    </div>
  );
}
