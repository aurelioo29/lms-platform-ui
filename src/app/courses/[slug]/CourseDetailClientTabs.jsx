"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SimpleTabs } from "@/components/ui/simple-tabs";
import { ChevronRight } from "lucide-react";

import CourseDiscussionTab from "./CourseDiscussionTab";

function CourseTab() {
  return (
    <div className="py-6">
      <div className="rounded-lg border bg-background overflow-hidden">
        <div className="border-b px-4 py-3 text-sm font-medium">
          Topik 1 — Pengantar
        </div>

        <div className="p-4 space-y-3 text-sm">
          <button
            type="button"
            className="w-full flex items-center justify-between rounded-md px-2 py-2 hover:bg-muted/50 text-left"
          >
            <div className="text-blue-600 hover:underline">1.0 Pre Test</div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>✓</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </button>

          <div className="text-xs text-muted-foreground pt-2">
            (Nanti isi ini dari modules/lessons API)
          </div>
        </div>
      </div>
    </div>
  );
}

function ComingSoon({ title }) {
  return (
    <div className="py-6">
      <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
        Coming soon: {title}.
      </div>
    </div>
  );
}

const ALLOWED = new Set(["course", "discussion", "faqs", "progress"]);

export default function CourseDetailClientTabs({ course }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialFromUrl = searchParams.get("tab");
  const [tab, setTab] = useState(
    ALLOWED.has(initialFromUrl) ? initialFromUrl : "course",
  );

  // If user opens a link with ?tab=discussion, sync state
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && ALLOWED.has(t) && t !== tab) setTab(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const tabs = useMemo(
    () => [
      { value: "course", label: "Course" },
      { value: "discussion", label: "Discussion" },
      { value: "faqs", label: "FAQs" },
      { value: "progress", label: "Progress" },
    ],
    [],
  );

  function onChange(next) {
    setTab(next);

    // optional: keep URL in sync (so you can share links)
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("tab", next);
    router.replace(`?${sp.toString()}`, { scroll: false });
  }

  return (
    <>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <SimpleTabs tabs={tabs} active={tab} onChange={onChange} />
      </div>

      {tab === "course" ? <CourseTab course={course} /> : null}
      {tab === "discussion" ? <CourseDiscussionTab course={course} /> : null}
      {tab === "faqs" ? <ComingSoon title="FAQs tab" /> : null}
      {tab === "progress" ? <ComingSoon title="Progress tab" /> : null}
    </>
  );
}
