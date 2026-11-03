"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { getSettings, type Enquiry } from "@/lib/content";
import { putDoc } from "@/lib/store";
import { clientIpHash, hit, isLimited } from "@/lib/ratelimit";
import { text } from "@/lib/sanitize";

export type EnquiryState = { errors: string[]; values: Record<string, string> } | null;

const FIELDS = ["name", "phone", "email", "city", "country", "level", "service", "message"] as const;

export async function submitEnquiry(_prev: EnquiryState, form: FormData): Promise<EnquiryState> {
  const values: Record<string, string> = {};
  for (const f of FIELDS) values[f] = text(form.get(f), f === "message" ? 2000 : 150);
  values.consent = form.get("consent") ? "1" : "";

  // Honeypot: real visitors never fill this hidden field. Pretend success.
  if (text(form.get("website"))) redirect("/contact?sent=1");

  const ip = await clientIpHash();
  const errors: string[] = [];
  if (await isLimited("enquiry", ip, 5, 3600)) errors.push("Too many enquiries from your connection. Please call or WhatsApp us instead.");
  if (values.name.length < 2) errors.push("Please enter your name.");
  if (!/^[0-9+\-\s()]{8,20}$/.test(values.phone)) errors.push("Please enter a valid phone / WhatsApp number.");
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) errors.push("Please enter a valid email address, or leave it empty.");
  if (!values.consent) errors.push("Please tick the consent box so we can contact you about your enquiry.");
  if (errors.length) return { errors, values };

  const s = await getSettings();
  const now = new Date();
  const enquiry: Enquiry = {
    id: now.toISOString().replace(/\D/g, "").slice(0, 14) + "-" + randomBytes(4).toString("hex"),
    created_at: now.toISOString().slice(0, 16).replace("T", " "),
    status: "new",
    consent: `Privacy Policy (${s.legal_updated}) accepted ${now.toISOString().slice(0, 16).replace("T", " ")} UTC`,
    name: values.name, phone: values.phone, email: values.email, city: values.city, country: values.country,
    level: values.level, service: values.service, message: values.message,
  };
  await putDoc("enquiries", enquiry.id, enquiry);
  await hit("enquiry", ip, 3600);

  // Optional email notification (Resend free tier). Only runs when both are configured.
  if (process.env.RESEND_API_KEY && s.notify_email) {
    const body = FIELDS.map((f) => `${f[0].toUpperCase() + f.slice(1)}: ${values[f]}`).join("\n");
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "LA Europa Website <onboarding@resend.dev>",
        to: [s.notify_email],
        subject: "New website enquiry - " + values.name.replace(/[\r\n\t]+/g, " ").slice(0, 80),
        text: body,
      }),
    }).catch(() => { /* the enquiry is already saved; email is best-effort */ });
  }
  redirect("/contact?sent=1");
}
