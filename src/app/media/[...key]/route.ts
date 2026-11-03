import { isMediaKey, readLocalMedia, storeMode } from "@/lib/store";

/**
 * Serves uploaded files during LOCAL development only.
 * In production uploads are served straight from Cloudinary, so this returns 404.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ key: string[] }> }) {
  const { key } = await ctx.params;
  const k = key.join("/");
  if (storeMode() !== "local" || !isMediaKey(k)) return new Response("Not found", { status: 404 });
  const body = await readLocalMedia(k);
  if (!body) return new Response("Not found", { status: 404 });
  const pdf = k.endsWith(".pdf");
  const headers: Record<string, string> = {
    "Content-Type": pdf ? "application/pdf" : "image/webp",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "private, max-age=3600",
  };
  // Images can never run scripts; a sandbox would stop the browser's PDF viewer, so PDFs skip it
  if (!pdf) headers["Content-Security-Policy"] = "default-src 'none'; sandbox";
  return new Response(new Uint8Array(body), { headers });
}
