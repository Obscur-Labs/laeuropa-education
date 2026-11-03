"use client";

import { useState } from "react";

/** File input that shows a local preview of the chosen image before it is uploaded. */
export default function PhotoPreview({ name, current, max, className = "review-photo-preview" }: {
  name: string; current: string; max: number; className?: string;
}) {
  const [src, setSrc] = useState(current);
  return (
    <>
      <div className={className}>{src ? <img src={src} alt="" /> : <span>No photo</span>}</div>
      <input type="file" name={name} accept="image/jpeg,image/png,image/webp" data-max={max}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) setSrc(URL.createObjectURL(f)); }} />
    </>
  );
}
