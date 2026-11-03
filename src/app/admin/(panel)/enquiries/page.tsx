import { requirePageUser } from "@/lib/auth";
import { phoneDigits, type Enquiry } from "@/lib/content";
import { listDocs } from "@/lib/store";
import Flash from "@/components/admin/Flash";
import ActionForm from "@/components/admin/ActionForm";
import { updateEnquiry } from "./actions";

const TABS = [["all", "All"], ["new", "New"], ["contacted", "Contacted"], ["closed", "Closed"]] as const;

export default async function Enquiries({ searchParams }: { searchParams: Promise<{ status?: string; ok?: string }> }) {
  await requirePageUser();
  const sp = await searchParams;
  const all = (await listDocs<Enquiry>("enquiries")).sort((a, b) => b.id.localeCompare(a.id));
  const filter = TABS.some(([k]) => k === sp.status) ? sp.status! : "all";
  const list = filter === "all" ? all : all.filter((q) => q.status === filter);
  const count = (k: string) => (k === "all" ? all.length : all.filter((q) => q.status === k).length);

  return (
    <>
      <Flash ok={sp.ok} />
      <div className="page-head">
        <div><h1>Enquiries</h1><p className="muted">Requests submitted through the website&apos;s contact form.</p></div>
        {all.length > 0 && <a href="/admin/enquiries-export" className="btn btn-ghost">Download CSV</a>}
      </div>
      <div className="tabs">
        {TABS.map(([k, l]) => <a key={k} href={`/admin/enquiries?status=${k}`} className={filter === k ? "on" : ""}>{l} <small>{count(k)}</small></a>)}
      </div>
      {list.length === 0 ? <div className="empty">No enquiries here yet.</div> : (
        <div className="enq-list">
          {list.map((q) => (
            <article key={q.id} className={`enq enq-${q.status}`}>
              <header>
                <div><strong>{q.name}</strong><span className={`status status-${q.status}`}>{q.status[0].toUpperCase() + q.status.slice(1)}</span></div>
                <time>{q.created_at}</time>
              </header>
              <div className="enq-grid">
                <div><small>Phone</small><a href={`tel:+${phoneDigits(q.phone)}`}>{q.phone}</a> · <a href={`https://wa.me/${phoneDigits(q.phone)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></div>
                {q.email && <div><small>Email</small><a href={`mailto:${q.email}`}>{q.email}</a></div>}
                {q.city && <div><small>City</small>{q.city}</div>}
                <div><small>Country</small>{q.country || "Not decided"}</div>
                {q.level && <div><small>Level</small>{q.level}</div>}
                <div><small>Service</small>{q.service}</div>
              </div>
              {q.message && <p className="enq-msg" style={{ whiteSpace: "pre-line" }}>{q.message}</p>}
              <div className="enq-actions">
                {(["new", "contacted", "closed"] as const).filter((st) => st !== q.status).map((st) => (
                  <ActionForm key={st} action={updateEnquiry} className="inline">
                    <input type="hidden" name="id" value={q.id} /><input type="hidden" name="op" value={st} /><input type="hidden" name="filter" value={filter} />
                    <button type="submit" className="btn btn-small">{st === "new" ? "Mark new" : st === "contacted" ? "Mark contacted" : "Close"}</button>
                  </ActionForm>
                ))}
                <ActionForm action={updateEnquiry} className="inline" confirm="Delete this enquiry permanently?">
                  <input type="hidden" name="id" value={q.id} /><input type="hidden" name="op" value="delete" /><input type="hidden" name="filter" value={filter} />
                  <button type="submit" className="btn btn-small btn-danger">Delete</button>
                </ActionForm>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
