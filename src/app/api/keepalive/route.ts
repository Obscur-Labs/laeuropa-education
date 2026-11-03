import { getDoc } from "@/lib/store";
import { safeEqual } from "@/lib/auth";

/**
 * Called once a day by Vercel Cron (see vercel.json) so the free Supabase project never
 * pauses for inactivity. Only Vercel can call it: it sends `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") || "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return new Response("Unauthorized", { status: 401 });
  await getDoc("settings", "site");
  return Response.json({ ok: true, at: new Date().toISOString() });
}
