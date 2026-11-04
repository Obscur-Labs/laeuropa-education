import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { getCountries, type Enquiry } from "@/lib/content";
import { listDocs } from "@/lib/store";
import { flagLookup } from "@/lib/admin-format";
import Flash from "@/components/admin/Flash";
import EnquiryTicket from "@/components/admin/EnquiryTicket";
import Icon from "@/components/admin/Icon";

const TABS = [["all", "All"], ["new", "New"], ["contacted", "Contacted"], ["closed", "Closed"]] as const;

export default async function Enquiries({ searchParams }: { searchParams: Promise<{ status?: string; ok?: string; q?: string }> }) {
  await requirePageUser();
  const sp = await searchParams;
  const [enquiries, countries] = await Promise.all([listDocs<Enquiry>("enquiries"), getCountries()]);
  const all = enquiries.sort((a, b) => b.id.localeCompare(a.id));
  const flag = flagLookup(countries);
  const filter = TABS.some(([k]) => k === sp.status) ? sp.status! : "all";
  const search = (sp.q ?? "").trim().slice(0, 80);
  const needle = search.toLowerCase();
  const digits = search.replace(/\D/g, "");
  const matches = (q: Enquiry) =>
    !needle ||
    [q.name, q.email, q.city, q.country, q.service, q.level, q.message].some((v) => v?.toLowerCase().includes(needle)) ||
    (digits.length >= 3 && q.phone.replace(/\D/g, "").includes(digits));
  const inTab = (k: string) => all.filter((q) => (k === "all" || q.status === k) && matches(q));
  const list = inTab(filter);
  const tabHref = (k: string) => `/admin/enquiries?status=${k}${search ? `&q=${encodeURIComponent(search)}` : ""}`;

  return (
    <>
      <Flash ok={sp.ok} />
      <div className="page-head">
        <div><h1>Enquiries</h1><p className="muted">Requests from the website&apos;s contact form. Times are India time.</p></div>
        {all.length > 0 && <a href="/admin/enquiries-export" className="btn btn-ghost">Download CSV</a>}
      </div>

      <div className="toolbar">
        <nav className="tabs" aria-label="Filter by status">
          {TABS.map(([k, l]) => <Link key={k} href={tabHref(k)} className={filter === k ? "on" : undefined} aria-current={filter === k ? "page" : undefined}>{l} <small>{inTab(k).length}</small></Link>)}
        </nav>
        <form className="search" action="/admin/enquiries" role="search">
          <input type="hidden" name="status" value={filter} />
          <Icon name="search" size={16} />
          <input type="search" name="q" defaultValue={search} placeholder="Search name, phone, city…" aria-label="Search enquiries" maxLength={80} />
        </form>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          {search ? <p>No enquiries match “{search}”. <Link href={`/admin/enquiries?status=${filter}`}>Clear the search</Link></p>
            : filter === "new" ? <p>No new enquiries. Everyone who wrote in has been contacted.</p>
            : <p>No enquiries here yet. They appear when someone sends the contact form on the website.</p>}
        </div>
      ) : (
        <div className="ticket-list">
          {list.map((q) => <EnquiryTicket key={q.id} q={q} flag={flag(q.country)} filter={filter} />)}
        </div>
      )}
    </>
  );
}
