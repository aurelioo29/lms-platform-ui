"use client";

import { useMemo } from "react";

export default function PdfPreview({ url, title = "PDF Preview" }) {
  const safeUrl = useMemo(() => {
    // kalau butuh: encodeURI biar aman untuk query params
    try {
      return encodeURI(url);
    } catch {
      return url;
    }
  }, [url]);

  if (!url) {
    return <div className="text-sm text-muted-foreground">No PDF URL.</div>;
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate font-medium">{title}</div>
          <div className="text-xs text-muted-foreground truncate">{url}</div>
        </div>

        <a
          href={safeUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border bg-background px-3 py-1.5 text-sm hover:bg-muted"
        >
          Open
        </a>
      </div>

      {/* PDF preview */}
      <div className="h-[70vh] w-full">
        <iframe
          src={safeUrl}
          title={title}
          className="h-full w-full"
          loading="lazy"
        />
      </div>

      {/* fallback note */}
      <div className="border-t px-4 py-3 text-xs text-muted-foreground">
        If preview is blank: your server might be sending the wrong headers. PDF
        should be served with <b>Content-Type: application/pdf</b> and ideally
        allow inline viewing.
      </div>
    </div>
  );
}
