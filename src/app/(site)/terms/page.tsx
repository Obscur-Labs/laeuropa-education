import type { Metadata } from "next";
import { getSettings } from "@/lib/content";
import TERMS_HTML from "@/data/terms-html";
import { PageHero } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: `Terms & Conditions of Service | ${s.site_name}`, description: "Terms & Conditions of Service - Student Advisory Services of La Europa Education, a brand operated by Euroverse Service LLP." };
}

const TOC: Array<[string, string]> = [
  ["c1", "Introduction and About Us"], ["c2", "Definitions and Interpretation"], ["c3", "Acceptance of these Terms"],
  ["c4", "Eligibility, Onboarding and Right to Decline"], ["c5", "Scope of Services"], ["c6", "Nature of Our Role"],
  ["c7", "Services Not Provided"], ["c8", "No Guarantee of Admission"], ["c9", "No Guarantee of Visa or Permit"],
  ["c10", "Accuracy of Information"], ["c11", "Student's Responsibilities"], ["c12", "Document Authenticity"],
  ["c13", "Anti-Bribery & AML"], ["c14", "Professional Fee"], ["c15", "Third-Party Fees, Taxes and Currency"],
  ["c16", "Commission Disclosure"], ["c17", "Refund Policy"], ["c18", "Late Payment, Set-off and Recovery"],
  ["c19", "Timelines, Deadlines and Intakes"], ["c20", "Communication Policy"], ["c21", "Data Protection and Privacy"],
  ["c22", "Confidentiality"], ["c23", "Brand, Trade Marks and IP"], ["c24", "Testimonials and Social Media"],
  ["c25", "Force Majeure"], ["c26", "Suspension and Termination"], ["c27", "Limitation of Liability and Indemnity"],
  ["c28", "Grievance Redressal"], ["c29", "Governing Law and Disputes"], ["c30", "General Provisions"],
  ["c31", "Notices"], ["c32", "Student's Acknowledgement"], ["annexure", "Annexure — Contact Directory"],
];

export default async function Terms() {
  // The company's official Terms document, reproduced word for word (static, trusted content)
  const html = TERMS_HTML;
  return (
    <>
      <PageHero eyebrow="Legal" title={<>Terms &amp; <em>Conditions</em></>} lead="Terms & Conditions of Service - Student Advisory Services" crumb="Terms & Conditions" />
      <section className="section section-tight">
        <div className="container legal-layout">
          <aside className="legal-toc">
            <p className="toc-title">On this page</p>
            <ol className="tc-toc">{TOC.map(([id, t]) => <li key={id}><a href={`#${id}`}>{t}</a></li>)}</ol>
            <nav className="legal-switch" aria-label="Legal pages">
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/terms">Terms &amp; Conditions</a>
              <a href="/disclaimer">Disclaimer</a>
            </nav>
          </aside>
          <div className="prose legal-prose tc" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </section>
    </>
  );
}
