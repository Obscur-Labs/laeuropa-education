import "server-only";
import type { Country, Enquiry } from "./content";

/** Enquiries store `created_at` as "YYYY-MM-DD HH:MM" in UTC. */
export function enquiryTime(q: Pick<Enquiry, "created_at">): Date {
  return new Date(q.created_at.replace(" ", "T") + ":00Z");
}

const IST = "Asia/Kolkata";

/** "4 Nov, 3:16 pm" in India time, which is what the team works in. */
export function istDateTime(d: Date): string {
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", { timeZone: IST, day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });
}

/** Hour of the day in India, for the greeting. */
export function istHour(d = new Date()): number {
  return Number(d.toLocaleString("en-GB", { timeZone: IST, hour: "2-digit", hour12: false }));
}

export function istLongDate(d = new Date()): string {
  return d.toLocaleDateString("en-GB", { timeZone: IST, weekday: "long", day: "numeric", month: "long" });
}

/** "just now", "24 min", "5 hours", "2 days" */
export function timeAgo(d: Date, now = Date.now()): string {
  const min = Math.max(0, Math.round((now - d.getTime()) / 60000));
  if (min < 2) return "just now";
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return h === 1 ? "1 hour" : `${h} hours`;
  const days = Math.round(h / 24);
  return days === 1 ? "1 day" : `${days} days`;
}

/** A new enquiry left for more than a day is overdue for a call. */
export function isOverdue(q: Enquiry, now = Date.now()): boolean {
  return q.status === "new" && now - enquiryTime(q).getTime() > 24 * 3600e3;
}

/** Maps the country name chosen on the contact form to its flag code ("" when not decided). */
export function flagLookup(countries: Country[]): (name: string) => string {
  const byName = new Map(countries.map((c) => [c.name.toLowerCase(), c.code]));
  return (name) => byName.get(name.trim().toLowerCase()) ?? "";
}

export function greeting(hour = istHour()): string {
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}
