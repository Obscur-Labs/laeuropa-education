import "server-only";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { putMedia } from "./store";

export class UploadError extends Error {}

const MAX_IMAGE = 4 * 1024 * 1024;
const MAX_PDF = 3.5 * 1024 * 1024;

function newKey(ext: "webp" | "pdf") {
  const d = new Date();
  return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${randomBytes(12).toString("hex")}.${ext}`;
}

export function isFile(v: FormDataEntryValue | null): v is File {
  return typeof v === "object" && v !== null && "arrayBuffer" in v && (v as File).size > 0;
}

/**
 * Accepts JPG / PNG / WebP / GIF, decodes it, auto-rotates, resizes to `max` px and re-encodes to WebP.
 * Re-encoding removes EXIF/GPS data and anything that is not real image pixels.
 */
export async function saveImage(file: File, max = 1600): Promise<string> {
  return (await saveImageDetailed(file, max)).key;
}

export async function saveImageDetailed(file: File, max = 1600): Promise<{ key: string; width: number; height: number }> {
  if (file.size > MAX_IMAGE) throw new UploadError("Image is too large (max 4 MB).");
  const input = Buffer.from(await file.arrayBuffer());
  let meta;
  try {
    meta = await sharp(input, { limitInputPixels: 40_000_000 }).metadata();
  } catch {
    throw new UploadError("Please upload a JPG, PNG, WebP or GIF image.");
  }
  if (!meta.format || !["jpeg", "png", "webp", "gif"].includes(meta.format)) {
    throw new UploadError("Please upload a JPG, PNG, WebP or GIF image.");
  }
  const { data: out, info } = await sharp(input, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  const key = newKey("webp");
  await putMedia(key, out, "image/webp");
  return { key, width: info.width, height: info.height };
}

/** Accepts a real PDF only (checked by its file signature). */
export async function savePdf(file: File): Promise<string> {
  if (file.size > MAX_PDF) throw new UploadError("PDF is too large (max 3.5 MB).");
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") throw new UploadError("That file is not a PDF.");
  const key = newKey("pdf");
  await putMedia(key, buf, "application/pdf");
  return key;
}
