"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CoursesTable } from "@/components/courses/CoursesTable";
import { CourseFormDialog } from "@/components/courses/CourseFormDialog";

import {
  useAdminCourses,
  useCreateCourse,
  useUpdateCourse,
  usePublishCourse,
  useArchiveCourse,
} from "@/features/courses/courses-queries";

import { alertConfirm, alertSuccess, handleApiError } from "@/lib/ui/alerts";

export default function CoursesClient({ initialList = null }) {
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPublish, setOpenPublish] = useState(false);

  const [editing, setEditing] = useState(null);
  const [publishing, setPublishing] = useState(null);

  const params = useMemo(
    () => ({
      status: status === "all" ? undefined : status,
      q: q || undefined,
    }),
    [status, q],
  );

  const { data: listData, isLoading, error, refetch } = useAdminCourses(params);

  const createMut = useCreateCourse();
  const updateMut = useUpdateCourse();
  const publishMut = usePublishCourse();
  const archiveMut = useArchiveCourse();

  const rows = useMemo(() => {
    const d = listData;
    if (d && Array.isArray(d.data)) return d.data;
    if (Array.isArray(d)) return d;
    return initialList ?? [];
  }, [listData, initialList]);

  const uiError = useMemo(() => {
    if (!error) return null;
    return (
      error?.payload?.message || error?.message || "Failed to load courses"
    );
  }, [error]);

  const loading =
    isLoading ||
    createMut.isPending ||
    updateMut.isPending ||
    publishMut.isPending ||
    archiveMut.isPending;

  const fetchList = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // ✅ Create: hide dialog first so SweetAlert is clickable
  const onCreate = useCallback(
    async (payload, { setFieldError } = {}) => {
      try {
        await createMut.mutateAsync(payload);

        setOpenCreate(false);
        await new Promise((r) => setTimeout(r, 0));

        await alertSuccess({ message: "Course berhasil dibuat." });
        await fetchList();
      } catch (e) {
        setOpenCreate(false);
        await new Promise((r) => setTimeout(r, 0));

        await handleApiError(e, { setFieldError });

        // optional re-open
        setOpenCreate(true);
        await new Promise((r) => setTimeout(r, 0));
      }
    },
    [createMut, fetchList],
  );

  const onEdit = useCallback(
    async (id, payload, { setFieldError } = {}) => {
      try {
        await updateMut.mutateAsync({ id, payload });
        await alertSuccess({ message: "Course berhasil diupdate." });
        setOpenEdit(false);
        setEditing(null);
        await fetchList();
      } catch (e) {
        await handleApiError(e, { setFieldError });
      }
    },
    [updateMut, fetchList],
  );

  const onPublish = useCallback(
    async (id, payload, { setFieldError } = {}) => {
      try {
        await publishMut.mutateAsync({ id, payload });
        await alertSuccess({ message: "Course berhasil dipublish." });
        setOpenPublish(false);
        setPublishing(null);
        await fetchList();
      } catch (e) {
        await handleApiError(e, { setFieldError });
      }
    },
    [publishMut, fetchList],
  );

  const onArchive = useCallback(
    async (row) => {
      const ok = await alertConfirm({
        title: "Archive course?",
        message: `Yakin mau archive "${row?.title}" (ID ${row?.id})?`,
        confirmText: "Ya, archive",
        cancelText: "Batal",
      });

      if (!ok.isConfirmed) return;

      try {
        await archiveMut.mutateAsync(row.id);
        await alertSuccess({ message: "Course berhasil di-archive." });
        await fetchList();
      } catch (e) {
        await handleApiError(e);
      }
    },
    [archiveMut, fetchList],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Manage Courses</CardTitle>
            <div className="mt-1 text-xs text-muted-foreground">
              Draft • Published • Archived
            </div>
          </div>

          <CourseFormDialog
            mode="create"
            open={openCreate}
            onOpenChange={setOpenCreate}
            onSubmit={onCreate}
            triggerLabel="New Course"
          />
        </CardHeader>

        <CardContent>
          <CoursesTable
            loading={loading}
            error={uiError}
            rows={rows}
            status={status}
            q={q}
            onStatusChange={setStatus}
            onQChange={setQ}
            onRefresh={fetchList}
            onEdit={(row) => {
              setEditing(row);
              setOpenEdit(true);
            }}
            onPublish={(row) => {
              setPublishing(row);
              setOpenPublish(true);
            }}
            onArchive={onArchive}
          />
        </CardContent>
      </Card>

      <CourseFormDialog
        mode="edit"
        open={openEdit}
        onOpenChange={(v) => {
          setOpenEdit(v);
          if (!v) setEditing(null);
        }}
        initial={editing}
        onSubmit={(payload, helpers) => onEdit(editing?.id, payload, helpers)}
      />

      <CourseFormDialog
        mode="publish"
        open={openPublish}
        onOpenChange={(v) => {
          setOpenPublish(v);
          if (!v) setPublishing(null);
        }}
        initial={publishing}
        onSubmit={(payload, helpers) =>
          onPublish(publishing?.id, payload, helpers)
        }
      />
    </div>
  );
}
