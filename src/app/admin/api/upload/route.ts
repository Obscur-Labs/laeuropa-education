import { currentUser } from "@/lib/auth";
import { mediaUrl } from "@/lib/store";
import { isFile, saveImage, UploadError } from "@/lib/uploads";

/** Image upload for the post editor. Logged-in team members only, same-origin only. */
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  let sameOrigin = false;
  try { sameOrigin = !!origin && new URL(origin).host === host; } catch { sameOrigin = false; }
  if (!sameOrigin) return Response.json({ error: "Forbidden" }, { status: 403 });

  if (!(await currentUser())) return Response.json({ error: "Please log in again." }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Upload failed." }, { status: 400 });
  }
  const file = form.get("image");
  if (!isFile(file)) return Response.json({ error: "No image received." }, { status: 400 });
  try {
    const key = await saveImage(file, 1600);
    return Response.json({ url: mediaUrl(key) });
  } catch (e) {
    if (e instanceof UploadError) return Response.json({ error: e.message }, { status: 422 });
    console.error("Editor upload failed", e);
    return Response.json({ error: "Upload failed." }, { status: 500 });
  }
}

export function GET() {
  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
