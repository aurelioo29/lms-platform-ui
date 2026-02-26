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
  const lastValueRef = useRef(null);

  useEffect(() => {
    if (!wrapperRef.current || quillRef.current) return;

    // Create editor mount node
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

    // Set height to the actual quill container
    const container = editorEl.querySelector(".ql-container");
    if (container) container.style.height = `${height}px`;

    quillRef.current = quill;

    // Initial value
    if (value) {
      quill.setContents(value);
      lastValueRef.current = value;
    }

    quill.on("text-change", () => {
      const delta = quill.getContents();
      lastValueRef.current = delta;
      onChange?.(delta);
    });

    return () => {
      quillRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If parent resets value (e.g., after submit setBodyJson(null))
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    // If value becomes null => clear editor
    if (!value && lastValueRef.current) {
      quill.setText("");
      lastValueRef.current = null;
      return;
    }

    // If parent sets a different delta (rare, but handle it)
    if (value && value !== lastValueRef.current) {
      const range = quill.getSelection(); // keep cursor if possible
      quill.setContents(value);
      if (range) quill.setSelection(range);
      lastValueRef.current = value;
    }
  }, [value]);

  return <div ref={wrapperRef} className="w-full" />;
}
