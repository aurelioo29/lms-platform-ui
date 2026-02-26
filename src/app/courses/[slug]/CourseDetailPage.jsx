"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

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

export default function CourseDetailPage() {
  const { slug } = useParams();
  const { data, isLoading, error } = useCourseBySlug(slug);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{String(error)}</div>;
  if (!data) return <div className="p-6">Course not found.</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="mx-auto w-full px-6 py-6 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {data.title}
          </h1>

          {data.description ? (
            <p className="w-full text-sm text-muted-foreground">
              {data.description}
            </p>
          ) : null}

          {/* ✅ Shadcn Breadcrumb */}
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

        {/* Tabs */}
        <div className="mx-auto w-full px-6">
          <CourseDetailClientTabs course={data} />
        </div>
      </div>
    </div>
  );
}
