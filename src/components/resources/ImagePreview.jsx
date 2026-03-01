"use client";

export default function ImagePreview({ url, title = "Image" }) {
  if (!url)
    return <div className="text-sm text-muted-foreground">No image URL.</div>;

  return (
    <div className="mt-4 overflow-hidden rounded-xl border">
      <div className="border-b bg-muted/30 px-4 py-3 flex items-center justify-between gap-3">
        <div className="font-medium truncate">{title}</div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border bg-background px-3 py-1.5 text-sm hover:bg-muted"
        >
          Open
        </a>
      </div>

      <div className="p-4">
        {/* if you want Next/Image, you can use it too */}
        <img
          src={url}
          alt={title}
          className="max-h-[70vh] w-full rounded-lg object-contain bg-muted/20"
          loading="lazy"
        />
      </div>
    </div>
  );
}
