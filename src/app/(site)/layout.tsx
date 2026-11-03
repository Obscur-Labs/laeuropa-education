import { headers } from "next/headers";
import Script from "next/script";
import "./site.css";
import { getCountries, getSettings, whatsappLink } from "@/lib/content";
import { EuStars, Flag, Icon, WhatsappIcon } from "@/components/ui";
import NavLinks from "@/components/NavLinks";
import SiteEffects from "@/components/SiteEffects";

// Official ICEF agency record (account #5574) — the same badge the footer widget loads
const ICEF_PROFILE = "https://www.icef.com/agency/0016M00002a0VdjQAE";
const ICEF_BADGE = "https://icef-api-production.s3.eu-central-1.amazonaws.com/ias_material/0016M00002a0VdjQAE_badge.png";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const [s, countries] = await Promise.all([getSettings(), getCountries()]);
  const socials = (["instagram", "facebook", "linkedin", "youtube"] as const).filter((k) => /^https:\/\//.test(s[k] || ""));
  const socialLabel = { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", youtube: "YouTube" };

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <span className="topbar-tag"><EuStars size={40} className="mini-stars" /> {s.tagline}</span>
          <span className="topbar-links">
            <a href={`tel:+${s.phone_raw}`}><Icon name="phone" /> {s.phone}</a>
            <span className="hide-sm"><Icon name="clock" /> {s.hours}</span>
          </span>
        </div>
      </div>

      <header className="site-header" id="top">
        <div className="container header-inner">
          <a className="brand" href="/" aria-label={`${s.site_name} — Home`}>
            <img src="/img/logo.png" alt={s.site_name} width={907} height={208} />
          </a>
          <a className="icef-head" href={ICEF_PROFILE} target="_blank" rel="noopener noreferrer"
            title="Verify our ICEF accreditation on icef.com" aria-label="ICEF Accredited Agency — verify on icef.com">
            <img src={ICEF_BADGE} alt="ICEF Accredited Trusted Agency #5574" />
          </a>
          <nav className="main-nav" id="main-nav" aria-label="Main"><NavLinks /></nav>
          <button className="nav-toggle" aria-controls="main-nav" aria-expanded="false" aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="footer-stars"><EuStars size={600} /></div>
        <div className="container footer-grid">
          <div className="footer-brand">
            <a className="footer-logo" href="/"><img src="/img/logo.png" alt={s.site_name} width={907} height={208} loading="lazy" /></a>
            <p className="footer-tagline">{s.tagline}</p>
            <p>{s.footer_text}</p>
            <div className="icef-badge">
              <small>ICEF Agency Status</small>
              <span id="iasBadge" data-account-id="5574"></span>
            </div>
            {socials.length > 0 && (
              <div className="footer-social">
                {socials.map((k) => <a key={k} href={s[k]} target="_blank" rel="noopener noreferrer">{socialLabel[k]}</a>)}
              </div>
            )}
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/countries">Countries</a></li>
              <li><a href="/services">Services</a></li>
              <li><a href="/reviews">Student Reviews</a></li>
              <li><a href="/about#certifications">Certifications</a></li>
              <li><a href="/updates">Updates</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4>Destinations</h4>
            <ul className="footer-flags">
              {countries.slice(0, 6).map((c) => (
                <li key={c.code}><a href={`/countries#${c.code}`}><Flag code={c.code} name={c.name} /> {c.name}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Head Office</h4>
            <ul className="footer-contact">
              <li><Icon name="pin" /><a href={s.maps_url} target="_blank" rel="noopener noreferrer">{s.address}</a></li>
              <li><Icon name="phone" /><a href={`tel:+${s.phone_raw}`}>{s.phone}</a></li>
              {s.email && <li><Icon name="mail" /><a href={`mailto:${s.email}`}>{s.email}</a></li>}
              <li><Icon name="clock" /><span>{s.hours}</span></li>
            </ul>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} {s.site_name}. All rights reserved.</span>
          <nav className="footer-legal" aria-label="Legal">
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms">Terms &amp; Conditions</a>
            <a href="/disclaimer">Disclaimer</a>
            <a href="/admin/login" className="team-link" rel="nofollow">Team login</a>
          </nav>
          <span className="footer-note">We provide guidance and application assistance; admission and visa decisions rest solely with universities and authorities.</span>
        </div>
      </footer>

      <a className="wa-float" href={whatsappLink(s)} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"><WhatsappIcon /></a>

      <SiteEffects />
      <Script src="https://www-cdn.icef.com/scripts/iasbadgeid.js" strategy="lazyOnload" nonce={nonce} crossOrigin="anonymous" />
    </>
  );
}
