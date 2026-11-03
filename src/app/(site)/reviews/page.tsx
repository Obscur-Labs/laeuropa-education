import type { Metadata } from "next";
import { getCountries, getPublicReviews, getSettings } from "@/lib/content";
import { CtaPass, ReviewCard } from "@/components/blocks";
import { EuStars, PageHero, RatingStars } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: `Student Reviews | ${s.site_name}`, description: "Read what students say about studying abroad with LA Europa Education." };
}

export default async function Reviews() {
  const [s, reviews, countries] = await Promise.all([getSettings(), getPublicReviews(), getCountries()]);
  const avg = reviews.length ? Math.round((reviews.reduce((a, r) => a + (r.rating || 5), 0) / reviews.length) * 10) / 10 : 0;

  return (
    <>
      <PageHero eyebrow="Student reviews" title={<>Stories from <em>our students</em></>}
        lead="Real experiences from students we have guided on their journey to study abroad." crumb="Reviews" />
      <section className="section section-tight">
        <div className="container">
          {reviews.length > 0 ? (
            <>
              <div className="reviews-summary reveal">
                <strong>{avg.toFixed(1)}</strong>
                <div><RatingStars n={avg} /><span>Based on {reviews.length} student review{reviews.length === 1 ? "" : "s"}</span></div>
              </div>
              <div className="review-grid review-grid-page">
                {reviews.map((r) => <ReviewCard key={r.id} r={r} countries={countries} />)}
              </div>
              <p className="fine-print center">Reviews are shared with each student&apos;s written consent. Individual outcomes depend on each student&apos;s profile and the decisions of universities and authorities.</p>
            </>
          ) : (
            <div className="empty-big reveal">
              <EuStars size={120} />
              <h2>Student stories coming soon</h2>
              <p>We&apos;re collecting stories from our students. Meanwhile, <a href="/contact">talk to a counsellor</a>.</p>
            </div>
          )}
        </div>
      </section>
      <CtaPass s={s} />
    </>
  );
}
