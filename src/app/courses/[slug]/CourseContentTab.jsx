"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Plus,
  BookOpen,
  Paperclip,
  ClipboardList,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  usePublicModules,
  useAdminModules,
} from "@/features/course-modules/module-queries";
import CreateModuleDialog from "./CreateModuleDialog";
import CreateLessonDialog from "./CreateLessonDialog";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

// ✅ map content_type -> lucide icon
const CONTENT_TYPE_ICON = {
  lesson: BookOpen,
  resource: Paperclip,
  assignment: ClipboardList,
};

export default function CourseContentTab({ course, user }) {
  const router = useRouter();
  const courseId = course?.id;

  const role = (user?.role || "").toLowerCase();
  const canCreate = ["admin", "teacher", "developer"].includes(role);

  const { data: modules = [], isLoading } = canCreate
    ? useAdminModules(courseId)
    : usePublicModules(courseId);

  const [openModule, setOpenModule] = useState(null);
  const [lessonModal, setLessonModal] = useState({
    open: false,
    moduleId: null,
  });
  const [openCreateModule, setOpenCreateModule] = useState(false);

  const sorted = useMemo(() => {
    return [...modules].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );
  }, [modules]);

  if (!courseId) return null;
  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading content...</p>;

  return (
    <div className="space-y-4">
      {canCreate ? (
        <div className="flex items-center justify-end gap-2">
          <CreateModuleDialog
            open={openCreateModule}
            onOpenChange={setOpenCreateModule}
            courseId={courseId}
          />
        </div>
      ) : null}

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="p-5">
            <div className="text-sm font-semibold">No modules yet</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Create a module first, then add lessons under it.
            </div>
          </CardContent>
        </Card>
      ) : (
        sorted.map((m) => {
          const isOpen = openModule === m.id;
          const lessons = [...(m.lessons || [])].sort(
            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
          );

          return (
            <Card key={m.id}>
              <CardContent className="p-5">
                {/* Module header */}
                <button
                  type="button"
                  onClick={() => setOpenModule(isOpen ? null : m.id)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <div className="text-[22px] font-semibold tracking-tight">
                      {m.title}
                    </div>
                  </div>

                  <ChevronDown
                    className={cx(
                      "h-5 w-5 shrink-0 transition-transform",
                      isOpen ? "rotate-180" : "rotate-0",
                    )}
                  />
                </button>

                {/* Lessons list */}
                {isOpen ? (
                  <>
                    <Separator className="my-4" />

                    <div className="space-y-1">
                      {lessons.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          No lessons yet.
                        </div>
                      ) : (
                        lessons.map((l) => {
                          const Icon =
                            CONTENT_TYPE_ICON[l.content_type] || BookOpen;

                          return (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/courses/${course.slug}/lessons/${l.id}`,
                                )
                              }
                              className={cx(
                                "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left",
                                "hover:bg-muted/50",
                              )}
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                {/* ✅ left icon */}
                                <span className="flex h-7 w-7 items-center justify-center rounded-md border bg-background">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                </span>

                                {/* ✅ title */}
                                <span className="min-w-0 truncate text-sm text-blue-600 hover:underline">
                                  {l.title}
                                </span>
                              </div>

                              <span className="text-xs text-muted-foreground">
                                #{l.id}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {canCreate ? (
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          className="gap-2"
                          onClick={() =>
                            setLessonModal({ open: true, moduleId: m.id })
                          }
                        >
                          <Plus className="h-4 w-4" />
                          Add lesson
                        </Button>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </CardContent>
            </Card>
          );
        })
      )}

      <CreateLessonDialog
        open={lessonModal.open}
        onOpenChange={(open) => setLessonModal((s) => ({ ...s, open }))}
        courseId={courseId}
        moduleId={lessonModal.moduleId}
        modules={sorted}
      />
    </div>
  );
}
