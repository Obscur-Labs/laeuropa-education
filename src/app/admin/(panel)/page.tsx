import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { formatDate, getAllPosts, getAllReviews, getCertificates, getCountries, getFaqs, todayYmd, type Enquiry } from "@/lib/content";
import { listDocs } from "@/lib/store";
import { enquiryTime, flagLookup, greeting, isOverdue, istLongDate, timeAgo } from "@/lib/admin-format";
import Flash from "@/components/admin/Flash";
import EnquiryTicket from "@/components/admin/EnquiryTicket";
import Icon, { type IconName } from "@/components/admin/Icon";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const user = await requirePageUser();
  const sp = await searchParams;
  const [enquiries, posts, reviews, certificates, countries, faqs] = await Promise.all([
    listDocs<Enquiry>("enquiries"), getAllPosts(), getAllReviews(), getCertificates(), getCountries(), getFaqs(),
  ]);

  const flag = flagLookup(countries);
  const waiting = enquiries.filter((q) => q.status === "new").sort((a, b) => b.id.localeCompare(a.id));
  const overdue = waiting.filter((q) => isOverdue(q)).length;
  const inProgress = enquiries.filter((q) => q.status === "contacted").length;
  const oldest = waiting.at(-1);

  const today = todayYmd();
  const live = posts.filter((p) => p.status === "published" && p.date <= today).length;
  const scheduled = posts.filter((p) => p.status === "published" && p.date > today).length;
  const drafts = posts.filter((p) => p.status === "draft").length;
  const liveReviews = reviews.filter((r) => r.status === "published" && r.consent).length;
  const recent = [...posts].sort((a, b) => (b.updated_at || b.created_at).localeCompare(a.updated_at || a.created_at)).slice(0, 4);

  const glance: [IconName, string, string, string][] = [
    ["updates", "Updates", [`${live} live`, scheduled && `${scheduled} scheduled`, drafts && plural(drafts, "draft", "drafts")].filter(Boolean).join(" · "), "/admin/updates"],
    ["star", "Student reviews", `${liveReviews} live${reviews.length > liveReviews ? ` · ${reviews.length - liveReviews} hidden` : ""}`, "/admin/reviews"],
    ["award", "Certificates", String(certificates.length), "/admin/certificates"],
    ["globe", "Countries", String(countries.length), "/admin/countries"],
    ["help", "FAQs", String(faqs.length), "/admin/faqs"],
  ];

  return (
    <>
      <Flash ok={sp.ok} err={sp.err} />
      <header className="dash-head">
        <div>
          <p className="dash-date">{istLongDate()}</p>
          <h1>{greeting()}, {user.name.split(" ")[0]}</h1>
          <p className="dash-summary">
            {waiting.length === 0
              ? "No new enquiries. Everyone who wrote in has been contacted."
              : <>
                  <strong>{plural(waiting.length, "new enquiry is", "new enquiries are")} waiting for a call.</strong>{" "}
                  {overdue > 0 ? <span className="overdue-text">{plural(overdue, "has", "have")} waited more than a day.</span>
                    : oldest && `The oldest came in ${timeAgo(enquiryTime(oldest))} ago.`}
                </>}
            {inProgress > 0 && <> {plural(inProgress, "student is", "students are")} in progress.</>}
          </p>
        </div>
      </header>

      <div className="dash-grid">
        <section className="dash-queue" aria-labelledby="queue-title">
          <div className="section-head">
            <h2 id="queue-title">Waiting for a call</h2>
            <Link href="/admin/enquiries" className="more-link">All enquiries <Icon name="arrow" size={15} /></Link>
          </div>
          {waiting.length === 0 ? (
            <div className="empty">
              <Icon name="check" size={22} />
              <p>New enquiries from the website&apos;s contact form appear here first.</p>
              <Link href="/admin/enquiries?status=contacted">See students in progress</Link>
            </div>
          ) : (
            <div className="ticket-list">
              {waiting.slice(0, 5).map((q) => <EnquiryTicket key={q.id} q={q} flag={flag(q.country)} from="dashboard" compact />)}
              {waiting.length > 5 && <Link href="/admin/enquiries?status=new" className="more-row">{plural(waiting.length - 5, "more new enquiry", "more new enquiries")} <Icon name="arrow" size={15} /></Link>}
            </div>
          )}
        </section>

        <aside className="dash-side">
          <section className="panel">
            <h2>On the website</h2>
            <ul className="glance">
              {glance.map(([icon, label, value, href]) => (
                <li key={href}><Link href={href}><Icon name={icon} /><span>{label}</span><b>{value}</b></Link></li>
              ))}
            </ul>
            {user.role === "admin" && <Link href="/admin/settings" className="more-link">Contact details and texts <Icon name="arrow" size={15} /></Link>}
          </section>

          <section className="panel">
            <div className="section-head">
              <h2>Recent updates</h2>
              <Link href="/admin/updates" className="more-link">All <Icon name="arrow" size={15} /></Link>
            </div>
            {recent.length === 0 ? <p className="muted">Nothing written yet. <Link href="/admin/updates/new">Write the first update</Link></p> : (
              <ul className="recent">
                {recent.map((p) => {
                  const sched = p.status === "published" && p.date > today;
                  return (
                    <li key={p.id}>
                      <Link href={`/admin/updates/${p.id}`}>
                        <strong>{p.title}</strong>
                        <small><span className={`dot dot-${sched ? "scheduled" : p.status}`} />{sched ? "Scheduled" : p.status === "published" ? "Live" : "Draft"} · {formatDate(p.date)}</small>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
