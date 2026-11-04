import { requirePageUser } from "@/lib/auth";
import Link from "next/link";
import { formatDate, getAllPosts, todayYmd } from "@/lib/content";
import { mediaUrl } from "@/lib/store";
import Icon from "@/components/admin/Icon";
import Flash from "@/components/admin/Flash";
import ActionForm from "@/components/admin/ActionForm";
import { deletePost } from "./actions";

export default async function UpdatesAdmin({ searchParams }: { searchParams: Promise<{ status?: string; ok?: string; err?: string }> }) {
  await requirePageUser();
  const sp = await searchParams;
  const all = await getAllPosts();
  const filter = sp.status === "published" || sp.status === "draft" ? sp.status : "all";
  const posts = filter === "all" ? all : all.filter((p) => p.status === filter);
  const count = (k: string) => (k === "all" ? all.length : all.filter((p) => p.status === k).length);
  const today = todayYmd();

  return (
    <>
      <Flash ok={sp.ok} err={sp.err} />
      <div className="page-head">
        <div>
          <h1>Updates</h1>
          <p className="muted">Write news, visa updates and guides. Published updates appear on the website&apos;s Updates page.</p>
        </div>
        <Link href="/admin/updates/new" className="btn btn-primary"><Icon name="plus" size={16} />New update</Link>
      </div>
      <div className="tabs">
        {([["all", "All"], ["published", "Published"], ["draft", "Drafts"]] as const).map(([k, l]) => (
          <Link key={k} href={`/admin/updates?status=${k}`} className={filter === k ? "on" : undefined} aria-current={filter === k ? "page" : undefined}>{l} <small>{count(k)}</small></Link>
        ))}
      </div>
      {posts.length === 0 ? (
        <div className="empty"><p>No updates here yet. <Link href="/admin/updates/new">Write an update</Link></p></div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th className="th-actions">Actions</th></tr></thead>
            <tbody>
              {posts.map((p) => {
                const scheduled = p.status === "published" && p.date > today;
                return (
                  <tr key={p.id}>
                    <td><div className="t-title">
                      {p.cover ? <img src={mediaUrl(p.cover)} alt="" /> : <span className="thumb-gen"></span>}
                      <div><Link href={`/admin/updates/${p.id}`}><strong>{p.title}</strong></Link><small>{p.author}</small></div>
                    </div></td>
                    <td>{p.category}</td>
                    <td><span className={`status status-${scheduled ? "scheduled" : p.status}`}>{scheduled ? "Scheduled" : p.status === "published" ? "Published" : "Draft"}</span></td>
                    <td>{formatDate(p.date)}</td>
                    <td className="t-actions">
                      <a href={`/updates/${p.slug}`} target="_blank" rel="noopener noreferrer">View</a>
                      <Link href={`/admin/updates/${p.id}`}>Edit</Link>
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
