"use client";

import { useEffect } from "react";
import { useQuill } from "react-quilljs";

import "quill/dist/quill.snow.css";

export default function QuillEditor({ value, onChange, height = 250 }) {
  const { quill, quillRef } = useQuill({
    theme: "snow",

    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],

        ["bold", "italic", "underline"],

        [{ list: "ordered" }, { list: "bullet" }],

        ["link"],

        ["clean"],
      ],
    },
  });

  // Load initial value
  useEffect(() => {
    if (!quill) return;
    if (!value) return;

    quill.setContents(value);
  }, [quill, value]);

  // Listen changes
  useEffect(() => {
    if (!quill) return;

    quill.on("text-change", () => {
      const delta = quill.getContents();

      onChange?.(delta);
    });
  }, [quill, onChange]);

  return (
    <div className="border rounded-md overflow-hidden">
      <div ref={quillRef} style={{ height }} />
    </div>
  );
}
