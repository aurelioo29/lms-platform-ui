"use client";

import { useCallback, useMemo, useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeachersTable } from "@/components/teachers/TeachersTable";
import { TeacherFormDialog } from "@/components/teachers/TeacherFormDialog";

import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "@/features/manage-account/teachers/teachers-queries";

import { alertConfirm, alertSuccess, handleApiError } from "@/lib/ui/alerts";

function pickPaginator(res) {
  return res?.data?.data ? res.data : (res?.data ?? res ?? null);
}

export default function TeachersClient({ initialPaginator }) {
  const [paginator, setPaginator] = useState(initialPaginator);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // filters
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [q, setQ] = useState("");

  // dialog
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(() => paginator?.data ?? [], [paginator]);
  const total = paginator?.total ?? 0;
  const lastPage = paginator?.last_page ?? 1;

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTeachers({
        page,
        per_page: perPage,
        q,
        sort: "id",
        dir: "asc",
      });
      setPaginator(res?.data ?? null);
    } catch (e) {
      setError(e?.payload?.message || e?.message || "Failed to load teachers");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, q]);

  useEffect(() => {
    if (!initialPaginator) fetchList();
  }, [initialPaginator, fetchList]);

  // Actions
  const onCreate = useCallback(
    async (payload, { setFieldError } = {}) => {
      try {
        await createTeacher(payload);

        // ✅ tutup dialog dulu biar overlay hilang
        setOpenCreate(false);

        // ✅ tunggu 1 tick biar DOM update (optional tapi sering bikin “langsung beres”)
        await new Promise((r) => setTimeout(r, 0));

        await alertSuccess({
          message: "Akun Teacher(Pengajar) berhasil dibuat.",
        });

        setPage(1);
        const res = await getTeachers({
          page: 1,
          per_page: perPage,
          q,
          sort: "id",
          dir: "asc",
        });
        setPaginator(res?.data ?? null);
      } catch (e) {
        await handleApiError(e, { setFieldError });
      }
    },
    [perPage, q],
  );

  const onEdit = useCallback(
    async (id, payload, { setFieldError } = {}) => {
      try {
        await updateTeacher(id, payload);
        await alertSuccess({
          message: "Akun Teacher (Pengajar) berhasil diupdate.",
        });
        setOpenEdit(false);
        setEditing(null);
        await fetchList();
      } catch (e) {
        await handleApiError(e, { setFieldError });
      }
    },
    [fetchList],
  );

  const onDelete = useCallback(
    async (row) => {
      const ok = await alertConfirm({
        title: "Hapus teacher?",
        message: `Yakin mau hapus "${row?.name}" (ID ${row?.id})? Ini tidak bisa di-undo.`,
        confirmText: "Ya, hapus",
        cancelText: "Batal",
      });

      if (!ok.isConfirmed) return;

      try {
        await deleteTeacher(row.id);
        await alertSuccess({
          message: "Akun Teacher (Pengajar) berhasil dihapus.",
        });

        // keep page valid
        const nextPage = page > 1 && rows.length === 1 ? page - 1 : page;
        setPage(nextPage);
        const res = await getTeachers({
          page: nextPage,
          per_page: perPage,
          q,
          sort: "id",
          dir: "asc",
        });
        setPaginator(res?.data ?? null);
      } catch (e) {
        await handleApiError(e);
      }
    },
    [page, perPage, q, rows.length],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Teachers</CardTitle>
            <div className="mt-1 text-xs text-muted-foreground">
              Manage accounts with role{" "}
              <span className="font-medium">teacher</span>.
            </div>
          </div>

          <TeacherFormDialog
            mode="create"
            open={openCreate}
            onOpenChange={setOpenCreate}
            onSubmit={onCreate}
            triggerLabel="Create Teacher"
          />
        </CardHeader>

        <CardContent>
          <TeachersTable
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
            onEdit={(row) => {
              setEditing(row);
              setOpenEdit(true);
            }}
            onDelete={onDelete}
          />
        </CardContent>
      </Card>

      <TeacherFormDialog
        mode="edit"
        open={openEdit}
        onOpenChange={(v) => {
          setOpenEdit(v);
          if (!v) setEditing(null);
        }}
        initial={editing}
        onSubmit={(payload, helpers) => onEdit(editing?.id, payload, helpers)}
      />
    </div>
  );
}
