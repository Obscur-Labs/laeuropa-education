import { requirePageUser } from "@/lib/auth";
import { formatDate, getAllPosts, todayYmd, type Enquiry } from "@/lib/content";
import { listDocs, mediaUrl } from "@/lib/store";
import Flash from "@/components/admin/Flash";
import ActionForm from "@/components/admin/ActionForm";
import { deletePost } from "./actions";

export default async function UpdatesAdmin({ searchParams }: { searchParams: Promise<{ status?: string; ok?: string; err?: string }> }) {
  await requirePageUser();
  const sp = await searchParams;
  const all = await getAllPosts();
  const filter = sp.status === "published" || sp.status === "draft" ? sp.status : "all";
  const posts = filter === "all" ? all : all.filter((p) => p.status === filter);
  const published = all.filter((p) => p.status === "published").length;
  const newEnq = (await listDocs<Enquiry>("enquiries")).filter((q) => q.status === "new").length;
  const today = todayYmd();

  return (
    <>
      <Flash ok={sp.ok} err={sp.err} />
      <div className="page-head">
        <div>
          <h1>Updates</h1>
          <p className="muted">Write news, visa updates and guides. Published updates appear on the website&apos;s Updates page.</p>
        </div>
        <a href="/admin/updates/new" className="btn btn-primary">+ New update</a>
      </div>
      <div className="stats">
        <div className="stat"><strong>{published}</strong><span>Published</span></div>
        <div className="stat"><strong>{all.length - published}</strong><span>Drafts</span></div>
        <a className="stat stat-link" href="/admin/enquiries"><strong>{newEnq}</strong><span>New enquiries →</span></a>
      </div>
      <div className="tabs">
        {([["all", "All"], ["published", "Published"], ["draft", "Drafts"]] as const).map(([k, l]) => (
          <a key={k} href={`/admin/updates?status=${k}`} className={filter === k ? "on" : ""}>{l}</a>
        ))}
      </div>
      {posts.length === 0 ? (
        <div className="empty">No updates here yet. <a href="/admin/updates/new">Write your first update →</a></div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {posts.map((p) => {
                const scheduled = p.status === "published" && p.date > today;
                return (
                  <tr key={p.id}>
                    <td><div className="t-title">
                      {p.cover ? <img src={mediaUrl(p.cover)} alt="" /> : <span className="thumb-gen"></span>}
                      <div><a href={`/admin/updates/${p.id}`}><strong>{p.title}</strong></a><small>{p.author}</small></div>
                    </div></td>
                    <td>{p.category}</td>
                    <td><span className={`status status-${scheduled ? "scheduled" : p.status}`}>{scheduled ? "Scheduled" : p.status === "published" ? "Published" : "Draft"}</span></td>
                    <td>{formatDate(p.date)}</td>
                    <td className="t-actions">
                      <a href={`/updates/${p.slug}`} target="_blank" rel="noopener noreferrer">View</a>
                      <a href={`/admin/updates/${p.id}`}>Edit</a>
                      <ActionForm action={deletePost} confirm="Delete this update permanently?" className="inline">
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="linkish danger">Delete</button>
                      </ActionForm>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
