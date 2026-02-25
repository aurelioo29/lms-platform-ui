"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useMe } from "@/features/auth/use-auth";
import { getActivityLogs } from "@/features/activity-logs/activity-logs-queries";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLogsTable } from "@/components/activity-logs-table";

export default function ActivityLogsClient() {
  const router = useRouter();

  // React Query: { data, isLoading, error }
  const { data: meData, isLoading: meLoading, error: meError } = useMe();
  const user = meData?.user ?? null;

  // DEV guard
  useEffect(() => {
    if (meLoading) return;

    // Not logged in
    if (!user) {
      router.replace("/login");
      return;
    }

    // Not developer
    if (user.role !== "developer") {
      router.replace("/dashboard");
      return;
    }
  }, [user, meLoading, router]);

  // state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(50);

  const [filters, setFilters] = useState({
    event_type: "",
    user_id: "",
    course_id: "",
    ref_type: "",
    ref_id: "",
    date_from: "",
    date_to: "",
  });

  const [paginator, setPaginator] = useState(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState(null);

  const queryParams = useMemo(() => {
    return {
      page,
      per_page: perPage,
      ...Object.fromEntries(
        Object.entries(filters).filter(
          ([_, v]) => String(v || "").trim() !== "",
        ),
      ),
    };
  }, [page, perPage, filters]);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    setLogsError(null);

    try {
      const res = await getActivityLogs(queryParams);
      setPaginator(res?.data ?? null);
    } catch (e) {
      setLogsError(e?.payload?.message || e?.message || "Failed to load logs");
    } finally {
      setLoadingLogs(false);
    }
  }, [queryParams]);

  useEffect(() => {
    if (meLoading) return;
    if (!user) return;
    if (user.role !== "developer") return;

    fetchLogs();
  }, [meLoading, user, fetchLogs]);

  // render guards
  if (meLoading) return null;
  if (meError) return null;
  if (!user || user.role !== "developer") return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>

        <CardContent>
          <ActivityLogsTable
            loading={loadingLogs}
            error={logsError}
            paginator={paginator}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={(n) => {
              setPage(1);
              setPerPage(n);
            }}
            filters={filters}
            onFiltersChange={(next) => {
              setPage(1);
              setFilters(next);
            }}
            onRefresh={fetchLogs}
          />
        </CardContent>
      </Card>
    </div>
  );
}
