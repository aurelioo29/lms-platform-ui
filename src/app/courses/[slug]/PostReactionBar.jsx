"use client";

import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToggleReaction } from "@/features/discussions/discussions-queries";

export default function PostReactionBar({ discussion, discussionId }) {
  const toggle = useToggleReaction(discussionId);

  const liked = !!discussion?.liked;
  const likesCount = discussion?.likes_count ?? 0;

  const onLike = () => {
    toggle.mutate({
      reaction: "like",
      reactable_type: "discussion",
      reactable_id: discussionId,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant={liked ? "default" : "outline"}
        onClick={onLike}
        disabled={toggle.isPending}
        className={["gap-2", liked ? "font-semibold" : ""].join(" ")}
      >
        <ThumbsUp className="h-4 w-4" />
        Like{likesCount > 0 ? ` (${likesCount})` : ""}
      </Button>
    </div>
  );
}
