"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { useCourseBySlug } from "@/features/courses/courses-queries";
import CourseDetailClientTabs from "./CourseDetailClientTabs";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { apiFetch, getCsrfCookie } from "@/lib/api"; // ✅ make sure these exist

export default function CourseDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, error } = useCourseBySlug(slug);

  // ✅ hooks must be top-level, not after return
  useEffect(() => {
    if (!data?.id) return;

    (async () => {
      try {
        // Only needed if you use Sanctum cookie auth
        await getCsrfCookie?.();
        await apiFetch(`/api/courses/${data.id}/touch`, { method: "POST" });
      } catch (e) {
        // touch is non-critical; don't break page
        console.log("touch failed:", e);
      }
    })();
  }, [data?.id]);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{String(error)}</div>;
  if (!data) return <div className="p-6">Course not found.</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto w-full space-y-4 px-6 py-6">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-2xl border bg-background">
            <div className="relative h-36 md:h-44">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-200 via-emerald-200 to-amber-200" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-white/10 to-white/25" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/30" />

              <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-fuchsia-600 text-white shadow">
                  <span className="text-lg font-bold">📘</span>
                </div>

                <div className="w-full rounded-xl px-3 py-2 backdrop-blur">
                  <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    {data.title}
                  </h1>

                  {data.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {data.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/my-courses">My courses</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />

              <BreadcrumbItem>
                <BreadcrumbPage>{data.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mx-auto w-full px-6">
          <CourseDetailClientTabs course={data} />
        </div>
      </div>
    </div>
  );
}
