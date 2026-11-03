import type { Metadata } from "next";
import { getSettings } from "@/lib/content";
import { PageHero } from "@/components/ui";
import { LegalContact, LegalLayout, type LegalSection } from "@/components/legal";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: `Privacy Policy | ${s.site_name}`, description: `How ${s.legal_name} collects, uses, stores and protects your personal data, and your rights under Indian law.` };
}

export default async function Privacy() {
  const s = await getSettings();
  const sections: LegalSection[] = [
    { id: "data-we-collect", title: "Personal data we collect", body: <>
      <p>We collect only the data we need to respond to you and to provide our services:</p>
      <ul>
        <li><strong>Enquiry details</strong> you submit through our contact form, phone, WhatsApp or email — such as your name, phone number, email address, city/state, preferred country, study level, the service you are interested in and your message.</li>
        <li><strong>Documents and information for our services</strong>, if you engage us — for example passport details, academic records, test scores, statements of purpose, recommendation letters, financial and sponsorship documents, and other information required by universities or immigration authorities.</li>
        <li><strong>Technical data</strong> that is automatically processed when you visit the website, such as your IP address, browser type and the pages you request. We use this only to operate and secure the website (for example, to prevent spam and abuse).</li>
      </ul>
      <p>We do not knowingly collect more data than necessary for the purposes described below.</p></> },
    { id: "how-we-use", title: "How we use your data", body: <>
      <ul>
        <li>To respond to your enquiry and offer counselling.</li>
        <li>To provide the services you request — country and university selection, application assistance and student visa / residence-permit application preparation assistance.</li>
        <li>To communicate with you about your application, appointments and deadlines by phone, SMS, WhatsApp or email.</li>
        <li>To share relevant updates about study opportunities in Europe, where you have agreed to receive them. You can opt out at any time.</li>
        <li>To maintain records, prevent fraud and misuse, and comply with legal obligations.</li>
      </ul>
      <p>We do not sell your personal data.</p></> },
    { id: "consent", title: "Consent and legal basis", body: <>
      <p>We process your personal data on the basis of your consent, which you give when you submit an enquiry or share your documents with us, or for other legitimate uses permitted under the DPDP Act (for example, where you voluntarily provide data for a specified purpose, or where processing is required by law).</p>
      <p>You may <strong>withdraw your consent at any time</strong> by contacting us using the details below. Withdrawal will not affect processing already carried out, but it may mean we can no longer provide some or all of our services to you.</p></> },
    { id: "sharing", title: "Who we share data with", body: <>
      <p>We share your personal data only where needed to provide our services or as required by law:</p>
      <ul>
        <li><strong>Universities and educational institutions</strong> you choose to apply to, and their authorised application portals or representatives.</li>
        <li><strong>Embassies, consulates, visa application centres and immigration authorities</strong>, when we assist with your visa or residence-permit file at your request.</li>
        <li><strong>Service providers</strong> who help us operate — such as our website hosting and database providers, email and communication tools — who may process data only on our instructions. Their servers may be located outside India.</li>
        <li><strong>Government or law-enforcement authorities</strong>, where we are legally required to do so.</li>
      </ul>
      <p>Because our services relate to studying abroad, your data may be transferred to and processed in countries outside India (for example, the country where your chosen university is located). Such transfers are made only for the purpose of your application and in accordance with applicable Indian law.</p></> },
    { id: "cookies", title: "Cookies and third-party services", body: <>
      <p>This website does not use advertising or tracking cookies. Our team uses a strictly necessary session cookie to stay signed in to the admin area.</p>
      <p>Some pages load content from third parties — Google Maps (map) and ICEF (our agency status badge). When these load, those providers may receive technical data such as your IP address, under their own privacy policies. Links to WhatsApp and other external sites are governed by those sites&apos; policies.</p></> },
    { id: "security", title: "How we protect your data", body: <>
      <p>We use reasonable security practices and procedures to protect personal data, including access restricted to authorised team members, password-protected systems, protection against automated abuse, and secure handling of documents. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>
      <p>If a personal data breach occurs, we will take steps to contain it and will notify affected individuals and the relevant authority as required by law.</p></> },
    { id: "retention", title: "How long we keep data", body:
      <p>We keep personal data only for as long as needed for the purpose it was collected — for example, for the duration of your enquiry or our engagement with you — and thereafter only as long as required for legal, accounting or record-keeping obligations. When data is no longer needed, or when you withdraw consent and no legal requirement applies, we delete it.</p> },
    { id: "your-rights", title: "Your rights", body: <>
      <p>Subject to applicable law, you have the right to:</p>
      <ul>
        <li><strong>Access</strong> a summary of the personal data we hold about you and how we process it;</li>
        <li><strong>Correct, complete or update</strong> inaccurate or incomplete data;</li>
        <li><strong>Erase</strong> your personal data when it is no longer needed for the purpose for which it was collected;</li>
        <li><strong>Withdraw consent</strong> at any time;</li>
        <li><strong>Grievance redressal</strong> — raise a complaint with our Grievance Officer; and</li>
        <li><strong>Nominate</strong> another individual to exercise your rights in the event of your death or incapacity.</li>
      </ul>
      <p>To exercise any of these rights, contact us using the details in section 11. We may need to verify your identity before acting on a request.</p></> },
    { id: "children", title: "Students under 18", body:
      <p>If you are under 18 years of age, please contact us together with your parent or legal guardian. We process personal data of minors only with verifiable consent of a parent or lawful guardian, and we do not track or target advertising at children.</p> },
    { id: "changes", title: "Changes to this policy", body:
      <p>We may update this policy from time to time. The &quot;Last updated&quot; date at the top shows when it was last revised. Significant changes will be highlighted on this website.</p> },
    { id: "grievance", title: "Contact & Grievance Officer", body: <>
      <p>For any question, request or complaint about your personal data, please contact our Grievance Officer:</p>
      <LegalContact s={s} />
      <p>We will acknowledge and resolve your grievance within the time required under applicable law. If you are not satisfied with our response, you may approach the Data Protection Board of India in accordance with the DPDP Act.</p></> },
  ];

  return (
    <>
      <PageHero eyebrow="Legal" title={<>Privacy <em>Policy</em></>} lead="How we collect, use and protect your personal data — and the rights you have over it." crumb="Privacy Policy" />
      <LegalLayout updated={s.legal_updated} sections={sections} intro={<>
        <p>This Privacy Policy explains how <strong>{s.legal_name}</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), with its head office at {s.address}, handles personal data collected through this website and in the course of providing our services. It is published in accordance with the Information Technology Act, 2000 and the rules made under it, and the Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;) and the rules made under it, as applicable.</p>
        <p>By using this website or sharing your personal data with us, you acknowledge that you have read and understood this policy. Where we rely on your consent, we will ask for it clearly and you may withdraw it at any time.</p>
      </>} />
    </>
  );
}
