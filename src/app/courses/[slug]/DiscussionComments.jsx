"use client";

import QuillReadOnly from "@/components/editors/QuillReadOnly";

export default function DiscussionComments({ comments = [] }) {
  if (!comments.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No responses yet. Be the first victim—eh, contributor.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="rounded-lg border bg-background p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">{c.user?.name ?? "User"}</div>
            <div className="text-xs text-muted-foreground">
              {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
            </div>
          </div>

          <QuillReadOnly delta={c.body_json} />
        </div>
      ))}
    </div>
  );
}
