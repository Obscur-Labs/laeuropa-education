// One-time setup: prepares Supabase storage and creates (or resets) an ADMIN login.
//
//   node --env-file=.env.local scripts/setup.mjs
//
// Needs in .env.local: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (production database)
// Without them it writes to the local test store (.local-data) instead.
// The admin email/name can be given as ADMIN_EMAIL / ADMIN_NAME; the password is asked for
// (or taken from ADMIN_PASSWORD) and only its bcrypt hash is stored.

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = async (q, def = "") => (await rl.question(def ? `${q} [${def}]: ` : `${q}: `)).trim() || def;

const email = (process.env.ADMIN_EMAIL || (await ask("Admin email / login ID", "info.laeuropa@gmail.com"))).trim().toLowerCase();
const name = process.env.ADMIN_NAME || (await ask("Admin display name", "LA Europa Admin"));
const password = process.env.ADMIN_PASSWORD || (await ask("Admin password (min 10 chars, upper+lower case and a number)"));
rl.close();

if (!/^(?:[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|[a-z0-9._-]{3,60})$/.test(email)) throw new Error("Invalid login ID");
if (password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
  throw new Error("Password too weak: use at least 10 characters with upper-case, lower-case letters and a number.");
}

const user = { id: email, name, role: "admin", hash: await bcrypt.hash(password, 12), created_at: new Date().toISOString(), sessionVersion: Date.now() };
const docId = "u_" + createHash("sha256").update(email).digest("hex").slice(0, 32);

if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  // 1. the documents table must exist (created by supabase/setup.sql)
  const probe = await sb.from("documents").select("id").limit(1);
  if (probe.error) throw new Error("Table 'documents' not found. Run supabase/setup.sql in the Supabase SQL editor first. (" + probe.error.message + ")");

  // 2. public-read storage bucket for photos, covers and certificates (writes only via the server)
  const { data: buckets } = await sb.storage.listBuckets();
  if (!buckets?.some((b) => b.name === "media")) {
    const { error } = await sb.storage.createBucket("media", {
      public: true,
      fileSizeLimit: 4 * 1024 * 1024,
      allowedMimeTypes: ["image/webp", "application/pdf"],
    });
    if (error) throw new Error("Could not create storage bucket: " + error.message);
    console.log("✓ Storage bucket 'media' created");
  } else {
    console.log("✓ Storage bucket 'media' already exists");
  }

  // 3. admin user
  const { error } = await sb.from("documents").upsert({ collection: "users", id: docId, data: user, updated_at: new Date().toISOString() }, { onConflict: "collection,id" });
  if (error) throw new Error("Could not save admin: " + error.message);
  console.log(`✓ Admin login ready in Supabase: ${email}`);
} else {
  const dir = path.join(process.cwd(), ".local-data", "users");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, docId + ".json"), JSON.stringify(user, null, 2));
  console.log(`✓ Admin login ready in the LOCAL test store (.local-data): ${email}`);
}
