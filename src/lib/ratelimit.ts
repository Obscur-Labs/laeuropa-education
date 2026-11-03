import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getDoc, putDoc, deleteDoc } from "./store";

/** Client IP as seen by Vercel (x-real-ip is set by the platform). Only a hash is ever stored. */
export async function clientIpHash(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return createHash("sha256").update("lee:" + ip).digest("hex").slice(0, 32);
}

type Bucket = { hits: number[] };

function keyFor(bucket: string, subject: string) {
  return bucket + "_" + createHash("sha256").update(subject).digest("hex").slice(0, 40);
}

/** True when `subject` already used `max` attempts within `windowSec`. */
export async function isLimited(bucket: string, subject: string, max: number, windowSec: number): Promise<boolean> {
  const doc = await getDoc<Bucket>("ratelimit", keyFor(bucket, subject));
  const since = Date.now() - windowSec * 1000;
  return (doc?.hits ?? []).filter((t) => t > since).length >= max;
}

export async function hit(bucket: string, subject: string, windowSec: number): Promise<void> {
  const id = keyFor(bucket, subject);
  const since = Date.now() - windowSec * 1000;
  const doc = await getDoc<Bucket>("ratelimit", id);
  const hits = [...(doc?.hits ?? []).filter((t) => t > since), Date.now()].slice(-50);
  await putDoc("ratelimit", id, { hits });
}

export async function clearHits(bucket: string, subject: string): Promise<void> {
  await deleteDoc("ratelimit", keyFor(bucket, subject));
}
