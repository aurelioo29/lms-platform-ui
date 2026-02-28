"use client";

import { useMemo } from "react";
import { Pencil, Archive, Copy } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

function StatusPill({ status }) {
  if (status === "published") {
    return (
      <span className="inline-flex rounded-full border bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
        Published
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span className="inline-flex rounded-full border bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
        Draft
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700">
      Archived
    </span>
  );
}

// ✅ Normalize instructors from any possible key
function getInstructors(course) {
  const raw =
    course?.courseInstructors ??
    course?.course_instructors ??
    course?.instructors ??
    [];

  return Array.isArray(raw) ? raw : [];
}

function getInstructorName(ci) {
  return (
    ci?.instructor?.name ??
    ci?.user?.name ?? // fallback kalau BE pernah pakai "user"
    null
  );
}

function roleLabel(role) {
  if (role === "assistant") return "Assistant";
  return "Main";
}

export function CoursesTable({
  loading,
  error,
  rows,
  status,
  q,
  onStatusChange,
  onQChange,
  onRefresh,
  onEdit,
  onArchive,
}) {
  const filtered = useMemo(() => rows ?? [], [rows]);

  async function copy(text) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:max-w-[520px]">
          <div className="text-sm font-medium">Search</div>
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="Search by title..."
              value={q}
              onChange={(e) => onQChange(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>

          {error ? (
            <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["all", "draft", "published", "archived"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStatusChange(s)}
              className={[
                "h-9 rounded-md border px-3 text-sm",
                status === s ? "bg-muted font-medium" : "hover:bg-muted/50",
              ].join(" ")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="w-[300px]">Course</TableHead>
              <TableHead className="w-[190px]">Enroll Key</TableHead>
              <TableHead className="w-[160px]">Status</TableHead>
              <TableHead className="w-[220px]">Teachers</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm">
                  Loading courses...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm">
                  No courses found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => {
                const keyPlain = r.enroll_key_plain;
                const hasPlainKey = !!keyPlain;

                const instructors = getInstructors(r)
                  // ✅ buang yang ga punya nama sama sekali
                  .map((ci) => ({
                    id: ci?.id,
                    name: getInstructorName(ci),
                    role: ci?.role ?? "main",
                  }))
                  .filter((x) => !!x.name);

                return (
                  <TableRow key={r.id} className="align-top">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{r.id}
                    </TableCell>

                    <TableCell className="text-xs">
                      <Link
                        href={`/courses/${r.slug}`}
                        className="font-medium hover:underline"
                      >
                        {r.title || "-"}
                      </Link>
                      {r.description ? (
                        <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                          {r.description}
                        </div>
                      ) : (
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          No description.
                        </div>
                      )}
                    </TableCell>

                    {/* Enroll Key column */}
                    <TableCell className="text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-mono">
                          {keyPlain ? keyPlain : "—"}
                        </div>

                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted disabled:opacity-50"
                          disabled={!hasPlainKey}
                          onClick={() => copy(keyPlain)}
                          title={
                            hasPlainKey
                              ? "Copy enroll key"
                              : "No enroll key set"
                          }
                          aria-label="Copy enroll key"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs">
                      <StatusPill status={r.status} />
                    </TableCell>

                    {/* ✅ Teachers */}
                    <TableCell>
                      {instructors.length === 0 ? (
                        <span className="text-[11px] text-muted-foreground">
                          No teachers assigned
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {instructors.map((t, idx) => (
                            <span
                              key={`${r.id}-ci-${t.id ?? idx}`}
                              className="inline-flex items-center gap-1 rounded-full bg-muted/20 px-2 py-0.5 text-[11px]"
                            >
                              {t.name}
                              <span className="rounded border px-1 text-[10px]">
                                {roleLabel(t.role)}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
                          onClick={() => onEdit(r)}
                          title="Edit"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4 text-amber-500" />
                        </button>

                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted disabled:opacity-50"
                          onClick={() => onArchive(r)}
                          disabled={r.status === "archived"}
                          title="Archive"
                          aria-label="Archive"
                        >
                          <Archive className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
