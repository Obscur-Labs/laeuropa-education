import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Tiny document store.
 *
 * Production (Vercel): Supabase table `documents` + Storage bucket `media`, accessed ONLY from the
 * server with the service-role key. The browser never talks to Supabase, and the table has Row Level
 * Security enabled with no policies, so the public anon key can read nothing.
 *
 * Local development: JSON files in `.local-data/` (never used in production).
 */

export type Collection =
  | "settings" | "countries" | "faqs" | "certificates" | "reviews"
  | "posts" | "enquiries" | "users" | "sessions" | "ratelimit";

const ID_RE = /^[A-Za-z0-9_.:@+-]{1,160}$/;

function assertId(id: string) {
  if (!ID_RE.test(id) || id.includes("..")) throw new Error("Invalid document id");
}

export function storeMode(): "supabase" | "local" {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return "supabase";
  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_LOCAL_STORE === "1") return "local";
  // Fail closed: never silently write to the throw-away serverless filesystem
  throw new Error("Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

let client: SupabaseClient | null = null;
function sb(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const LOCAL_DIR = path.join(process.cwd(), ".local-data");

/* ---------------- documents ---------------- */

export async function getDoc<T>(collection: Collection, id: string): Promise<T | null> {
  assertId(id);
  if (storeMode() === "supabase") {
    const { data, error } = await sb().from("documents").select("data").eq("collection", collection).eq("id", id).maybeSingle();
    if (error) throw new Error("Database read failed: " + error.message);
    return (data?.data as T) ?? null;
  }
  try {
    return JSON.parse(await fs.readFile(path.join(LOCAL_DIR, collection, id + ".json"), "utf8")) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

export async function listDocs<T>(collection: Collection): Promise<T[]> {
  if (storeMode() === "supabase") {
    const out: T[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb().from("documents").select("data").eq("collection", collection)
        .order("id").range(from, from + 999);
      if (error) throw new Error("Database read failed: " + error.message);
      out.push(...(data ?? []).map((r) => r.data as T));
      if (!data || data.length < 1000) break;
    }
    return out;
  }
  const dir = path.join(LOCAL_DIR, collection);
  let files: string[] = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const docs = await Promise.all(files.map(async (f) => JSON.parse(await fs.readFile(path.join(dir, f), "utf8")) as T));
  return docs;
}

export async function putDoc<T>(collection: Collection, id: string, data: T): Promise<void> {
  assertId(id);
  if (storeMode() === "supabase") {
    const { error } = await sb().from("documents")
      .upsert({ collection, id, data, updated_at: new Date().toISOString() }, { onConflict: "collection,id" });
    if (error) throw new Error("Database write failed: " + error.message);
    return;
  }
  const dir = path.join(LOCAL_DIR, collection);
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, id + ".json");
  const tmp = file + "." + process.pid + "." + Date.now() + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file);
}

export async function deleteDoc(collection: Collection, id: string): Promise<void> {
  assertId(id);
  if (storeMode() === "supabase") {
    const { error } = await sb().from("documents").delete().eq("collection", collection).eq("id", id);
    if (error) throw new Error("Database delete failed: " + error.message);
    return;
  }
  await fs.rm(path.join(LOCAL_DIR, collection, id + ".json"), { force: true });
}

/* ---------------- media files ---------------- */

const KEY_RE = /^\d{4}\/\d{2}\/[a-f0-9]{24}\.(webp|pdf)$/;
export const isMediaKey = (k: string) => KEY_RE.test(k);

export async function putMedia(key: string, body: Buffer, contentType: string): Promise<void> {
  if (!isMediaKey(key)) throw new Error("Invalid media key");
  if (storeMode() === "supabase") {
    const { error } = await sb().storage.from("media").upload(key, body, { contentType, upsert: false, cacheControl: "31536000" });
    if (error) throw new Error("Upload failed: " + error.message);
    return;
  }
  const file = path.join(LOCAL_DIR, "media", key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body);
}

export async function deleteMedia(key: string): Promise<void> {
  if (!isMediaKey(key)) return; // never touch anything we did not upload
  if (storeMode() === "supabase") {
    await sb().storage.from("media").remove([key]);
    return;
  }
  await fs.rm(path.join(LOCAL_DIR, "media", key), { force: true });
}

export async function readLocalMedia(key: string): Promise<Buffer | null> {
  if (!isMediaKey(key) || storeMode() !== "local") return null;
  try {
    return await fs.readFile(path.join(LOCAL_DIR, "media", key));
  } catch {
    return null;
  }
}

/** Public URL for an uploaded file key, or the path itself for built-in files like /certificates/x.jpg */
export function mediaUrl(ref: string | undefined | null): string {
  if (!ref) return "";
  if (ref.startsWith("/")) return ref;
  if (!isMediaKey(ref)) return "";
  if (storeMode() === "supabase") {
    return `${process.env.SUPABASE_URL!.replace(/\/$/, "")}/storage/v1/object/public/media/${ref}`;
  }
  return `/media/${ref}`;
}
