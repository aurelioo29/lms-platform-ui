"use client";

import { useMemo } from "react";
import { Pencil, CircleX } from "lucide-react";

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

export function StudentsTable({
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
  onEdit,
  onDelete,
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
        <div className="w-full md:max-w-[420px]">
          <div className="text-sm font-medium">Search</div>
          <div className="mt-2 flex gap-2">
            <Input
              placeholder="Search by name or email..."
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
              <TableHead className="w-[260px]">User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[180px]">Verified</TableHead>
              <TableHead className="w-[210px]">Created</TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm">
                  Loading students...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm">
                  No students found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id} className="align-top">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{r.id}
                  </TableCell>

                  <TableCell className="text-xs">
                    <div className="font-medium">{r.name || "-"}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Role: <span className="font-mono">{r.role}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs">
                    <div className="font-mono">{r.email}</div>
                  </TableCell>

                  <TableCell className="text-xs">
                    {r.email_verified_at ? (
                      <span className="inline-flex rounded-full border bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                        Not verified
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs">
                    {r.created_at ? formatDateWIB(r.created_at) : "-"}
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
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
                        onClick={() => onDelete(r)}
                        title="Delete"
                        aria-label="Delete"
                      >
                        <CircleX className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
