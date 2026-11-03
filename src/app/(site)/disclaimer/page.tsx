import type { Metadata } from "next";
import { getSettings } from "@/lib/content";
import { PageHero } from "@/components/ui";
import { LegalContact, LegalLayout, type LegalSection } from "@/components/legal";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: `Disclaimer | ${s.site_name}`, description: `Important information about the scope of services and website content of ${s.legal_name}.` };
}

export default async function Disclaimer() {
  const s = await getSettings();
  const sections: LegalSection[] = [
    { id: "independent", title: "Independent consultancy", body:
      <p>{s.legal_name} is an independent education consultancy. We are <strong>not affiliated with, endorsed by or acting on behalf of</strong> any government, embassy, consulate, visa application centre or immigration authority. References to universities, institutions or countries do not imply any partnership or endorsement unless expressly stated.</p> },
    { id: "no-guarantee", title: "No guarantee of outcomes", body:
      <p>Admissions, scholarships, visas and residence permits are decided solely by the respective universities and authorities. We do not guarantee any admission, scholarship, visa, residence permit, job, post-study work right or immigration outcome.</p> },
    { id: "accuracy", title: "Accuracy of information", body:
      <p>Details about intakes, courses, tuition, living costs, language requirements, scholarships, post-study work options and visa rules are indicative and may change without notice. While we try to keep content current, we make no warranty that it is complete, accurate or up to date. Always verify requirements with our counsellors and with official university and government sources before making decisions or payments.</p> },
    { id: "not-legal-advice", title: "Not legal or immigration advice", body:
      <p>Content on this website, including articles in our Updates section, does not constitute legal, immigration or financial advice. For advice on your specific legal circumstances, please consult a qualified professional.</p> },
    { id: "testimonials", title: "Student results", body:
      <p>Any figures such as &quot;{s.students} students assisted&quot; reflect our past experience. Individual results depend on each student&apos;s profile, documents and the decisions of third parties, and past results do not guarantee future outcomes.</p> },
    { id: "external-links", title: "External links", body:
      <p>This website contains links to third-party websites. We are not responsible for the content, accuracy or practices of those websites.</p> },
    { id: "fraud", title: "Beware of fraud", body:
      <p>We will never ask you to pay money for a &quot;guaranteed&quot; visa or admission. Please make payments only to the official accounts communicated by us in writing and always ask for a receipt. If anyone contacts you claiming to represent us and something seems wrong, call us directly on <a href={`tel:+${s.phone_raw}`}>{s.phone}</a>.</p> },
    { id: "contact", title: "Questions", body: <><p>If you have any questions about this disclaimer, please contact us:</p><LegalContact s={s} /></> },
  ];
  return (
    <>
      <PageHero eyebrow="Legal" title="Disclaimer" lead="Please read this carefully before relying on information on this website." crumb="Disclaimer" />
      <LegalLayout updated={s.legal_updated} sections={sections}
        intro={<p>The information on this website is published by <strong>{s.legal_name}</strong> in good faith and for general information purposes only.</p>} />
    </>
  );
}
