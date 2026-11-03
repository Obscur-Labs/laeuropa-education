import type { Metadata } from "next";
import { getCertificates, getCountries, getPublicReviews, getPublishedPosts, getSettings } from "@/lib/content";
import { CertificateCard, CtaPass, Lightbox, PostCard, ReviewCard } from "@/components/blocks";
import { EuStars, Flag, Icon } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: `${s.site_name} — ${s.tagline}`,
    description: s.description,
    openGraph: { title: `${s.site_name} — ${s.tagline}`, description: s.description, images: ["/img/logo-square.webp"], type: "website" },
  };
}

export default async function Home() {
  const [s, countries, posts, reviews, certificates] = await Promise.all([
    getSettings(), getCountries(), getPublishedPosts(), getPublicReviews(), getCertificates(),
  ]);
  const inner = countries.slice(0, 6);
  const outer = countries.slice(6, 16);
  const latest = posts.slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true"></div>
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span className="dot"></span> {s.hero_eyebrow}</p>
            <h1 className="hero-title">
              <span className="w w1">Explore.</span>
              <span className="w w2">Experience.</span>
              <span className="w w3"><em>Educate.</em></span>
            </h1>
            <p className="hero-lead">{s.hero_lead}</p>
            <div className="hero-actions">
              <a href="/contact" className="btn btn-red btn-lg">Book Free Counselling <Icon name="arrow" /></a>
              <a href="/countries" className="btn btn-outline btn-lg">Explore Countries</a>
            </div>
            <div className="hero-proof">
              <div className="proof-item"><strong>{s.students}</strong><span>Students assisted</span></div>
              <div className="proof-item"><strong>{countries.length}+</strong><span>European countries</span></div>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="orbit">
              <div className="orbit-inner">
                <div className="ring ring-outer">
                  {outer.map((c, i) => (
                    <span key={c.code} className="sat" style={{ ["--a" as string]: `${i * (360 / outer.length)}deg` }}>
                      <Flag code={c.code} name={c.name} className="flag-lg" />
                    </span>
                  ))}
                </div>
                <div className="ring ring-inner">
                  {inner.map((c, i) => (
                    <span key={c.code} className="sat" style={{ ["--a" as string]: `${i * (360 / inner.length) + 15}deg` }}>
                      <Flag code={c.code} name={c.name} className="flag-xl" />
                    </span>
                  ))}
                </div>
                <div className="orbit-core">
                  <EuStars size={240} className="eu-stars spin-slow" />
                  <div className="core-text">
                    <small>Study in</small>
                    <strong>Europe</strong>
                    <span>{countries.length}+ countries</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flag-strip" aria-label="Study destinations">
        <div className="marquee">
          <div className="marquee-track">
            {[0, 1].flatMap((n) => countries.map((c) => (
              <a key={`${n}-${c.code}`} href={`/countries#${c.code}`} className="marquee-item" aria-hidden={n ? true : undefined} tabIndex={n ? -1 : undefined}>
                <Flag code={c.code} name={c.name} /><span>{c.name}</span>
              </a>
            )))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">What we do</p>
            <h2>Three services. <em>One destination.</em></h2>
            <p className="section-lead">We focus only on Europe — so every piece of advice comes from deep, country-by-country experience.</p>
          </div>
          <div className="service-grid">
            <article className="service-card reveal">
              <span className="numeral">I</span>
              <div className="service-icon"><Icon name="compass" /></div>
              <h3>Country &amp; University Selection Assistance</h3>
              <p>We match your profile, budget and career goals with the right country, course and institution.</p>
              <a href="/services#selection" className="link-arrow">Learn more <Icon name="arrow" /></a>
            </article>
            <article className="service-card reveal">
              <span className="numeral">II</span>
              <div className="service-icon"><Icon name="doc" /></div>
              <h3>University / Institution Application Assistance</h3>
              <p>Polished applications, SOPs and documents — submitted on time, tracked until you get your offer.</p>
              <a href="/services#application" className="link-arrow">Learn more <Icon name="arrow" /></a>
            </article>
            <article className="service-card reveal">
              <span className="numeral">III</span>
              <div className="service-icon"><Icon name="passport" /></div>
              <h3>Student Visa / Residence-Permit Application Preparation Assistance</h3>
              <p>A carefully prepared, checklist-perfect file for your student visa or residence permit.</p>
              <a href="/services#visa" className="link-arrow">Learn more <Icon name="arrow" /></a>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-navy journey">
        <div className="journey-stars"><EuStars size={700} className="eu-stars spin-slow" /></div>
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow eyebrow-light">Your journey with us</p>
            <h2>Explore. Experience. <em>Educate.</em></h2>
            <p className="section-lead">Our tagline is also our process — three stages that take you from curiosity to campus.</p>
          </div>
          <div className="journey-grid">
            <div className="journey-step reveal">
              <span className="journey-num">01</span>
              <h3>Explore</h3>
              <p>Discover the countries, universities and courses that truly fit you — with honest, expert counselling.</p>
            </div>
            <div className="journey-path" aria-hidden="true"><Icon name="plane" /></div>
            <div className="journey-step reveal">
              <span className="journey-num">02</span>
              <h3>Experience</h3>
              <p>We handle the application journey with you — documents, deadlines and university communication.</p>
            </div>
            <div className="journey-path" aria-hidden="true"><Icon name="plane" /></div>
            <div className="journey-step reveal">
              <span className="journey-num">03</span>
              <h3>Educate</h3>
              <p>Visa and residence-permit preparation, pre-departure guidance — and you&apos;re off to study in Europe.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head section-head-row reveal">
            <div>
              <p className="eyebrow">Destinations</p>
              <h2>Study across <em>Europe</em></h2>
            </div>
            <a href="/countries" className="btn btn-outline">All {countries.length} countries <Icon name="arrow" /></a>
          </div>
          <div className="country-mini-grid">
            {countries.filter((c) => c.popular).map((c) => (
              <a key={c.code} className="country-mini reveal" href={`/countries#${c.code}`}>
                <Flag code={c.code} name={c.name} className="flag-lg" />
                <div><h3>{c.name}</h3><span>{c.intake}</span></div>
                <Icon name="arrow" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container why-grid">
          <div className="why-copy reveal">
            <p className="eyebrow">Why LA Europa</p>
            <h2>Europe is not a side option for us. <em>It&apos;s our speciality.</em></h2>
            <p>Most consultancies spread themselves across every continent. We chose one — and learned it inside out. Admission systems, intakes, documentation and visa expectations differ from country to country, and that detail is exactly where students win or lose.</p>
            <a href="/about" className="btn btn-blue">Our story <Icon name="arrow" /></a>
          </div>
          <div className="why-list">
            <div className="why-item reveal"><Icon name="globe" /><div><h3>Europe specialists</h3><p>Focused expertise across {countries.length}+ European study destinations.</p></div></div>
            <div className="why-item reveal"><Icon name="users" /><div><h3>{s.students} students assisted</h3><p>Real experience guiding students through every step to Europe.</p></div></div>
            <div className="why-item reveal"><Icon name="shield" /><div><h3>Transparent guidance</h3><p>Clear advice, realistic options and no false promises.</p></div></div>
            <div className="why-item reveal"><Icon name="chat" /><div><h3>Wherever you are</h3><p>We accept files from students wherever they live — reach us on call or WhatsApp to get started.</p></div></div>
          </div>
        </div>
      </section>

      {certificates.length > 0 && (
        <section className="section certs-section">
          <div className="container">
            <div className="section-head section-head-row reveal">
              <div>
                <p className="eyebrow">Trained &amp; certified</p>
                <h2>Certified <em>education counsellors</em></h2>
                <p className="section-lead">Professionally trained through ICEF Academy and AAERI programmes — tap a certificate to view it.</p>
              </div>
              <a href="/about#certifications" className="btn btn-outline">All certifications <Icon name="arrow" /></a>
            </div>
            <div className="cert-grid cert-grid-home">
              {certificates.slice(0, 6).map((c, i) => <CertificateCard key={i} c={c} />)}
            </div>
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="section section-cream reviews-section">
          <div className="container">
            <div className="section-head section-head-row reveal">
              <div>
                <p className="eyebrow">Student stories</p>
                <h2>What our <em>students say</em></h2>
              </div>
              <a href="/reviews" className="btn btn-outline">All reviews <Icon name="arrow" /></a>
            </div>
            <div className="review-grid">
              {reviews.slice(0, 6).map((r) => <ReviewCard key={r.id} r={r} countries={countries} />)}
            </div>
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head section-head-row reveal">
              <div>
                <p className="eyebrow">Updates</p>
                <h2>Latest from <em>our desk</em></h2>
              </div>
              <a href="/updates" className="btn btn-outline">All updates <Icon name="arrow" /></a>
            </div>
            <div className="post-grid">
              {latest.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </div>
        </section>
      )}

      <CtaPass s={s} />
      <Lightbox />
    </>
  );
}
