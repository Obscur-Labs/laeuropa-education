export type FieldType = "text" | "textarea" | "email" | "url";

export const SETTINGS_GROUPS: Record<string, Record<string, [string, FieldType, string]>> = {
  "Contact details": {
    phone: ["Phone / WhatsApp number", "text", "Shown everywhere on the site and used for the WhatsApp button. Example: +91 777 888 1875"],
    email: ["Email address", "email", "Shown in the footer and on the Contact page. Leave empty to hide."],
    address: ["Office address", "textarea", ""],
    hours: ["Office hours", "text", "Example: Mon – Sat · 10:00 AM – 6:30 PM"],
    maps_url: ["Google Maps link", "url", "Opened by \"Get directions\"."],
    maps_embed: ["Google Maps embed URL", "url", "Used for the map on About and Contact. Format: https://www.google.com/maps?q=YOUR+ADDRESS&output=embed"],
  },
  "Website texts": {
    tagline: ["Tagline", "text", "Top bar and footer."],
    hero_eyebrow: ["Home page — small line above the big heading", "text", ""],
    hero_lead: ["Home page — paragraph under the heading", "textarea", ""],
    students: ["Students assisted (number)", "text", "Example: 500+"],
    about_intro: ["About page — first paragraph", "textarea", ""],
    footer_text: ["Footer — short description", "textarea", ""],
    description: ["Google description (SEO)", "textarea", "Shown in Google search results. Keep it under 160 characters."],
  },
  "Social media": {
    instagram: ["Instagram link", "url", "Leave empty to hide."],
    facebook: ["Facebook link", "url", ""],
    linkedin: ["LinkedIn link", "url", ""],
    youtube: ["YouTube link", "url", ""],
  },
  "Legal & notifications": {
    legal_name: ["Legal entity name", "text", "Shown in Privacy Policy and Disclaimer."],
    grievance_name: ["Grievance officer / contact name", "text", ""],
    grievance_email: ["Grievance email", "email", ""],
    jurisdiction: ["Jurisdiction (city, state)", "text", ""],
    legal_updated: ["Privacy Policy / Disclaimer \"last updated\" date", "text", "Change this whenever those pages are edited."],
    notify_email: ["Send new enquiries to this email too", "email", "Optional. Needs a RESEND_API_KEY on Vercel (free at resend.com)."],
  },
};
