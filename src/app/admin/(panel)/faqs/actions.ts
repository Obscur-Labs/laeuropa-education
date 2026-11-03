"use server";

import { adminAction, type ActionResult } from "@/lib/admin";
import type { Faq } from "@/lib/content";
import { putDoc } from "@/lib/store";
import { text } from "@/lib/sanitize";

export async function saveFaqs(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return adminAction(undefined, async () => {
    const qs = form.getAll("q"), as = form.getAll("a");
    const list: Faq[] = [];
    qs.slice(0, 50).forEach((q, k) => {
      const item = { q: text(q, 300), a: text(as[k], 3000) };
      if (item.q && item.a) list.push(item);
    });
    await putDoc("faqs", "list", list);
    return "/admin/faqs?ok=saved";
  });
}
