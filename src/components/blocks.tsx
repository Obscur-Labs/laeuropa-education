import { createHash } from "node:crypto";
import { mediaUrl } from "@/lib/store";
import { formatDate, postExcerpt, whatsappLink, type Certificate, type Country, type Post, type Review, type Settings } from "@/lib/content";
import { EuStars, Flag, Icon, RatingStars, WhatsappIcon } from "./ui";

export function PostCover({ post, className = "post-cover" }: { post: Post; className?: string }) {
  if (post.cover) {
    return <div className={className}><img src={mediaUrl(post.cover)} alt="" loading="lazy" /></div>;
  }
  const hue = parseInt(createHash("md5").update(post.slug).digest("hex").slice(0, 2), 16) % 3;
  return (
    <div className={`${className} cover-gen cover-gen-${hue}`}>
      <EuStars size={200} />
      <span>{post.category || "News"}</span>
    </div>
  );
}

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article className={`post-card${featured ? " is-featured" : ""} reveal`}>
      <a href={`/updates/${encodeURIComponent(post.slug)}`} className="post-card-link">
        <PostCover post={post} />
        <div className="post-card-body">
          <div className="post-meta"><span className="chip">{post.category || "News"}</span><time dateTime={post.date}>{formatDate(post.date)}</time></div>
          <h3>{post.title}</h3>
          <p>{postExcerpt(post, featured ? 220 : 130)}</p>
          <span className="read-more">Read update <Icon name="arrow" /></span>
        </div>
      </a>
    </article>
  );
}

export function ReviewCard({ r, countries }: { r: Review; countries: Country[] }) {
  const initials = r.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase();
  const country = countries.find((c) => c.code === r.country);
  const sub = [r.course, r.university].filter(Boolean).join(" · ");
  const meta = [country?.name, r.intake].filter(Boolean).join(" · ");
  return (
    <article className="review-card reveal">
      <span className="review-quote" aria-hidden="true">“</span>
      <RatingStars n={r.rating} />
      <p className="review-text" style={{ whiteSpace: "pre-line" }}>{r.text}</p>
      <div className="review-who">
        <div className="review-photo">
          {r.photo ? <img src={mediaUrl(r.photo)} alt={r.name} loading="lazy" /> : <span>{initials}</span>}
          {country && <Flag code={country.code} name={country.name} className="review-flag" />}
        </div>
        <div>
          <strong>{r.name}</strong>
          {sub && <small>{sub}</small>}
          {meta && <small className="review-meta">{meta}</small>}
        </div>
      </div>
    </article>
  );
}

export function CertificateCard({ c }: { c: Certificate }) {
  const date = c.date ? formatDate(c.date, "month") : "";
  const img = mediaUrl(c.image);
  const pdf = mediaUrl(c.pdf);
  const landscape = c.wide ?? c.image.includes("aaeri-australia"); // built-in AAERI certificate is landscape
  const meta = [c.holder, date].filter(Boolean).join(" · ");
  if (!img) return null;
  return (
    <figure className={`cert-card reveal${landscape ? " is-landscape" : ""}`}>
      <button type="button" className="cert-thumb" data-lightbox={img}
        data-caption={`${c.title} — ${c.issuer}${date ? ", " + date : ""}`} data-pdf={pdf}
        aria-label={`View certificate: ${c.title}`}>
        <img src={img} alt={`${c.title} certificate`} loading="lazy" />
        <span className="cert-zoom"><Icon name="search" /></span>
      </button>
      <figcaption>
        <span className="cert-issuer">{c.issuer}</span>
        <strong>{c.title}</strong>
        {c.course && <small>{c.course}</small>}
        {meta && <small className="cert-meta">{meta}</small>}
      </figcaption>
    </figure>
  );
}

export function Lightbox() {
  return (
    <div className="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Certificate">
      <button type="button" className="lightbox-close" aria-label="Close">×</button>
      <figure>
        <img src="data:," alt="" />
        <figcaption><span></span><a href="#" target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light lightbox-pdf">Open PDF</a></figcaption>
      </figure>
    </div>
  );
}

export function CtaPass({ s }: { s: Settings }) {
  return (
    <section className="section cta-section">
      <div className="container">
        <div className="pass reveal">
          <div className="pass-main">
            <div className="pass-head">
              <span>Boarding Pass</span>
              <span className="pass-airline"><EuStars size={40} className="mini-stars" /> LA Europa Education</span>
            </div>
            <div className="pass-route">
              <div><small>From</small><strong>YOU</strong><span>Wherever you are</span></div>
              <div className="pass-plane"><span></span><Icon name="plane" /><span></span></div>
              <div><small>To</small><strong>EUR</strong><span>Your dream university</span></div>
            </div>
            <div className="pass-fields">
              <div><small>Passenger</small><span>You</span></div>
              <div><small>Class</small><span>Future Graduate</span></div>
              <div><small>Gate</small><span>Free Counselling</span></div>
              <div><small>Boarding</small><span>Today</span></div>
            </div>
          </div>
          <div className="pass-stub">
            <h3>Ready for take-off?</h3>
            <p>Book a free counselling session with our Europe experts.</p>
            <a href="/contact" className="btn btn-red">Book a session</a>
            <a href={whatsappLink(s)} className="btn btn-ghost-light" target="_blank" rel="noopener noreferrer"><WhatsappIcon /> WhatsApp us</a>
            <div className="barcode" aria-hidden="true"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
