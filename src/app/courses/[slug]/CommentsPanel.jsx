"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import QuillEditor from "@/components/editors/QuillEditor";
import QuillReadOnly from "@/components/editors/QuillReadOnly";
import { useCreateComment } from "@/features/discussions/discussions-queries";

export default function CommentsPanel({ discussion }) {
  const discussionId = discussion?.id;
  const comments = discussion?.comments ?? [];

  const [bodyJson, setBodyJson] = useState(null);

  const createComment = useCreateComment(discussionId);

  const canSend = bodyJson && (bodyJson.ops?.length ?? 0) > 0;

  const submit = async () => {
    await createComment.mutateAsync({
      body_json: bodyJson,
    });

    setBodyJson(null);
  };

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold">
          Responses ({comments.length})
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Comments */}
      <div className="space-y-6">
        {comments.length === 0 && (
          <div className="text-sm text-muted-foreground">No replies yet.</div>
        )}

        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            {/* Avatar circle */}
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
              {c.user?.name?.[0] ?? "U"}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="text-sm font-medium">
                {c.user?.name ?? "User"}
              </div>

              <div className="mt-1 text-sm text-muted-foreground">
                <QuillReadOnly value={c.body_json} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="mt-8">
        <Separator className="mb-6" />

        <div className="text-sm font-semibold mb-3">Add a response</div>

        <QuillEditor value={bodyJson} onChange={setBodyJson} height={140} />

        <div className="flex justify-end mt-3">
          <Button
            onClick={submit}
            disabled={!canSend || createComment.isPending}
          >
            Post reply
          </Button>
        </div>
      </div>
    </div>
  );
}
