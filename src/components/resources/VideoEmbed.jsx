"use client";

import { useMemo } from "react";

function normalizeEmbedUrl(url) {
  // Basic handling: YouTube normal link -> embed link
  try {
    const u = new URL(url);

    // youtube watch?v=xxx
    if (u.hostname.includes("youtube.com") && u.pathname === "/watch") {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // youtu.be/xxx
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // Vimeo: vimeo.com/123 -> player.vimeo.com/video/123
    if (u.hostname.includes("vimeo.com")) {
      const parts = u.pathname.split("/").filter(Boolean);
      const id = parts[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }

    // already embed or other providers
    return url;
  } catch {
    return url;
  }
}

export default function VideoEmbed({ url, title = "Video" }) {
  const embedUrl = useMemo(() => normalizeEmbedUrl(url), [url]);

  if (!url)
    return <div className="text-sm text-muted-foreground">No video URL.</div>;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border">
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="font-medium">{title}</div>
      </div>

      <div className="aspect-video w-full">
        <iframe
          className="h-full w-full"
          src={embedUrl}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
