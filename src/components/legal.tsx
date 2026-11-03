import type { ReactNode } from "react";
import type { Settings } from "@/lib/content";

export type LegalSection = { id: string; title: string; body: ReactNode };

export function LegalLayout({ sections, intro, updated, numbered = true }: {
  sections: LegalSection[]; intro: ReactNode; updated: string; numbered?: boolean;
}) {
  return (
    <section className="section section-tight">
      <div className="container legal-layout">
        <aside className="legal-toc">
          <p className="toc-title">On this page</p>
          <ol>{sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}</ol>
          <nav className="legal-switch" aria-label="Legal pages">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms">Terms &amp; Conditions</a>
            <a href="/disclaimer">Disclaimer</a>
          </nav>
        </aside>
        <div className="prose legal-prose">
          <p className="legal-updated">Last updated: {updated}</p>
          {intro}
          {sections.map((s, i) => (
            <div key={s.id}>
              <h2 id={s.id}>{numbered && <span className="legal-num">{i + 1}.</span>} {s.title}</h2>
              {s.body}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LegalContact({ s }: { s: Settings }) {
  const mail = s.grievance_email || s.email;
  return (
    <ul className="legal-contact">
      <li><strong>{s.grievance_name}</strong>, {s.legal_name}</li>
      <li>Address: {s.address}</li>
      <li>Phone: <a href={`tel:+${s.phone_raw}`}>{s.phone}</a></li>
      {mail && <li>Email: <a href={`mailto:${mail}`}>{mail}</a></li>}
      <li>Office hours: {s.hours}</li>
    </ul>
  );
}
