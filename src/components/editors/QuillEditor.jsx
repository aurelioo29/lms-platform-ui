"use client";

import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function QuillEditor({
  value,
  onChange,
  height = 150,
  placeholder = "Write a reply...",
}) {
  const wrapperRef = useRef(null);
  const quillRef = useRef(null);
  const lastJsonRef = useRef(""); // store serialized delta to compare

  useEffect(() => {
    if (!wrapperRef.current || quillRef.current) return;

    const editorEl = document.createElement("div");
    wrapperRef.current.innerHTML = "";
    wrapperRef.current.appendChild(editorEl);

    const quill = new Quill(editorEl, {
      theme: "snow",
      placeholder,
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

    // set height
    const container = editorEl.querySelector(".ql-container");
    if (container) container.style.height = `${height}px`;

    quillRef.current = quill;

    // Initial value (SILENT)
    if (value) {
      quill.setContents(value, "silent");
      lastJsonRef.current = JSON.stringify(value);
    } else {
      quill.setContents([], "silent");
      lastJsonRef.current = "";
    }

    quill.on("text-change", (delta, oldDelta, source) => {
      if (source === "silent") return; // ✅ ignore programmatic updates
      const next = quill.getContents();
      lastJsonRef.current = JSON.stringify(next);
      onChange?.(next);
    });

    return () => {
      quillRef.current = null;
    };
  }, []); // ok to init once

  // Sync external value -> editor (SILENT + safe compare)
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    // normalize
    const next = value ?? null;
    const nextJson = next ? JSON.stringify(next) : "";

    if (nextJson === lastJsonRef.current) return; // ✅ no change

    const range = quill.getSelection();

    if (!next) {
      quill.setContents([], "silent"); // ✅ clear silently
      lastJsonRef.current = "";
    } else {
      quill.setContents(next, "silent"); // ✅ set silently
      lastJsonRef.current = nextJson;
    }

    if (range) quill.setSelection(range);
  }, [value]);

  return <div ref={wrapperRef} className="w-full" />;
}
