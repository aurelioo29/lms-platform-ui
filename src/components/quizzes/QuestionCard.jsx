"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuestionCard({ question, index, onEdit, onDelete }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">
              #{index + 1} • {question.question_type} • {question.points} pts
            </div>
            <div className="font-medium">{question.prompt}</div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit?.(question)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete?.(question)}
            >
              Delete
            </Button>
          </div>
        </div>

        {question.media_type && question.media_type !== "none" ? (
          <div className="rounded-md border bg-muted/20 p-2 text-sm">
            Media: <b>{question.media_type}</b>
            {question.require_watch ? (
              <span className="text-muted-foreground"> • require watch</span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
