import type { Metadata } from "next";
import { getCertificates, getCountries, getSettings } from "@/lib/content";
import { CertificateCard, CtaPass, Lightbox } from "@/components/blocks";
import { EuStars, Icon, PageHero } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: `About Us | ${s.site_name}`, description: `LA Europa Education is a study-abroad consultancy specialising in Europe. ${s.students} students assisted.` };
}

export default async function About() {
  const [s, countries, certificates] = await Promise.all([getSettings(), getCountries(), getCertificates()]);
  const studentsNum = parseInt(s.students, 10) || 0;
  const promises: Array<[string, string, string]> = [
    ["users", "One-to-one counselling", "Personal sessions focused on your profile, goals and budget."],
    ["shield", "Honest advice", "Realistic options — we tell you what will genuinely work."],
    ["doc", "Detail-perfect documents", "Careful checks on every form, letter and supporting document."],
    ["chat", "Always reachable", "Call, WhatsApp or visit — you always know where things stand."],
  ];

  return (
    <>
      <PageHero eyebrow="About LA Europa Education" title={<>One continent. <em>Complete focus.</em></>}
        lead="We are a study-abroad consultancy built around a single idea: students deserve a true specialist for Europe." crumb="About" />

      <section className="section">
        <div className="container about-intro">
          <div className="about-copy reveal">
            <p className="eyebrow">Who we are</p>
            <h2>Your expert guide to <em>studying in Europe</em></h2>
            <p>{s.about_intro}</p>
            <p>Whether you visit our head office in Surat or reach us by phone or WhatsApp from wherever you are, you get honest counselling, a clear plan and a team that stays with you until you&apos;re ready to fly.</p>
            <div className="signature"><EuStars size={60} className="mini-stars" /><span>{s.tagline}</span></div>
          </div>
          <div className="about-stats reveal">
            <div className="stat-card stat-blue"><strong data-count={studentsNum} data-suffix="+">{s.students}</strong><span>Students assisted</span></div>
            <div className="stat-card stat-red"><strong data-count={countries.length} data-suffix="+">{countries.length}+</strong><span>European destinations</span></div>
            <div className="stat-card stat-gold"><strong>1</strong><span>Continent, complete focus</span></div>
            <div className="stat-card stat-cream"><strong>3</strong><span>Core services, end to end</span></div>
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">What drives us</p>
            <h2>Our three words, <em>our promise</em></h2>
          </div>
          <div className="values-grid">
            <div className="value-card reveal"><span className="value-letter">E</span><h3>Explore</h3>
              <p>We open up the full map of Europe for you — countries, cities, universities and courses you may never have considered — and help you choose wisely.</p></div>
            <div className="value-card reveal"><span className="value-letter value-red">E</span><h3>Experience</h3>
              <p>Studying abroad is more than a degree. We prepare you for the people, culture and independence that make the European experience life-changing.</p></div>
            <div className="value-card reveal"><span className="value-letter value-gold">E</span><h3>Educate</h3>
              <p>Quality education is the goal. We guide you towards recognised institutions and programmes that build a real career.</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container mission-grid">
          <div className="mission-card reveal"><Icon name="compass" /><h3>Our Mission</h3>
            <p>To make European education accessible and understandable for every ambitious student — through transparent, personal and expert guidance at every step.</p></div>
          <div className="mission-card mission-navy reveal"><Icon name="globe" /><h3>Our Vision</h3>
            <p>To be the most trusted name for studying in Europe — known for honesty, detail and students who thrive after they land.</p></div>
        </div>
      </section>

      <section className="section section-navy">
        <div className="journey-stars"><EuStars size={700} className="eu-stars spin-slow" /></div>
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow eyebrow-light">How we work</p>
            <h2>What every student <em>can expect</em></h2>
          </div>
          <div className="promise-grid">
            {promises.map(([ic, t, d]) => <div key={t} className="promise reveal"><Icon name={ic} /><h3>{t}</h3><p>{d}</p></div>)}
          </div>
        </div>
      </section>

      {certificates.length > 0 && (
        <section className="section certs-section" id="certifications">
          <div className="container">
            <div className="section-head reveal">
              <p className="eyebrow">Certifications</p>
              <h2>Trained to <em>international standards</em></h2>
              <p className="section-lead">Our counselling is backed by professional certifications from ICEF Academy and AAERI. Tap any certificate to view it in full.</p>
            </div>
            <div className="cert-grid">
              {certificates.map((c, i) => <CertificateCard key={i} c={c} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container office-card reveal">
          <div className="office-info">
            <p className="eyebrow">Visit our office</p>
            <h2>Come say <em>hello</em></h2>
            <ul className="info-list">
              <li><Icon name="pin" /><span>{s.address}</span></li>
              <li><Icon name="clock" /><span>{s.hours}</span></li>
              <li><Icon name="phone" /><a href={`tel:+${s.phone_raw}`}>{s.phone}</a></li>
            </ul>
            <div className="btn-row">
              <a href={s.maps_url} className="btn btn-blue" target="_blank" rel="noopener noreferrer">Get directions</a>
              <a href="/contact" className="btn btn-outline">Send an enquiry</a>
            </div>
          </div>
          <div className="office-map">
            <iframe src={s.maps_embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="LA Europa Education on Google Maps"></iframe>
          </div>
        </div>
      </section>

      <CtaPass s={s} />
      <Lightbox />
    </>
  );
}
