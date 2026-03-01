"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useCourseBySlug } from "@/features/courses/courses-queries";
import { useLessonDetailPublic } from "@/features/course-modules/module-queries";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import QuillReadOnly from "@/components/editors/QuillReadOnly";
import ResourceRenderer from "@/components/resources/ResourceRenderer";

export default function LessonDetailPage() {
  const router = useRouter();
  const { slug, lessonId } = useParams();

  const lessonIdNum = Number(lessonId);

  const { data: course, isLoading: courseLoading } = useCourseBySlug(slug);
  const {
    data: lesson,
    isLoading: lessonLoading,
    isError,
    error,
  } = useLessonDetailPublic(lessonIdNum);

  if (courseLoading || lessonLoading)
    return <div className="p-6">Loading...</div>;

  if (isError) {
    // optional: show real error message for debugging
    return (
      <div className="p-6 text-red-600">
        Failed to load lesson. {error?.message ? `(${error.message})` : null}
      </div>
    );
  }

  if (!course || !lesson) return <div className="p-6">Not found.</div>;

  const moduleTitle = lesson?.module?.title || "Topik";
  const moduleId = lesson?.module?.id || lesson?.module_id;

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
                  <h1 className="text-2xl font-semibold tracking-tight md:text-3xl mb-2">
                    {course.title}
                  </h1>

                  {/* ✅ Breadcrumbs (with Topik + Lessons) */}
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
                        <BreadcrumbLink asChild>
                          <Link href={`/courses/${slug}`}>{course.title}</Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>

                      <BreadcrumbSeparator />

                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          {/* adjust this URL to whatever your “module section” UI uses */}
                          <Link href={`/courses/${slug}?module=${moduleId}`}>
                            Topik {moduleTitle}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>

                      <BreadcrumbSeparator />

                      {/* Optional but recommended: show current lesson title */}
                      <BreadcrumbItem>
                        <BreadcrumbPage>{lesson.title}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </div>
            </div>
          </div>

          {/* Back button
          <div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div> */}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full px-6 py-6">
        <Card>
          <CardContent className="p-6">
            <div>
              <h2 className="text-3xl font-semibold">{lesson.title}</h2>
            </div>

            {lesson.content_type === "lesson" ? (
              <QuillReadOnly value={lesson.content_json} />
            ) : lesson.content_type === "resource" ? (
              <ResourceRenderer
                type={lesson.resource_type}
                resource={{
                  url: lesson.resource_url,
                  title: lesson.title,
                  mime: lesson.resource_mime,
                }}
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                This content type is <b>{lesson.content_type}</b>. Rendering UI
                will be handled next.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
