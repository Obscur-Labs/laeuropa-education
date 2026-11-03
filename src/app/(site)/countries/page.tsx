import type { Metadata } from "next";
import { getCountries, getSettings } from "@/lib/content";
import { CtaPass } from "@/components/blocks";
import { Flag, Icon, PageHero } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: `Study Destinations in Europe | ${s.site_name}`, description: "Study in the UK, Ireland, Germany, France, Italy, Netherlands, Poland, Malta and more with LA Europa Education." };
}

export default async function Countries() {
  const [s, countries] = await Promise.all([getSettings(), getCountries()]);
  const regions = [...new Set(countries.map((c) => c.region))].sort();

  return (
    <>
      <PageHero eyebrow="Study destinations" title={<>Choose your <em>Europe</em></>}
        lead={`From the lecture halls of London to the canals of Amsterdam — explore ${countries.length} destinations where we guide students every year.`} crumb="Countries" />

      <section className="section section-tight">
        <div className="container">
          <div className="country-tools reveal">
            <label className="search-box">
              <Icon name="search" />
              <input type="search" id="country-search" placeholder="Search a country or course…" aria-label="Search countries" />
            </label>
            <div className="chips" role="group" aria-label="Filter by region">
              <button className="chip-btn is-active" data-region="all">All</button>
              {regions.map((r) => <button key={r} className="chip-btn" data-region={r}>{r}</button>)}
            </div>
          </div>

          <div className="country-grid" id="country-grid">
            {countries.map((c) => (
              <article key={c.code} className="country-card reveal" id={c.code} data-region={c.region}
                data-search={`${c.name} ${c.tags.join(" ")} ${c.region}`.toLowerCase()}>
                <div className="country-top">
                  <div className="flag-ring"><Flag code={c.code} name={c.name} className="flag-xl" /></div>
                  <div><h3>{c.name}</h3><span className="region">{c.region}</span></div>
                  {c.popular && <span className="badge">Popular</span>}
                </div>
                <p>{c.blurb}</p>
                <dl className="country-facts">
                  <div><dt>Intakes</dt><dd>{c.intake}</dd></div>
                  <div><dt>Teaching</dt><dd>{c.lang}</dd></div>
                </dl>
                <div className="tags">{c.tags.map((t) => <span key={t}>{t}</span>)}</div>
                <a href={`/contact?country=${encodeURIComponent(c.name)}`} className="link-arrow">Plan my {c.name} study <Icon name="arrow" /></a>
              </article>
            ))}
          </div>
          <p className="empty-state" id="country-empty" hidden>No country matches your search. <a href="/contact">Ask our counsellors</a> — we probably still can help.</p>
          <p className="fine-print">Intakes and teaching languages are indicative and vary by university and programme. Our counsellors will confirm the latest details for your course.</p>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container compare reveal">
          <div>
            <p className="eyebrow">Not sure where to start?</p>
            <h2>We&apos;ll help you <em>shortlist</em></h2>
            <p>Tell us your course, budget and goals. We&apos;ll compare countries side by side and suggest a shortlist that fits — before you spend anything on applications.</p>
          </div>
          <ul className="check-list">
            {["Course availability & entry requirements", "Tuition and living-cost comparison", "Intake timelines and deadlines", "Post-study and career pathways", "Visa / residence-permit requirements"]
              .map((t) => <li key={t}><Icon name="check" /> {t}</li>)}
          </ul>
        </div>
      </section>

      <CtaPass s={s} />
    </>
  );
}
