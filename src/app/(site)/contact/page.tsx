import type { Metadata } from "next";
import { getCountries, getSettings, whatsappLink } from "@/lib/content";
import { EuStars, Icon, PageHero, WhatsappIcon } from "@/components/ui";
import ContactForm from "./ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: `Contact Us | ${s.site_name}`, description: `Book a free counselling session with LA Europa Education. Call ${s.phone}.` };
}

export default async function Contact({ searchParams }: { searchParams: Promise<{ sent?: string; country?: string; service?: string }> }) {
  const sp = await searchParams;
  const [s, countries] = await Promise.all([getSettings(), getCountries()]);
  const names = countries.map((c) => c.name);
  const preCountry = typeof sp.country === "string" && names.includes(sp.country) ? sp.country : "";

  return (
    <>
      <PageHero eyebrow="Contact" title={<>Let&apos;s plan your <em>journey to Europe</em></>}
        lead="Wherever you are, book a free counselling session — call us, WhatsApp us, visit our head office or send us your details below." crumb="Contact" />
      <section className="section section-tight">
        <div className="container contact-grid">
          <div className="contact-form-card reveal">
            {sp.sent ? (
              <div className="success-box">
                <EuStars size={120} className="eu-stars spin-slow" />
                <h2>Thank you! <em>We&apos;ve got your enquiry.</em></h2>
                <p>Our counsellor will call you shortly during office hours ({s.hours}). For a faster reply, message us on WhatsApp.</p>
                <div className="btn-row center">
                  <a href={whatsappLink(s)} className="btn btn-blue" target="_blank" rel="noopener noreferrer"><WhatsappIcon /> WhatsApp us</a>
                  <a href="/countries" className="btn btn-outline">Explore countries</a>
                </div>
              </div>
            ) : (
              <>
                <h2>Book free counselling</h2>
                <p className="muted">Fill in your details and our team will get back to you.</p>
                <ContactForm countries={names} preCountry={preCountry} preService={typeof sp.service === "string" ? sp.service : ""} legalName={s.legal_name} />
              </>
            )}
          </div>
          <aside className="contact-side">
            <a className="contact-tile reveal" href={`tel:+${s.phone_raw}`}><Icon name="phone" /><div><small>Call us</small><strong>{s.phone}</strong></div></a>
            <a className="contact-tile tile-wa reveal" href={whatsappLink(s)} target="_blank" rel="noopener noreferrer"><WhatsappIcon /><div><small>WhatsApp</small><strong>Chat with a counsellor</strong></div></a>
            {s.email && <a className="contact-tile reveal" href={`mailto:${s.email}`}><Icon name="mail" /><div><small>Email</small><strong>{s.email}</strong></div></a>}
            <a className="contact-tile reveal" href={s.maps_url} target="_blank" rel="noopener noreferrer"><Icon name="pin" /><div><small>Head office</small><strong>{s.address}</strong></div></a>
            <div className="contact-tile tile-static reveal"><Icon name="clock" /><div><small>Office hours</small><strong>{s.hours}</strong></div></div>
          </aside>
        </div>
      </section>
      <section className="map-section">
        <iframe src={s.maps_embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="LA Europa Education on Google Maps"></iframe>
      </section>
    </>
  );
}
