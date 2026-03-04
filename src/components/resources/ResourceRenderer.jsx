"use client";

import PdfPreview from "./PdfPreview";
import VideoEmbed from "./VideoEmbed";
import VideoUpload from "./VideoUpload";
import ImagePreview from "./ImagePreview";
import FileAttachment from "./FileAttachment";

export default function ResourceRenderer({ type, resource }) {
  if (!type || !resource) return null;

  // normalize: backend kamu pakai resource_url, frontend lama pakai url
  const url = resource.url || resource.resource_url || "";
  const title = resource.title || resource.resource_title || "Resource";
  const mime = resource.mime || resource.resource_mime;
  const poster = resource.poster || resource.resource_poster;

  if (!url) {
    return (
      <div className="text-sm text-muted-foreground">
        No resource URL. (type: <b>{type}</b>)
      </div>
    );
  }

  switch (type) {
    case "pdf":
      return <PdfPreview url={url} title={title} />;

    case "video_embed":
      return <VideoEmbed url={url} title={title} />;

    case "video_upload":
      return <VideoUpload url={url} title={title} poster={poster} />;

    case "image":
      return <ImagePreview url={url} title={title} />;

    case "file":
      return <FileAttachment url={url} title={title} mime={mime} />;

    default:
      return (
        <div className="text-sm text-muted-foreground">
          Unknown resource type: <b>{type}</b>
        </div>
      );
  }
}
