"use client";

import { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";

/**
 * Quill editor that mirrors its HTML into a hidden <input name={name}>.
 * Images are uploaded to /admin/api/upload (same-origin, logged-in only) instead of being embedded as base64.
 * Whatever is produced here is sanitised again on the server before it is saved or shown.
 */
export default function RichEditor({ name, initialHtml }: { name: string; initialHtml: string }) {
  const host = useRef<HTMLDivElement>(null);
  const hidden = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      const Quill = (await import("quill")).default;
      if (disposed || !host.current) return;
      host.current.innerHTML = "";
      const box = document.createElement("div");
      host.current.appendChild(box);
      const quill = new Quill(box, {
        theme: "snow",
        placeholder: "Write your update…",
        modules: {
          toolbar: {
            container: [[{ header: [2, 3, false] }], ["bold", "italic", "underline", "strike"],
              [{ list: "ordered" }, { list: "bullet" }], ["blockquote", "link", "image"], ["clean"]],
            handlers: {
              image() {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/jpeg,image/png,image/webp,image/gif";
                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("image", file);
                  try {
                    const res = await fetch("/admin/api/upload", { method: "POST", body: fd, credentials: "same-origin" });
                    const data = await res.json();
                    if (!res.ok || !data.url) { alert(data.error || "Image upload failed."); return; }
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, "image", data.url, "user");
                    quill.setSelection(range.index + 1);
                  } catch { alert("Image upload failed."); }
                };
                input.click();
              },
            },
          },
        },
      });
      quill.clipboard.dangerouslyPasteHTML(initialHtml || "");
      const sync = () => { if (hidden.current) hidden.current.value = quill.getSemanticHTML(); };
      sync();
      quill.on("text-change", sync);
      cleanup = () => quill.off("text-change", sync);
    })();
    return () => { disposed = true; cleanup(); };
  }, [initialHtml]);

  return (
    <>
      <div ref={host} className="rich-editor" />
      <input ref={hidden} type="hidden" name={name} defaultValue={initialHtml} />
    </>
  );
}
