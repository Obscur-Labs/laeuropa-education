import type { Metadata } from "next";
import { getPublishedPosts, getSettings, POST_CATEGORIES } from "@/lib/content";
import { CtaPass, PostCard } from "@/components/blocks";
import { EuStars, PageHero } from "@/components/ui";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: `Updates & Blog | ${s.site_name}`, description: "University updates, country news, immigration and embassy updates, visa news and guides from LA Europa Education." };
}

const PER_PAGE = 9;

export default async function Updates({ searchParams }: { searchParams: Promise<{ category?: string; page?: string }> }) {
  const sp = await searchParams;
  const [s, all] = await Promise.all([getSettings(), getPublishedPosts()]);
  const counts = all.reduce<Record<string, number>>((acc, p) => { acc[p.category || "News"] = (acc[p.category || "News"] || 0) + 1; return acc; }, {});
  const cats = [...new Set([...POST_CATEGORIES, ...Object.keys(counts)])];
  const category = typeof sp.category === "string" && cats.includes(sp.category) ? sp.category : "";
  const posts = category ? all.filter((p) => (p.category || "News") === category) : all;
  const pages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1));
  const shown = posts.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const link = (p: number) => {
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (p > 1) q.set("page", String(p));
    return "/updates" + (q.size ? "?" + q.toString() : "");
  };

  return (
    <>
      <PageHero eyebrow="Updates" title={<>News &amp; insights <em>from Europe</em></>}
        lead="University updates, country news, immigration and embassy updates, visa news and guides — straight from our counselling desk." crumb="Updates" />
      <section className="section section-tight">
        <div className="container">
          <div className="chips chips-links reveal" aria-label="Filter by category">
            <a href="/updates" className={`chip-btn${!category ? " is-active" : ""}`}>All</a>
            {cats.map((c) => (
              <a key={c} href={`/updates?category=${encodeURIComponent(c)}`} className={`chip-btn${category === c ? " is-active" : ""}`}>
                {c}{counts[c] ? <> <span className="chip-count">{counts[c]}</span></> : null}
              </a>
            ))}
          </div>

          {shown.length === 0 ? (
            <div className="empty-big reveal">
              <EuStars size={120} />
              {category ? (
                <><h2>No updates in “{category}” yet</h2>
                  <p>New updates in this category will appear here soon. <a href="/updates">See all updates</a> or <a href="/contact">talk to a counsellor</a>.</p></>
              ) : (
                <><h2>Updates coming soon</h2><p>Our team is preparing the latest news and guides. Meanwhile, <a href="/contact">talk to a counsellor</a>.</p></>
              )}
            </div>
          ) : (
            <>
              <div className="post-grid post-grid-page">
                {shown.map((p, i) => <PostCard key={p.id} post={p} featured={i === 0 && page === 1 && !category} />)}
              </div>
              {pages > 1 && (
                <nav className="pagination" aria-label="Pages">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <a key={p} href={link(p)} className={p === page ? "is-active" : ""} aria-current={p === page ? "page" : undefined}>{p}</a>
                  ))}
                </nav>
              )}
            </>
          )}
        </div>
      </section>
      <CtaPass s={s} />
    </>
  );
}
