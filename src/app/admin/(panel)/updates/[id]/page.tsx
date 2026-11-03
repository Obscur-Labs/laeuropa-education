import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import { getAllPosts, POST_CATEGORIES, todayYmd, type Post } from "@/lib/content";
import { mediaUrl } from "@/lib/store";
import Flash from "@/components/admin/Flash";
import ActionForm from "@/components/admin/ActionForm";
import RichEditor from "@/components/admin/RichEditor";
import { savePost } from "../actions";

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const user = await requirePageUser();
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "new";
  let post: Post | undefined;
  if (!isNew) {
    if (!/^[a-f0-9]{12}$/.test(id)) notFound();
    post = (await getAllPosts()).find((p) => p.id === id);
    if (!post) notFound();
  }
  const p: Post = post ?? {
    id: "", slug: "", title: "", excerpt: "", category: "News", cover: "", content: "", status: "draft",
    author: user.name, date: todayYmd(), created_at: "", updated_at: "",
  };

  return (
    <>
      <Flash ok={sp.ok} />
      <div className="page-head">
        <div>
          <a href="/admin/updates" className="back-link">← All updates</a>
          <h1>{isNew ? "New update" : "Edit update"}</h1>
        </div>
        {!isNew && <a href={`/updates/${p.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">{p.status === "published" ? "View on site ↗" : "Preview ↗"}</a>}
      </div>

      <ActionForm action={savePost}>
        <div className="editor-layout">
          <input type="hidden" name="id" value={p.id} />
          <div className="editor-main">
            <input type="text" name="title" className="title-input" placeholder="Update title…" defaultValue={p.title} required maxLength={200} />
            <label className="field-label">Short summary <small>(shown on cards and Google — 1–2 sentences)</small>
              <textarea name="excerpt" rows={2} maxLength={300} defaultValue={p.excerpt} />
            </label>
            <div className="field-label">Content</div>
            <RichEditor name="content" initialHtml={p.content} />
            <p className="hint">Tip: use headings for sections, and the image button to add pictures inside the article.</p>
          </div>
          <aside className="editor-side">
            <div className="panel">
              <h3>Publish</h3>
              <label className="field-label">Status
                <select name="status" defaultValue={p.status}>
                  <option value="draft">Draft (hidden)</option>
                  <option value="published">Published (live)</option>
                </select>
              </label>
              <label className="field-label">Date <small>(a future date schedules it)</small>
                <input type="date" name="date" defaultValue={p.date} />
              </label>
              <button type="submit" className="btn btn-primary btn-block">Save</button>
            </div>
            <div className="panel">
              <h3>Details</h3>
              <label className="field-label">Category
                <select name="category" defaultValue={POST_CATEGORIES.includes(p.category as never) ? p.category : "News"}>
                  {POST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="field-label">Author<input type="text" name="author" defaultValue={p.author} maxLength={80} /></label>
              {!isNew && <>
                <p className="hint">Link: <code>/updates/{p.slug}</code></p>
                <label className="check"><input type="checkbox" name="regen_slug" value="1" /> Update link from new title</label>
              </>}
            </div>
            <div className="panel">
              <h3>Cover image</h3>
              {p.cover ? <>
                <img src={mediaUrl(p.cover)} alt="" className="cover-preview" />
                <label className="check"><input type="checkbox" name="remove_cover" value="1" /> Remove cover</label>
              </> : <p className="hint">No cover — a branded EU-star cover will be shown automatically.</p>}
              <input type="file" name="cover" accept="image/jpeg,image/png,image/webp,image/gif" data-max="1600" />
              <p className="hint">JPG/PNG/WebP. Landscape (16:9) looks best — resized automatically.</p>
            </div>
          </aside>
        </div>
      </ActionForm>
    </>
  );
}
