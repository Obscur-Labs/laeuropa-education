import type { Metadata } from "next";
import { getFaqs, getSettings } from "@/lib/content";
import { CtaPass } from "@/components/blocks";
import { EuStars, Icon, PageHero } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: `Our Services | ${s.site_name}`, description: "Country & university selection assistance, university application assistance and student visa / residence-permit application preparation assistance for Europe." };
}

const SERVICES = [
  {
    id: "selection", num: "I", icon: "compass", stage: "Explore",
    title: "Country and University Selection Assistance",
    lead: "The right choice at the start saves time, money and stress later. We help you pick a country, course and institution that genuinely fit you.",
    items: [
      "One-to-one profile evaluation — academics, scores, experience and goals",
      "Country comparison based on budget, language and career plans",
      "Course and university shortlisting with entry requirements",
      "Guidance on intakes, deadlines and timelines",
      "Overview of tuition, living costs and scholarship possibilities",
    ],
  },
  {
    id: "application", num: "II", icon: "doc", stage: "Experience",
    title: "University / Institution Application Assistance",
    lead: "A strong application tells your story clearly. We help you prepare and submit applications that are complete, accurate and on time.",
    items: [
      "Document checklist tailored to each university",
      "Guidance on Statement of Purpose, CV and motivation letters",
      "Help arranging recommendation letters and transcripts",
      "Application form filling and submission support",
      "Follow-up and tracking until you receive a decision",
    ],
  },
  {
    id: "visa", num: "III", icon: "passport", stage: "Educate",
    title: "Student Visa / Residence-Permit Application Preparation Assistance",
    lead: "Once you have your offer, we help you prepare a well-organised visa or residence-permit file that meets the requirements of your destination.",
    items: [
      "Country-specific visa / residence-permit document checklist",
      "Guidance on financial documents and proof of funds",
      "Form-filling assistance and file review",
      "Appointment and interview preparation guidance",
      "Pre-departure briefing — accommodation, travel and arrival tips",
    ],
  },
];

const STEPS: Array<[string, string]> = [
  ["Free counselling", "Meet our team, share your goals and get honest first advice."],
  ["Shortlist", "Receive a tailored list of countries, universities and courses."],
  ["Apply", "Prepare documents and submit applications with our assistance."],
  ["Offer letter", "Track decisions, compare offers and confirm your place."],
  ["Visa file", "Prepare your student visa / residence-permit application."],
  ["Fly to Europe", "Pre-departure guidance — and your new chapter begins."],
];

export default async function Services() {
  const [s, faqs] = await Promise.all([getSettings(), getFaqs()]);
  return (
    <>
      <PageHero eyebrow="Our services" title={<>Everything you need to <em>get to Europe</em></>}
        lead="Three focused services that cover your journey from first idea to final visa file." crumb="Services" />

      <section className="section">
        <div className="container">
          <div className="service-detail-list">
            {SERVICES.map((sv, i) => (
              <article key={sv.id} className={`service-detail reveal${i % 2 ? " is-flipped" : ""}`} id={sv.id}>
                <div className="service-art">
                  <span className="numeral-xl">{sv.num}</span>
                  <div className="service-art-icon"><Icon name={sv.icon} /></div>
                  <span className="stage-label">{sv.stage}</span>
                  <EuStars size={320} className="eu-stars spin-slow" />
                </div>
                <div className="service-copy">
                  <p className="eyebrow">Service {sv.num} · {sv.stage}</p>
                  <h2>{sv.title}</h2>
                  <p className="lead-dark">{sv.lead}</p>
                  <ul className="check-list">{sv.items.map((it) => <li key={it}><Icon name="check" /> {it}</li>)}</ul>
                  <a href={`/contact?service=${encodeURIComponent(sv.title)}`} className="btn btn-blue">Enquire about this service <Icon name="arrow" /></a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-navy">
        <div className="journey-stars"><EuStars size={700} className="eu-stars spin-slow" /></div>
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow eyebrow-light">Step by step</p>
            <h2>Your path, <em>mapped out</em></h2>
          </div>
          <ol className="timeline">
            {STEPS.map(([t, d], n) => <li key={t} className="reveal"><span className="t-num">{n + 1}</span><h3>{t}</h3><p>{d}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container faq-wrap">
          <div className="section-head reveal">
            <p className="eyebrow">FAQ</p>
            <h2>Questions students <em>often ask</em></h2>
          </div>
          <div className="faq">
            {faqs.map((f, i) => (
              <details key={i} className="reveal" open={i === 0}>
                <summary>{f.q}</summary>
                <p style={{ whiteSpace: "pre-line" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaPass s={s} />
    </>
  );
}
