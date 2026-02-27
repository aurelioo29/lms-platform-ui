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

function formatDate(dt) {
  if (!dt) return "-";

  return new Date(dt).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DiscussionsTable({
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

  onPageChange,
  onPerPageChange,

  onEdit,
  onDelete,
}) {
  const showing = useMemo(() => {
    const from = total === 0 ? 0 : (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);

    return { from, to };
  }, [page, perPage, total]);

  return (
    <div className="space-y-4">
      {/* SEARCH */}

      <div className="flex flex-col md:flex-row md:justify-between gap-3">
        <div className="md:max-w-[420px] w-full">
          <div className="text-sm font-medium">Search</div>

          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Search discussion..."
              value={q}
              onChange={(e) => onQChange(e.target.value)}
            />

            <Button variant="outline" onClick={onRefresh} disabled={loading}>
              Refresh
            </Button>
          </div>

          {error && (
            <div className="mt-2 text-xs border rounded-md p-2 text-destructive">
              {error}
            </div>
          )}
        </div>

        <select
          className="h-9 border rounded-md px-2 text-sm"
          value={String(perPage)}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}/page
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>

              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  Loading discussions...
                </TableCell>
              </TableRow>
            )}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  No discussions found.
                </TableCell>
              </TableRow>
            )}

            {rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-xs">#{d.id}</TableCell>

                <TableCell>
                  <div className="font-medium">{d.title}</div>

                  <div className="text-xs text-muted-foreground">
                    by {d.user?.name}
                  </div>
                </TableCell>

                <TableCell className="text-xs">{d.course?.title}</TableCell>

                <TableCell>
                  <span
                    className={`
                    px-2 py-1 text-xs rounded border
                    ${d.status === "open" && "bg-emerald-50 text-emerald-700"}
                    ${d.status === "locked" && "bg-amber-50 text-amber-700"}
                    ${d.status === "hidden" && "bg-slate-100 text-slate-700"}
                    `}
                  >
                    {d.status}
                  </span>
                </TableCell>

                <TableCell className="text-xs">
                  {formatDate(d.created_at)}
                </TableCell>

                <TableCell className="text-right">
                  <div className="inline-flex gap-2">
                    <Button variant="ghost" onClick={() => onEdit(d)}>
                      <Pencil className="w-4 h-4 text-yellow-500" />
                    </Button>

                    <Button variant="ghost" onClick={() => onDelete(d)}>
                      <CircleX className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}

      <div className="flex justify-between items-center text-sm">
        <div>
          Showing {showing.from}-{showing.to} of {total}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Prev
          </Button>

          <div>
            Page {page} / {lastPage}
          </div>

          <Button
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= lastPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
