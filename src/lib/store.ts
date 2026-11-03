import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { FieldPath, getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Tiny document store.
 *
 * Production (Vercel): Firestore (one collection per `Collection`), accessed ONLY from the server with the
 * Admin SDK service account (Firestore rules deny all browser access), plus Cloudinary folder `media/` for
 * uploaded photos and PDFs (signed uploads from the server only; files are public to view).
 *
 * Local development: JSON files in `.local-data/` (never used in production).
 */

export type Collection =
  | "settings" | "countries" | "faqs" | "certificates" | "reviews"
  | "posts" | "enquiries" | "users" | "sessions" | "ratelimit";

const ID_RE = /^[A-Za-z0-9_.:@+-]{1,160}$/;

function assertId(id: string) {
  // Firestore also reserves ids that look like __name__
  if (!ID_RE.test(id) || id.includes("..") || /^__.*__$/.test(id)) throw new Error("Invalid document id");
}

const env = () => ({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  cloudinary: process.env.CLOUDINARY_URL, // cloudinary://<api_key>:<api_secret>@<cloud_name>
});

export function storeMode(): "cloud" | "local" {
  const e = env();
  if (e.projectId && e.clientEmail && e.privateKey && e.cloudinary) return "cloud";
  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_LOCAL_STORE === "1") return "local";
  // Fail closed: never silently write to the throw-away serverless filesystem
  throw new Error("Storage is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY and CLOUDINARY_URL.");
}

/**
 * The private key as pasted into Vercel or .env: often on one line with literal "\n" (backslash + n),
 * sometimes still wrapped in the quotes from the JSON file. Turn it back into a real multi-line PEM key.
 */
function pemKey(raw: string): string {
  return raw.trim().replace(/^"|"$/g, "").replace(/\\r/g, "").replace(/\\n/g, "\n");
}

let firestore: Firestore | null = null;
function app(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  const e = env();
  return initializeApp({
    credential: cert({
      projectId: e.projectId,
      clientEmail: e.clientEmail,
      privateKey: pemKey(e.privateKey!),
    }),
  });
}
function db(): Firestore {
  if (!firestore) {
    firestore = getFirestore(app());
    firestore.settings({ ignoreUndefinedProperties: true });
  }
  return firestore;
}

export const LOCAL_DIR = path.join(process.cwd(), ".local-data");

/* ---------------- documents ---------------- */

export async function getDoc<T>(collection: Collection, id: string): Promise<T | null> {
  assertId(id);
  if (storeMode() === "cloud") {
    const snap = await db().collection(collection).doc(id).get();
    return snap.exists ? (snap.data() as T) : null;
  }
  try {
    return JSON.parse(await fs.readFile(path.join(LOCAL_DIR, collection, id + ".json"), "utf8")) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

export async function listDocs<T>(collection: Collection): Promise<T[]> {
  if (storeMode() === "cloud") {
    const snap = await db().collection(collection).orderBy(FieldPath.documentId()).get();
    return snap.docs.map((d) => d.data() as T);
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
  if (storeMode() === "cloud") {
    await db().collection(collection).doc(id).set(data as FirebaseFirestore.DocumentData);
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
  if (storeMode() === "cloud") {
    await db().collection(collection).doc(id).delete();
    return;
  }
  await fs.rm(path.join(LOCAL_DIR, collection, id + ".json"), { force: true });
}

/* ---------------- media files ---------------- */

const KEY_RE = /^\d{4}\/\d{2}\/[a-f0-9]{24}\.(webp|pdf)$/;
export const isMediaKey = (k: string) => KEY_RE.test(k);

/** Media Library folder every upload goes into (the account uses Cloudinary's dynamic folders). */
const MEDIA_FOLDER = "La Europa Education";

/* Cloudinary keeps images as "image" (public id without extension) and PDFs as "raw" (with extension). */
const resourceType = (key: string) => (key.endsWith(".pdf") ? "raw" : "image");
const publicId = (key: string) => "media/" + (resourceType(key) === "raw" ? key : key.replace(/\.webp$/, ""));

function cloudinary() {
  const u = new URL(env().cloudinary!);
  return { cloud: u.hostname, apiKey: decodeURIComponent(u.username), secret: decodeURIComponent(u.password) };
}

/** Signed call to Cloudinary's upload API (https://cloudinary.com/documentation/image_upload_api_reference). */
async function cloudinaryCall(action: "upload" | "destroy", key: string, params: Record<string, string>, file?: Blob) {
  const c = cloudinary();
  const signed: Record<string, string> = { ...params, public_id: publicId(key), timestamp: String(Math.floor(Date.now() / 1000)) };
  const toSign = Object.keys(signed).sort().map((k) => `${k}=${signed[k]}`).join("&");
  const form = new FormData();
  for (const [k, v] of Object.entries(signed)) form.set(k, v);
  form.set("api_key", c.apiKey);
  form.set("signature", createHash("sha1").update(toSign + c.secret).digest("hex"));
  if (file) form.set("file", file);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${c.cloud}/${resourceType(key)}/${action}`, { method: "POST", body: form });
  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string }; result?: string };
  if (!res.ok || json.error) throw new Error(json.error?.message || `Cloudinary ${action} failed (${res.status})`);
  return json;
}

export async function putMedia(key: string, body: Buffer, contentType: string): Promise<void> {
  if (!isMediaKey(key)) throw new Error("Invalid media key");
  if (storeMode() === "cloud") {
    try {
      await cloudinaryCall("upload", key, { overwrite: "false", asset_folder: MEDIA_FOLDER }, new Blob([new Uint8Array(body)], { type: contentType }));
    } catch (e) {
      throw new Error("Upload failed: " + (e as Error).message);
    }
    return;
  }
  const file = path.join(LOCAL_DIR, "media", key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body);
}

export async function deleteMedia(key: string): Promise<void> {
  if (!isMediaKey(key)) return; // never touch anything we did not upload
  if (storeMode() === "cloud") {
    // best effort, like before: a leftover file must never block saving content
    await cloudinaryCall("destroy", key, { invalidate: "true" }).catch((e) => console.error("Media delete failed", e));
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
  if (storeMode() === "cloud") {
    return `https://res.cloudinary.com/${cloudinary().cloud}/${resourceType(ref)}/upload/media/${ref}`;
  }
  return `/media/${ref}`;
}
