import { requirePageUser } from "@/lib/auth";
import { getAllReviews } from "@/lib/content";
import { mediaUrl } from "@/lib/store";
import Flash from "@/components/admin/Flash";
import ActionForm from "@/components/admin/ActionForm";
import { reviewOp } from "./actions";

export default async function ReviewsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requirePageUser();
  const sp = await searchParams;
  const reviews = await getAllReviews();
  return (
    <>
      <Flash ok={sp.ok} />
      <div className="page-head">
        <div>
          <h1>Student reviews</h1>
          <p className="muted">Shown on the home page (first 6) and on the Reviews page. Only published reviews with student consent appear.</p>
        </div>
        <a href="/admin/reviews/new" className="btn btn-primary">+ Add review</a>
      </div>
      {reviews.length === 0 ? <div className="empty">No reviews yet. <a href="/admin/reviews/new">Add the first student review →</a></div> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Student</th><th>Rating</th><th>Country</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {reviews.map((r, i) => (
                <tr key={r.id}>
                  <td><div className="t-title">
                    {r.photo ? <img src={mediaUrl(r.photo)} alt="" className="avatar" /> : <span className="avatar avatar-empty">{r.name.slice(0, 1)}</span>}
                    <div><a href={`/admin/reviews/${r.id}`}><strong>{r.name}</strong></a><small>{r.university}</small></div>
                  </div></td>
                  <td className="stars-cell">{"★".repeat(r.rating)}</td>
                  <td>{r.country.toUpperCase()}</td>
                  <td>{r.status === "published" && r.consent ? <span className="status status-published">Published</span> : <span className="status status-draft">Hidden</span>}</td>
                  <td className="t-actions">
                    <ActionForm action={reviewOp} className="inline"><input type="hidden" name="id" value={r.id} /><input type="hidden" name="op" value="up" />
                      <button type="submit" className="linkish" title="Move up" disabled={i === 0}>↑</button></ActionForm>
                    <ActionForm action={reviewOp} className="inline"><input type="hidden" name="id" value={r.id} /><input type="hidden" name="op" value="down" />
                      <button type="submit" className="linkish" title="Move down" disabled={i === reviews.length - 1}>↓</button></ActionForm>
                    <a href={`/admin/reviews/${r.id}`}>Edit</a>
                    <ActionForm action={reviewOp} className="inline" confirm="Delete this review and its photo permanently?">
                      <input type="hidden" name="id" value={r.id} /><input type="hidden" name="op" value="delete" />
                      <button type="submit" className="linkish danger">Delete</button></ActionForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
