"use client";

import VideoPlayer from "@/components/VideoPlayer"; // adjust path if needed

export default function VideoUpload({ url, title = "Video", poster }) {
  if (!url)
    return <div className="text-sm text-muted-foreground">No video URL.</div>;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border">
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="font-medium">{title}</div>
      </div>

      <div className="p-4">
        <VideoPlayer src={url} poster={poster} />
      </div>
    </div>
  );
}
