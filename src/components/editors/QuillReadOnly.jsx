"use client";

import { useEffect } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.bubble.css"; // bubble looks cleaner for read-only

export default function QuillReadOnly({ value }) {
  const { quill, quillRef } = useQuill({
    theme: "bubble",
    readOnly: true,
    modules: { toolbar: false },
  });

  useEffect(() => {
    if (!quill) return;

    // value is Quill Delta (object)
    if (!value) {
      quill.setText("");
      return;
    }

    quill.setContents(value);
    quill.enable(false);
  }, [quill, value]);

  return (
    <div className="rounded-md border bg-background">
      <div ref={quillRef} className="p-3" />
    </div>
  );
}
