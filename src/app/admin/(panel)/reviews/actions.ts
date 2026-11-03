"use server";

import { randomBytes } from "node:crypto";
import { adminAction, FormError, type ActionResult } from "@/lib/admin";
import { getAllReviews, type Review } from "@/lib/content";
import { deleteMedia, putDoc } from "@/lib/store";
import { text } from "@/lib/sanitize";
import { isFile, saveImage } from "@/lib/uploads";

const ID_RE = /^[a-f0-9]{12}$/;

export async function saveReview(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return adminAction(undefined, async (user) => {
    const reviews = [...(await getAllReviews())];
    const id = text(form.get("id"), 20);
    const i = id ? reviews.findIndex((r) => r.id === id) : -1;
    if (id && (!ID_RE.test(id) || i < 0)) throw new FormError("That review no longer exists.");
    const old: Review | undefined = i >= 0 ? reviews[i] : undefined;

    const country = text(form.get("country"), 2);
    const item: Review = {
      id: old?.id ?? randomBytes(6).toString("hex"),
      name: text(form.get("name"), 80),
      photo: old?.photo ?? "",
      university: text(form.get("university"), 120),
      course: text(form.get("course"), 120),
      country: /^[a-z]{2}$/.test(country) ? country : "",
      intake: text(form.get("intake"), 40),
      rating: Math.max(1, Math.min(5, parseInt(text(form.get("rating"), 1), 10) || 5)),
      text: text(form.get("text"), 1500),
      status: text(form.get("status"), 10) === "published" ? "published" : "hidden",
      // Terms & Conditions clause 24.1 — record who confirmed the student's written consent, and when
      consent: form.get("consent")
        ? (old?.consent || `Written consent confirmed by ${user.name} on ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`)
        : "",
      created_at: old?.created_at ?? new Date().toISOString(),
    };
    if (!item.name || !item.text) throw new FormError("Please enter the student name and the review text.");
    if (item.status === "published" && !item.consent) {
      throw new FormError("A review can only be published after the student has given written consent. Tick the consent box, or save it as Hidden.");
    }
    const oldPhoto = item.photo;
    if (form.get("remove_photo")) item.photo = "";
    const file = form.get("photo");
    if (isFile(file)) item.photo = await saveImage(file, 600);

    if (i >= 0) reviews[i] = item; else reviews.unshift(item);
    await putDoc("reviews", "list", reviews);
    if (oldPhoto && oldPhoto !== item.photo) await deleteMedia(oldPhoto);
    return `/admin/reviews?ok=${item.status === "published" ? "live" : "hidden"}`;
  });
}

export async function reviewOp(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return adminAction(undefined, async () => {
    const reviews = [...(await getAllReviews())];
    const id = text(form.get("id"), 20);
    const op = text(form.get("op"), 10);
    const i = reviews.findIndex((r) => r.id === id);
    if (!ID_RE.test(id) || i < 0) throw new FormError("That review no longer exists.");
    if (op === "delete") {
      const [gone] = reviews.splice(i, 1);
      await putDoc("reviews", "list", reviews);
      if (gone.photo) await deleteMedia(gone.photo);
      return "/admin/reviews?ok=deleted";
    }
    const j = op === "up" ? i - 1 : op === "down" ? i + 1 : -1;
    if (j >= 0 && j < reviews.length) {
      [reviews[i], reviews[j]] = [reviews[j], reviews[i]];
      await putDoc("reviews", "list", reviews);
    }
    return "/admin/reviews";
  });
}
