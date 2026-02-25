"use client";

import { useMemo, useState } from "react";
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

// small helper: event -> badge styles
function eventBadgeClass(eventType) {
  const t = String(eventType || "").toLowerCase();

  if (t.includes("login"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (t.includes("logout"))
    return "bg-slate-50 text-slate-700 border-slate-200";
  if (t.includes("password"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (t.includes("forgot"))
    return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (t.includes("delete") || t.includes("remove"))
    return "bg-rose-50 text-rose-700 border-rose-200";

  return "bg-muted text-foreground/80 border-border";
}

function safeStringify(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

export function ActivityLogsTable({
  loading,
  error,
  paginator,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  filters,
  onFiltersChange,
  onRefresh,
}) {
  const rows = useMemo(() => paginator?.data ?? [], [paginator]);
  const total = paginator?.total ?? 0;
  const lastPage = paginator?.last_page ?? 1;

  // track which row meta is expanded (optional UX)
  const [openId, setOpenId] = useState(null);

  function setFilter(key, value) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm font-medium">Filters</div>
          <div className="text-xs text-muted-foreground">
            Narrow down logs by event/user/course.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" onClick={onRefresh} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>

          <select
            className="h-9 rounded-md border bg-transparent px-2 text-sm"
            value={String(perPage)}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
          >
            {[25, 50, 100, 200].map((n) => (
              <option key={n} value={String(n)}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
        <Input
          placeholder="Event type (login, password_reset...)"
          value={filters.event_type}
          onChange={(e) => setFilter("event_type", e.target.value)}
        />
        <Input
          placeholder="User ID"
          inputMode="numeric"
          value={filters.user_id}
          onChange={(e) => setFilter("user_id", e.target.value)}
        />
        <Input
          placeholder="Course ID"
          inputMode="numeric"
          value={filters.course_id}
          onChange={(e) => setFilter("course_id", e.target.value)}
        />
        <Input
          placeholder="From date (YYYY-MM-DD)"
          value={filters.date_from}
          onChange={(e) => setFilter("date_from", e.target.value)}
        />
        <Input
          placeholder="To date (YYYY-MM-DD)"
          value={filters.date_to}
          onChange={(e) => setFilter("date_to", e.target.value)}
        />
      </div>

      {/* Status */}
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <div className="font-medium text-destructive">Error</div>
          <div className="opacity-90">{error}</div>
        </div>
      ) : null}

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[70px]">ID</TableHead>
              <TableHead className="w-[190px]">Time</TableHead>
              <TableHead className="w-[160px]">Event</TableHead>
              <TableHead className="w-[260px]">User</TableHead>
              <TableHead className="w-[90px]">Course</TableHead>
              <TableHead className="w-[120px] text-right">Meta</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                {/* ✅ 6 columns now */}
                <TableCell colSpan={6} className="py-10 text-center text-sm">
                  Loading logs...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm">
                  No logs found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => {
                const userLabel = r.user_name
                  ? `${r.user_name} (ID ${r.user_id})`
                  : `ID ${r.user_id}`;

                const meta = r.meta_json ?? null;
                const isOpen = openId === r.id;

                return (
                  <TableRow key={r.id} className="align-top">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{r.id}
                    </TableCell>

                    <TableCell className="text-xs">
                      <div className="font-medium">
                        {r.created_at_wib ?? "-"}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
                          eventBadgeClass(r.event_type),
                        ].join(" ")}
                      >
                        {r.event_type}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs">
                      <div className="font-medium">{userLabel}</div>
                      {meta?.ip ? (
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          IP: <span className="font-mono">{meta.ip}</span>
                        </div>
                      ) : null}
                    </TableCell>

                    <TableCell className="text-xs">
                      <span className="inline-flex rounded-md bg-muted px-2 py-1 text-[11px]">
                        {r.course_id ?? "-"}
                      </span>
                    </TableCell>

                    <TableCell className="text-right text-xs">
                      {meta ? (
                        <details
                          open={isOpen}
                          onToggle={(e) => {
                            const opened = e.currentTarget.open;
                            setOpenId(opened ? r.id : null);
                          }}
                          className="inline-block text-left"
                        >
                          <summary className="cursor-pointer select-none rounded-md border px-2 py-1 text-[11px] hover:bg-muted">
                            {isOpen ? "Hide" : "View"}
                          </summary>

                          <div className="mt-2 w-[520px] max-w-[80vw] rounded-md border bg-background p-3 shadow-sm">
                            <div className="mb-2 text-[11px] font-medium text-muted-foreground">
                              Meta JSON
                            </div>
                            <pre className="max-h-[220px] overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">
                              {safeStringify(meta)}
                            </pre>
                          </div>
                        </details>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
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
          Total <span className="font-medium text-foreground">{total}</span> •
          Page <span className="font-medium text-foreground">{page}</span> /{" "}
          <span className="font-medium text-foreground">{lastPage}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={loading || page >= lastPage}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
