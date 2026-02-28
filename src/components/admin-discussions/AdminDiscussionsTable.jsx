"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Lock, Unlock } from "lucide-react";

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

function formatDateWIB(dt) {
  if (!dt) return "-";
  return new Date(dt).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function bodyPreview(bodyJson) {
  try {
    // quill delta: { ops: [{ insert: "text" }, ...] }
    const ops = bodyJson?.ops || [];
    const text = ops
      .map((o) => (typeof o.insert === "string" ? o.insert : ""))
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    return text ? text.slice(0, 80) + (text.length > 80 ? "…" : "") : "-";
  } catch {
    return "-";
  }
}

export function AdminDiscussionsTable({
  loading,
  error,
  rows,
  page,
  perPage,
  total,
  lastPage,
  q,
  onQChange,
  onRefresh,
  onPerPageChange,
  onPageChange,
  onToggleLock,
}) {
  const canPrev = page > 1 && !loading;
  const canNext = page < lastPage && !loading;

  const showing = useMemo(() => {
    const from = total === 0 ? 0 : (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);
    return { from, to };
  }, [page, perPage, total]);

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:max-w-[520px]">
          <div className="text-sm font-medium">Search</div>
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="Search by title or ID..."
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

        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border bg-transparent px-2 text-sm"
            value={String(perPage)}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={String(n)}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="w-[260px]">Course</TableHead>
              <TableHead className="w-[220px]">Created By</TableHead>
              <TableHead>Title</TableHead>
              {/* <TableHead className="w-[260px]">Body</TableHead> */}
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[210px]">Created</TableHead>
              <TableHead className="w-[210px]">Updated</TableHead>
              <TableHead className="w-[110px] text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-sm">
                  Loading discussions...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-sm">
                  No discussions found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => {
                const course = r.course;
                const user = r.user;
                const locked = r.status === "locked";

                return (
                  <TableRow key={r.id} className="align-top">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{r.id}
                    </TableCell>

                    <TableCell className="text-xs">
                      {course?.slug ? (
                        <Link
                          href={`/courses/${r.course?.slug}?tab=discussion&discussion_id=${r.id}`}
                          className="block hover:underline"
                        >
                          <div className="font-medium">{r.course?.title}</div>
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell className="text-xs">
                      <div className="font-medium">{user?.name || "-"}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground font-mono">
                        {user?.email || `user_id: ${r.user_id}`}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs">
                      <div className="font-medium">{r.title || "-"}</div>
                      {/* <div className="mt-1 text-[11px] text-muted-foreground">
                        course_id:{" "}
                        <span className="font-mono">{r.course_id}</span> •
                        user_id: <span className="font-mono">{r.user_id}</span>
                      </div> */}
                    </TableCell>

                    {/* <TableCell className="text-xs text-muted-foreground">
                      {bodyPreview(r.body_json)}
                    </TableCell> */}

                    <TableCell className="text-xs">
                      {locked ? (
                        <span className="inline-flex rounded-full border bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                          locked
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                          open
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs">
                      {formatDateWIB(r.created_at)}
                    </TableCell>

                    <TableCell className="text-xs">
                      {formatDateWIB(r.updated_at)}
                    </TableCell>

                    <TableCell className="text-right">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
                        onClick={() => onToggleLock(r)}
                        title={locked ? "Unlock" : "Lock"}
                        aria-label={locked ? "Unlock" : "Lock"}
                      >
                        {locked ? (
                          <Unlock className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Lock className="h-4 w-4 text-amber-600" />
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {showing.from}-{showing.to}
          </span>{" "}
          of <span className="font-medium text-foreground">{total}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canPrev}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </Button>
          <div className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> /{" "}
            <span className="font-medium text-foreground">{lastPage}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={!canNext}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
