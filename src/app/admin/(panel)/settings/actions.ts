"use server";

import { adminAction, FormError, type ActionResult } from "@/lib/admin";
import { phoneDigits, type Settings } from "@/lib/content";
import { getDoc, putDoc } from "@/lib/store";
import { text } from "@/lib/sanitize";
import { SETTINGS_GROUPS } from "./fields";

export async function saveSettings(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return adminAction("admin", async () => {
    const saved: Record<string, string> = { ...((await getDoc<Partial<Settings>>("settings", "site")) ?? {}) } as Record<string, string>;
    const errors: string[] = [];
    for (const fields of Object.values(SETTINGS_GROUPS)) {
      for (const [key, [label, type]] of Object.entries(fields)) {
        const v = text(form.get(key), 1000);
        if (v && type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { errors.push(`${label}: please enter a valid email address.`); continue; }
        if (v && type === "url" && !/^https:\/\/[^\s"'<>]+$/i.test(v)) { errors.push(`${label}: link must start with https://`); continue; }
        if (key === "maps_embed" && v && !/^https:\/\/(www\.)?google\.com\/maps/i.test(v)) { errors.push(`${label}: only Google Maps embed links are allowed.`); continue; }
        saved[key] = v;
      }
    }
    if (phoneDigits(saved.phone ?? "").length < 10) errors.push("Please enter a valid phone number.");
    if (errors.length) throw new FormError(errors.join(" "));
    saved.phone_raw = phoneDigits(saved.phone);
    await putDoc("settings", "site", saved);
    return "/admin/settings?ok=saved";
  });
}
