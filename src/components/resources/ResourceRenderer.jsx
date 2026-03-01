"use client";

import PdfPreview from "./PdfPreview";
import VideoEmbed from "./VideoEmbed";
import VideoUpload from "./VideoUpload";
import ImagePreview from "./ImagePreview";
import FileAttachment from "./FileAttachment";

export default function ResourceRenderer({ type, resource }) {
  // resource: object dari API (misal lesson asset)
  // Minimal fields:
  // - url (string)
  // - title (string optional)
  // - mime (string optional)
  // - poster (string optional)

  if (!type) return null;

  switch (type) {
    case "pdf":
      return <PdfPreview url={resource.url} title={resource.title} />;

    case "video_embed":
      return <VideoEmbed url={resource.url} title={resource.title} />;

    case "video_upload":
      return (
        <VideoUpload
          url={resource.url}
          title={resource.title}
          poster={resource.poster}
        />
      );

    case "image":
      return <ImagePreview url={resource.url} title={resource.title} />;

    case "file":
      return (
        <FileAttachment
          url={resource.url}
          title={resource.title}
          mime={resource.mime}
        />
      );

    default:
      return (
        <div className="text-sm text-muted-foreground">
          Unknown resource type: <b>{type}</b>
        </div>
      );
  }
}
