"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, UserRound } from "lucide-react";

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}

function TeacherRow({ name, roleLabel }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-full border bg-muted/30 text-[10px] font-semibold">
        {initials(name)}
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs font-medium">{name}</div>
        <div className="text-[11px] text-muted-foreground">{roleLabel}</div>
      </div>
    </div>
  );
}

export default function CourseCard({ course, onEnroll }) {
  const list = course?.courseInstructors ?? course?.course_instructors ?? [];

  const teachers = list
    .map((ci) => ({
      name: ci?.instructor?.name ?? "Unknown",
      role: ci?.role ?? "main",
    }))
    .filter((t) => t.name !== "Unknown");

  return (
    <Card className="group overflow-hidden transition hover:shadow-md">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="secondary" className="text-[11px]">
            Published
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-muted/30">
            <BookOpen className="h-5 w-5" />
          </div>

          <div className="min-w-auto">
            <div className="line-clamp-2 text-base font-semibold">
              {course.title}
            </div>
          </div>
        </div>

        {/* ✅ Teacher section from DB */}
        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
            <UserRound className="h-4 w-4 text-muted-foreground" />
            Teachers
          </div>

          {teachers.length > 0 ? (
            <div className="space-y-2">
              {teachers.map((t, idx) => (
                <TeacherRow
                  key={`${course.id}-t-${idx}`}
                  name={t.name}
                  roleLabel={t.role === "assistant" ? "Assistant" : "Teacher"}
                />
              ))}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              Teacher info: <span className="font-medium">TBA</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Button className="flex-1" onClick={() => onEnroll(course)}>
            Enroll
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
