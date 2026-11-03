import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { currentUser } from "@/lib/auth";
import { formatDate, getAllPosts, getPublishedPosts, getSettings, postExcerpt, readingTime, todayYmd, type Post } from "@/lib/content";
import { cleanPostHtml } from "@/lib/sanitize";
import { mediaUrl } from "@/lib/store";
import { PostCard } from "@/components/blocks";
import { EuStars, Icon, WhatsappIcon } from "@/components/ui";

async function findPost(slug: string): Promise<{ post: Post; preview: boolean } | null> {
  if (!/^[a-z0-9-]{1,90}$/.test(slug)) return null;
  const post = (await getAllPosts()).find((p) => p.slug === slug);
  if (!post) return null;
  const isPublic = post.status === "published" && post.date <= todayYmd();
  if (isPublic) return { post, preview: false };
  // Drafts and scheduled posts are visible only to signed-in team members, as a preview
  return (await currentUser()) ? { post, preview: true } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [s, found] = await Promise.all([getSettings(), findPost(slug)]);
  if (!found) return { title: `Page not found | ${s.site_name}` };
  const p = found.post;
  return {
    title: `${p.title} | ${s.site_name}`,
    description: postExcerpt(p, 160),
    openGraph: { title: p.title, description: postExcerpt(p, 160), images: [p.cover ? mediaUrl(p.cover) : "/img/logo-square.webp"], type: "article" },
    robots: found.preview ? { index: false, follow: false } : undefined,
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await findPost(slug);
  if (!found) notFound();
  const { post, preview } = found;
  const related = (await getPublishedPosts()).filter((p) => p.id !== post.id).slice(0, 3);
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const proto = h.get("x-forwarded-proto") || "https";
  const base = (process.env.SITE_URL || `${proto}://${host}`).replace(/\/$/, "");
  const shareUrl = `${base}/updates/${post.slug}`;

  return (
    <>
      {preview && (
        <div className="preview-bar">Preview — this update is <strong>{post.status === "published" ? `scheduled for ${formatDate(post.date)}` : "a draft"}</strong> and not visible to the public. <a href={`/admin/updates/${post.id}`}>Edit</a></div>
      )}
      <article className="article">
        <header className="article-hero">
          <div className="page-hero-stars"><EuStars size={520} className="eu-stars spin-slow" /></div>
          <div className="container article-head">
            <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/updates">Updates</a><span>/</span><span>{post.category || "News"}</span></nav>
            <div className="post-meta post-meta-light">
              <a className="chip" href={`/updates?category=${encodeURIComponent(post.category || "News")}`}>{post.category || "News"}</a>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>{readingTime(post.content)}</span>
            </div>
            <h1>{post.title}</h1>
            {post.excerpt && <p className="lead">{post.excerpt}</p>}
            {post.author && <p className="byline">By {post.author}</p>}
          </div>
        </header>

        <div className="container article-layout">
          {post.cover && <figure className="article-cover"><img src={mediaUrl(post.cover)} alt="" /></figure>}
          {/* Content is sanitised when saved and again here before rendering */}
          <div className="prose" dangerouslySetInnerHTML={{ __html: cleanPostHtml(post.content) }} />
          <aside className="article-side">
            <div className="side-card">
              <h3>Share this update</h3>
              <div className="share-row">
                <a href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="share-btn"><WhatsappIcon /> WhatsApp</a>
                <button type="button" className="share-btn" data-copy={shareUrl}>Copy link</button>
              </div>
            </div>
            <div className="side-card side-card-navy">
              <EuStars size={80} className="mini-stars" />
              <h3>Have questions?</h3>
              <p>Talk to our Europe experts — free counselling.</p>
              <a href="/contact" className="btn btn-red">Book a session</a>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section section-cream">
          <div className="container">
            <div className="section-head section-head-row reveal">
              <div><p className="eyebrow">Keep reading</p><h2>More <em>updates</em></h2></div>
              <a href="/updates" className="btn btn-outline">All updates <Icon name="arrow" /></a>
            </div>
            <div className="post-grid">{related.map((p) => <PostCard key={p.id} post={p} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
