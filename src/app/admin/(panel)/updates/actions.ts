"use server";

import { randomBytes } from "node:crypto";
import { adminAction, FormError, type ActionResult } from "@/lib/admin";
import { getAllPosts, POST_CATEGORIES, type Post } from "@/lib/content";
import { deleteDoc, deleteMedia, getDoc, listDocs, putDoc } from "@/lib/store";
import { cleanPostHtml, text } from "@/lib/sanitize";
import { isFile, saveImage } from "@/lib/uploads";
import seedPosts from "@/data/seed-posts.json";

const ID_RE = /^[a-f0-9]{12}$/;

/** The three starter posts become real, editable posts the first time the team saves anything. */
async function materialiseSeedPosts() {
  if (await getDoc("settings", "posts-initialised")) return;
  if ((await listDocs<Post>("posts")).length === 0) {
    for (const p of seedPosts as Post[]) await putDoc("posts", p.id, p);
  }
  await putDoc("settings", "posts-initialised", { done: true });
}

function slugify(t: string) {
  const s = t.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  return s || "post";
}

async function uniqueSlug(title: string, exceptId: string) {
  const taken = new Set((await getAllPosts()).filter((p) => p.id !== exceptId).map((p) => p.slug));
  const base = slugify(title);
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

export async function savePost(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return adminAction(undefined, async (user) => {
    await materialiseSeedPosts();
    const id = text(form.get("id"), 20);
    const existing = id ? await getDoc<Post>("posts", id) : null;
    if (id && (!ID_RE.test(id) || !existing)) throw new FormError("That update no longer exists.");

    const title = text(form.get("title"), 200);
    const content = cleanPostHtml(String(form.get("content") ?? "").slice(0, 200_000));
    if (!title) throw new FormError("Please add a title.");
    if (!content.replace(/<(?!img)[^>]*>/g, "").trim()) throw new FormError("Please write some content.");
    const category = POST_CATEGORIES.includes(text(form.get("category"), 40) as (typeof POST_CATEGORIES)[number])
      ? text(form.get("category"), 40) : "News";
    const dateIn = text(form.get("date"), 10);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(dateIn) && !Number.isNaN(Date.parse(dateIn)) ? dateIn : new Date().toISOString().slice(0, 10);
    const status = text(form.get("status"), 10) === "published" ? "published" : "draft";

    let cover = existing?.cover ?? "";
    const oldCover = cover;
    if (form.get("remove_cover")) cover = "";
    const file = form.get("cover");
    if (isFile(file)) cover = await saveImage(file, 1600);

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const post: Post = {
      id: existing?.id ?? randomBytes(6).toString("hex"),
      slug: existing && !form.get("regen_slug") ? existing.slug : await uniqueSlug(title, existing?.id ?? ""),
      title, excerpt: text(form.get("excerpt"), 300), category, cover, content, status,
      author: text(form.get("author"), 80) || user.name,
      date, created_at: existing?.created_at ?? now, updated_at: now,
    };
    await putDoc("posts", post.id, post);
    if (oldCover && oldCover !== cover) await deleteMedia(oldCover);
    return `/admin/updates/${post.id}?ok=${status === "published" ? "published" : "draft"}`;
  });
}

export async function deletePost(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return adminAction(undefined, async () => {
    await materialiseSeedPosts();
    const id = text(form.get("id"), 20);
    if (!ID_RE.test(id)) throw new FormError("Unknown update.");
    const post = await getDoc<Post>("posts", id);
    if (post) {
      await deleteDoc("posts", id);
      if (post.cover) await deleteMedia(post.cover);
    }
    return "/admin/updates?ok=deleted";
  });
}
