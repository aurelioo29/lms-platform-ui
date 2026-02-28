"use client";

import { useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, MessageSquare, Users, BarChart3 } from "lucide-react";

import CourseDiscussionTab from "./CourseDiscussionTab";
import CourseParticipantsTab from "./CourseParticipantsTab";
// import CourseProgressTab from "./CourseProgressTab";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const TABS = [
  { key: "course", label: "Course", icon: BookOpen },
  { key: "discussion", label: "Discussion", icon: MessageSquare },
  { key: "participants", label: "Participants", icon: Users },
  { key: "progress", label: "Progress", icon: BarChart3 },
];

export default function CourseDetailClientTabs({ course }) {
  const router = useRouter();
  const sp = useSearchParams();

  const activeTab = useMemo(() => {
    const t = sp.get("tab");
    const ok = TABS.some((x) => x.key === t);
    return ok ? t : "course";
  }, [sp]);

  const setTab = useCallback(
    (next) => {
      const params = new URLSearchParams(sp.toString());
      params.set("tab", next);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, sp],
  );

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="border-b bg-background">
        <div className="flex w-full items-center gap-6 overflow-x-auto px-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.key === activeTab;

            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cx(
                  "group inline-flex items-center gap-2 whitespace-nowrap",
                  "rounded-none bg-transparent px-1 py-3 text-sm font-medium",
                  "text-muted-foreground hover:text-foreground",
                  // the underline/bottom border look
                  "border-b-4 border-transparent",
                  active && "border-foreground text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={cx(
                    "h-4 w-4",
                    active ? "text-foreground" : "text-muted-foreground",
                    "group-hover:text-foreground",
                  )}
                />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        {activeTab === "course" ? (
          <div className="rounded-xl border bg-background p-5">
            <div className="text-sm font-semibold">Course</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Render modules/lessons here. (placeholder)
            </div>

            <pre className="mt-4 overflow-auto rounded-lg bg-muted p-4 text-xs">
              {JSON.stringify(
                { id: course?.id, title: course?.title, slug: course?.slug },
                null,
                2,
              )}
            </pre>
          </div>
        ) : null}

        {activeTab === "discussion" ? (
          <CourseDiscussionTab course={course} />
        ) : null}

        {activeTab === "participants" ? (
          <CourseParticipantsTab courseId={course?.id} />
        ) : null}

        {activeTab === "progress" ? (
          <div className="rounded-xl border bg-background p-5">
            Progress content goes here.
          </div>
        ) : // <CourseProgressTab course={course} />
        null}
      </div>
    </div>
  );
}
