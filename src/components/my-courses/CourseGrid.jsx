"use client";

import CourseCard from "./CourseCard";

export default function CourseGrid({ loading, items }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[220px] animate-pulse rounded-xl border bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="rounded-xl border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
        No courses found. Either you’re not enrolled… or you’re living
        peacefully. Hard to say.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((c) => (
        <CourseCard key={c.enroll_id} item={c} />
      ))}
    </div>
  );
}
