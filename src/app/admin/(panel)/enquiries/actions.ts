"use server";

import { adminAction, FormError, type ActionResult } from "@/lib/admin";
import type { Enquiry } from "@/lib/content";
import { deleteDoc, getDoc, putDoc } from "@/lib/store";
import { text } from "@/lib/sanitize";

const ID_RE = /^\d{14}-[a-f0-9]{8}$/;

export async function updateEnquiry(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return adminAction(undefined, async () => {
    const id = text(form.get("id"), 40);
    const op = text(form.get("op"), 20);
    const back = ["new", "contacted", "closed"].includes(text(form.get("filter"), 20)) ? `?status=${text(form.get("filter"), 20)}` : "";
    const list = text(form.get("from"), 20) === "dashboard" ? "/admin" : `/admin/enquiries${back}`;
    if (!ID_RE.test(id)) throw new FormError("Unknown enquiry.");
    const q = await getDoc<Enquiry>("enquiries", id);
    if (!q) throw new FormError("That enquiry no longer exists.");
    if (op === "delete") {
      await deleteDoc("enquiries", id);
      return `${list}${list.includes("?") ? "&" : "?"}ok=deleted`;
    }
    if (op !== "new" && op !== "contacted" && op !== "closed") throw new FormError("Unknown action.");
    await putDoc("enquiries", id, { ...q, status: op });
    return list;
  });
}
