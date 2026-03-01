"use client";

import { FileDown } from "lucide-react";

export default function FileAttachment({ url, title = "Attachment", mime }) {
  if (!url)
    return <div className="text-sm text-muted-foreground">No file URL.</div>;

  const isPreviewable =
    mime?.startsWith("text/") ||
    mime?.includes("json") ||
    mime?.includes("xml") ||
    mime?.includes("image/") ||
    mime?.includes("pdf"); // pdf should go to PdfPreview ideally

  return (
    <div className="mt-4 overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate font-medium">{title}</div>
          <div className="text-xs text-muted-foreground truncate">
            {mime ? mime : "unknown mime"}
          </div>
        </div>

        <a
          href={url}
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          download
        >
          <FileDown className="h-4 w-4" />
          Download
        </a>
      </div>

      {isPreviewable ? (
        <div className="h-[60vh] w-full">
          <iframe className="h-full w-full" src={url} title={title} />
        </div>
      ) : (
        <div className="px-4 py-3 text-sm text-muted-foreground">
          Preview not supported for this file type. Download it instead.
        </div>
      )}
    </div>
  );
}
