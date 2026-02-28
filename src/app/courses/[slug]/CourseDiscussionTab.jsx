"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Search, MessageSquare } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import CreateDiscussionDialog from "./CreateDiscussionDialog";
import CommentsPanel from "./CommentsPanel";
import PostReactionBar from "./PostReactionBar";

import {
  useCourseDiscussions,
  useDiscussionDetail,
} from "@/features/discussions/discussions-queries";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import QuillReadOnly from "@/components/editors/QuillReadOnly";

function EmptyPost() {
  return (
    <div className="flex h-full items-center justify-center p-10">
      <div className="text-center text-muted-foreground">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div className="text-lg font-medium text-foreground">
          No post selected
        </div>
        <div className="mt-1 text-sm">Pick a discussion on the left.</div>
      </div>
    </div>
  );
}

export default function CourseDiscussionTab({ course }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseId = course?.id;

  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // cooldown seconds for creating new post
  const [cooldown, setCooldown] = useState(0);

  // decrement cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // deep-link id from URL
  const urlDiscussionId = useMemo(() => {
    const raw = searchParams.get("discussion_id");
    const n = Number(raw || 0);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [searchParams]);

  const {
    data: discussionsRes,
    isLoading: isListLoading,
    error: listError,
    refetch,
  } = useCourseDiscussions(courseId, { q, per_page: 50 });

  // Laravel paginate: { data: { data: [...] } }
  const items = useMemo(() => {
    const list = discussionsRes?.data?.data ?? [];
    return Array.isArray(list) ? list : [];
  }, [discussionsRes]);

  // helper: sync URL (tab + discussion_id) without navigation jump
  const syncUrl = useCallback(
    (id) => {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set("tab", "discussion");
      if (id) sp.set("discussion_id", String(id));
      else sp.delete("discussion_id");
      router.replace(`?${sp.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // ✅ select based on URL first, else fallback to first item
  useEffect(() => {
    if (items.length === 0) return;

    // If URL has discussion_id, prioritize it
    if (urlDiscussionId) {
      const exists = items.some((x) => x.id === urlDiscussionId);
      if (exists) {
        if (selectedId !== urlDiscussionId) {
          setSelectedId(urlDiscussionId);
        }
        return;
      }
    }

    // Fallback: pick first post
    if (!selectedId) {
      setSelectedId(items[0].id);
    }
  }, [items, urlDiscussionId, selectedId]);

  // Detail query
  const selected = useDiscussionDetail(selectedId);

  // Normalize returned detail
  const discussion = selected?.data?.data ?? selected?.data ?? null;

  return (
    <div className="h-[calc(100vh-220px)] min-h-[520px]">
      <div className="grid h-full grid-cols-1 gap-0 border-t md:grid-cols-[360px_1fr]">
        {/* LEFT: list */}
        <div className="border-b md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 p-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search all posts"
                className="pl-8"
              />
            </div>

            <Button type="button" variant="outline" onClick={() => refetch()}>
              Refresh
            </Button>
          </div>

          <Separator />

          {isListLoading ? (
            <div className="p-4 text-sm text-muted-foreground">
              Loading discussions...
            </div>
          ) : listError ? (
            <div className="p-4 text-sm text-destructive">
              {String(listError?.message ?? listError)}
            </div>
          ) : (
            <ScrollArea className="h-[calc(100%-74px)]">
              <div className="divide-y">
                {items.length === 0 ? (
                  <div className="p-6 text-sm text-muted-foreground">
                    No posts found.
                  </div>
                ) : (
                  items.map((d) => {
                    const active = d.id === selectedId;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(d.id);
                          syncUrl(d.id);
                        }}
                        className={[
                          "w-full text-left p-4 hover:bg-muted/40",
                          active ? "bg-muted/50" : "",
                        ].join(" ")}
                      >
                        <div className="line-clamp-1 text-sm font-medium">
                          {d.title}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                          <span className="line-clamp-1">
                            {d.user?.name ?? "Student"}
                          </span>
                          <span>#{d.id}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* RIGHT: detail */}
        <div className="flex h-full flex-col bg-muted/20">
          <div className="flex items-center justify-between border-b bg-background p-4">
            <div>
              <div className="text-sm font-medium">Discussion</div>
              <div className="text-xs text-muted-foreground">
                Course: {course?.title}
              </div>
            </div>

            <CreateDiscussionDialog
              courseId={courseId}
              cooldownSeconds={cooldown}
              onCooldownSet={(sec) => setCooldown(sec)}
              onCreated={(created) => {
                refetch();

                const createdId = created?.id ?? created?.data?.id;
                if (createdId) {
                  setSelectedId(createdId);
                  syncUrl(createdId);
                }
              }}
            />
          </div>

          <div className="flex-1">
            {!selectedId ? (
              <EmptyPost />
            ) : selected.isLoading ? (
              <div className="p-6 text-sm text-muted-foreground">
                Loading post...
              </div>
            ) : selected.error ? (
              <div className="p-6 text-sm text-destructive">
                {String(selected.error?.message ?? selected.error)}
              </div>
            ) : (
              <div className="h-full overflow-auto p-6">
                {/* Post card */}
                <div className="rounded-lg border bg-background p-5">
                  <div className="text-lg font-semibold">
                    {discussion?.title}
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    by {discussion?.user?.name ?? "Student"} • #{selectedId}
                  </div>

                  <div className="mt-3">
                    <PostReactionBar
                      discussion={discussion}
                      discussionId={selectedId}
                    />
                  </div>

                  <Separator className="my-4" />

                  <QuillReadOnly value={discussion?.body_json} />
                </div>

                <CommentsPanel
                  discussion={discussion}
                  onPosted={() => {
                    selected.refetch?.();
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
