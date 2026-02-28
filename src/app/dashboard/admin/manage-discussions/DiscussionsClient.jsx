"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { AdminDiscussionsTable } from "@/components/admin-discussions/AdminDiscussionsTable";

import {
  getAdminDiscussions,
  toggleDiscussionLock,
} from "@/features/admin-discussions/admin-discussions-queries";

import { alertConfirm, alertSuccess, handleApiError } from "@/lib/ui/alerts";

export default function DiscussionsClient({ initialPaginator }) {
  const [paginator, setPaginator] = useState(initialPaginator);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // filters
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [q, setQ] = useState("");

  const rows = useMemo(() => paginator?.data ?? [], [paginator]);
  const total = paginator?.total ?? 0;
  const lastPage = paginator?.last_page ?? 1;

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminDiscussions({
        page,
        per_page: perPage,
        q,
      });
      setPaginator(res?.data ?? null);
    } catch (e) {
      setError(
        e?.payload?.message || e?.message || "Failed to load discussions",
      );
    } finally {
      setLoading(false);
    }
  }, [page, perPage, q]);

  useEffect(() => {
    if (!initialPaginator) fetchList();
  }, [initialPaginator, fetchList]);

  const onToggleLock = useCallback(
    async (row) => {
      const nextLocked = row.status !== "locked";

      const ok = await alertConfirm({
        title: nextLocked ? "Lock discussion?" : "Unlock discussion?",
        message: `Discussion: "${row?.title}" (ID ${row?.id})`,
        confirmText: nextLocked ? "Yes, lock" : "Yes, unlock",
        cancelText: "Cancel",
      });

      if (!ok.isConfirmed) return;

      try {
        await toggleDiscussionLock(row.id);
        await alertSuccess({
          message: nextLocked ? "Discussion locked." : "Discussion unlocked.",
        });
        await fetchList();
      } catch (e) {
        await handleApiError(e);
      }
    },
    [fetchList],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>List Discussions</CardTitle>
            <div className="mt-1 text-xs text-muted-foreground">
              Admin overview of all discussion posts. Action:{" "}
              <span className="font-medium">Lock / Unlock</span>.
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <AdminDiscussionsTable
            loading={loading}
            error={error}
            rows={rows}
            page={page}
            perPage={perPage}
            total={total}
            lastPage={lastPage}
            q={q}
            onQChange={(v) => {
              setPage(1);
              setQ(v);
            }}
            onRefresh={fetchList}
            onPerPageChange={(n) => {
              setPage(1);
              setPerPage(n);
            }}
            onPageChange={setPage}
            onToggleLock={onToggleLock}
          />
        </CardContent>
      </Card>
    </div>
  );
}
