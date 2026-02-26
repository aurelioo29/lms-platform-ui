"use client";

import { useMemo, useState } from "react";
import QuillEditor from "@/components/editors/QuillEditor";
import { Button } from "@/components/ui/button";
import { useCreateComment } from "@/features/discussions/discussions-queries";

export default function DiscussionCommentBox({ discussionId }) {
  const [bodyJson, setBodyJson] = useState(null);
  const create = useCreateComment(discussionId);

  const canSubmit = useMemo(() => {
    const bOk = bodyJson && (bodyJson.ops?.length ?? 0) > 0;
    return !!discussionId && bOk && !create.isPending;
  }, [discussionId, bodyJson, create.isPending]);

  const submit = async () => {
    await create.mutateAsync({ body_json: bodyJson });
    setBodyJson(null);
  };

  return (
    <div className="rounded-lg border bg-background p-4 space-y-3">
      <div className="text-sm font-medium">Add a response</div>

      <QuillEditor value={bodyJson} onChange={setBodyJson} height={180} />

      <div className="flex justify-end">
        <Button onClick={submit} disabled={!canSubmit}>
          {create.isPending ? "Posting..." : "Post response"}
        </Button>
      </div>
    </div>
  );
}
