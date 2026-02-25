"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { StudentsTable } from "@/components/students/StudentsTable";
import { StudentFormDialog } from "@/components/students/StudentFormDialog";

import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/features/manage-account/students/students-queries";

import { alertConfirm, alertSuccess, handleApiError } from "@/lib/ui/alerts";

export default function StudentsClient({ initialPaginator }) {
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
      const res = await getStudents({
        page,
        per_page: perPage,
        q,
        sort: "id",
        dir: "asc",
      });
      setPaginator(res?.data ?? null);
    } catch (e) {
      setError(e?.payload?.message || e?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, q]);

  useEffect(() => {
    if (!initialPaginator) fetchList();
  }, [initialPaginator, fetchList]);

  const onCreate = useCallback(
    async (payload, { setFieldError } = {}) => {
      try {
        await createStudent(payload);

        setOpenCreate(false);
        await new Promise((r) => setTimeout(r, 0));

        await alertSuccess({ message: "Akun Student berhasil dibuat." });

        setPage(1);
        const res = await getStudents({
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
        await updateStudent(id, payload);
        await alertSuccess({ message: "Akun Student berhasil diupdate." });
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
        title: "Hapus student?",
        message: `Yakin mau hapus "${row?.name}" (ID ${row?.id})? Ini tidak bisa di-undo.`,
        confirmText: "Ya, hapus",
        cancelText: "Batal",
      });

      if (!ok.isConfirmed) return;

      try {
        await deleteStudent(row.id);
        await alertSuccess({ message: "Akun Student berhasil dihapus." });

        const nextPage = page > 1 && rows.length === 1 ? page - 1 : page;
        setPage(nextPage);

        const res = await getStudents({
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
            <CardTitle>Students</CardTitle>
            <div className="mt-1 text-xs text-muted-foreground">
              Manage accounts with role{" "}
              <span className="font-medium">student</span>.
            </div>
          </div>

          <StudentFormDialog
            mode="create"
            open={openCreate}
            onOpenChange={setOpenCreate}
            onSubmit={onCreate}
            triggerLabel="Create Student"
          />
        </CardHeader>

        <CardContent>
          <StudentsTable
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

      <StudentFormDialog
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
