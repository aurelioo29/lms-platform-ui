"use client";

import Link from "next/link";
import ProgressRing from "./ProgressRing";

function timeAgo(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Edited ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Edited ${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `Edited ${days}d ago`;
}

export default function CourseCard({ item }) {
  const progress = Number.isFinite(item.progress) ? item.progress : 0;

  return (
    <div className="group overflow-hidden rounded-xl border bg-background shadow-sm transition hover:shadow-md">
      {/* cover */}
      <div className="relative h-[92px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-sky-200 to-amber-200" />
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.9),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,.7),transparent_35%)]" />
        </div>

        {/* Assigned badge mimic */}
        <div className="absolute left-3 top-3 inline-flex items-center rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white">
          {Math.max(1, Math.min(99, Math.floor(progress / 2) + 1))} Assigned
        </div>
      </div>

      <div className="p-4">
        <div className="min-h-[44px] text-base font-semibold leading-snug">
          {item.slug ? (
            <Link href={`/courses/${item.slug}`} className="hover:underline">
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </div>

        {/* tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Tag>{item.category}</Tag>
          <Tag>{item.urgency}</Tag>
        </div>

        {/* footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {timeAgo(item.updated_at)}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">Completed:</div>
            <ProgressRing value={progress} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}
