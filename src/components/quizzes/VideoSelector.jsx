"use client";

import { useEffect } from "react";
import { Controller } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VideoSelector({ form, videoFile, setVideoFile }) {
  const mediaType = form.watch("media_type");

  // clear file if switching away
  useEffect(() => {
    if (mediaType !== "upload") {
      setVideoFile(null);
    }
  }, [mediaType, setVideoFile]);

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="space-y-2">
        <Label>Video (optional)</Label>
        <Controller
          control={form.control}
          name="media_type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select media type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="youtube">YouTube Link</SelectItem>
                <SelectItem value="upload">Upload Video</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {mediaType === "youtube" ? (
        <div className="space-y-2">
          <Label>YouTube URL</Label>
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            {...form.register("media_url")}
          />
          {form.formState.errors.media_url ? (
            <p className="text-xs text-red-600">
              {form.formState.errors.media_url.message}
            </p>
          ) : null}
        </div>
      ) : null}

      {mediaType === "upload" ? (
        <div className="space-y-2">
          <Label>Upload video file</Label>
          <Input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          />
          <p className="text-xs text-muted-foreground">
            Will be stored as <code>quiz_questions.media_path</code>.
          </p>
        </div>
      ) : null}
    </div>
  );
}
