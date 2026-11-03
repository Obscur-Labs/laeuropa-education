import "server-only";
import { cache } from "react";
import { getDoc, listDocs } from "./store";
import defaultSettings from "@/data/settings.json";
import defaultCountries from "@/data/countries.json";
import defaultFaqs from "@/data/faqs.json";
import defaultCertificates from "@/data/certificates.json";
import seedPosts from "@/data/seed-posts.json";

export type Settings = typeof defaultSettings;

export type Country = {
  code: string; name: string; region: string; lang: string; intake: string;
  popular: boolean; blurb: string; tags: string[];
};

export type Faq = { q: string; a: string };

export type Certificate = {
  title: string; course: string; issuer: string; holder: string; date: string; ref: string;
  image: string; pdf: string;
  wide?: boolean; // landscape certificate — shown whole instead of cropped
};

export type Review = {
  id: string; name: string; photo: string; university: string; course: string; country: string;
  intake: string; rating: number; text: string; status: "published" | "hidden"; consent: string; created_at: string;
};

export type Post = {
  id: string; slug: string; title: string; excerpt: string; category: string; cover: string;
  content: string; status: "published" | "draft"; author: string; date: string; created_at: string; updated_at: string;
};

export type Enquiry = {
  id: string; created_at: string; status: "new" | "contacted" | "closed"; consent: string;
  name: string; phone: string; email: string; city: string; country: string; level: string; service: string; message: string;
};

export const POST_CATEGORIES = [
  "University Updates", "Country Updates", "Immigration", "Embassy", "Visa", "Scholarships", "Guides", "News",
] as const;

/* Each getter is wrapped in React cache() so one page render reads each collection at most once. */

export const getSettings = cache(async (): Promise<Settings> => {
  const saved = (await getDoc<Partial<Settings>>("settings", "site")) ?? {};
  return { ...defaultSettings, ...saved };
});

export const getCountries = cache(async (): Promise<Country[]> =>
  (await getDoc<Country[]>("countries", "list")) ?? (defaultCountries as Country[]));

export const getFaqs = cache(async (): Promise<Faq[]> =>
  (await getDoc<Faq[]>("faqs", "list")) ?? defaultFaqs);

export const getCertificates = cache(async (): Promise<Certificate[]> =>
  (await getDoc<Certificate[]>("certificates", "list")) ?? (defaultCertificates as Certificate[]));

export const getAllReviews = cache(async (): Promise<Review[]> =>
  (await getDoc<Review[]>("reviews", "list")) ?? []);

/** Public reviews: published AND with recorded written consent (Terms & Conditions clause 24.1). */
export const getPublicReviews = cache(async (): Promise<Review[]> =>
  (await getAllReviews()).filter((r) => r.status === "published" && !!r.consent));

/** All posts newest first. Until the team saves its first update, the three starter posts are shown. */
export const getAllPosts = cache(async (): Promise<Post[]> => {
  let posts = await listDocs<Post>("posts");
  const seeded = await getDoc<{ done: boolean }>("settings", "posts-initialised");
  if (!seeded && posts.length === 0) posts = seedPosts as Post[];
  return [...posts].sort((a, b) => (b.date + b.created_at).localeCompare(a.date + a.created_at));
});

export function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

export const getPublishedPosts = cache(async (): Promise<Post[]> => {
  const today = todayYmd();
  return (await getAllPosts()).filter((p) => p.status === "published" && p.date <= today);
});

export function postExcerpt(p: Pick<Post, "excerpt" | "content">, length = 150): string {
  let text = (p.excerpt || "").trim();
  if (!text) text = p.content.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  return text.length > length ? text.slice(0, length).trimEnd() + "…" : text;
}

export function readingTime(html: string): string {
  const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200)) + " min read";
}

export function formatDate(ymd: string, style: "short" | "month" = "short"): string {
  const d = new Date(ymd + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return "";
  return style === "month"
    ? d.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function whatsappLink(s: Settings, text = "Hi LA Europa Education, I would like to know more about studying in Europe.") {
  return `https://wa.me/${s.phone_raw}?text=${encodeURIComponent(text)}`;
}

export function phoneDigits(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return d.length === 10 ? "91" + d : d;
}
