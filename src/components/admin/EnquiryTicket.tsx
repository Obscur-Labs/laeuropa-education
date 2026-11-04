import { phoneDigits, type Enquiry } from "@/lib/content";
import { enquiryTime, istDateTime, isOverdue, timeAgo } from "@/lib/admin-format";
import { updateEnquiry } from "@/app/admin/(panel)/enquiries/actions";
import ActionForm from "./ActionForm";
import Icon from "./Icon";

const NEXT_STEPS: Record<Enquiry["status"], [Enquiry["status"], string][]> = {
  new: [["contacted", "Mark contacted"], ["closed", "Close"]],
  contacted: [["closed", "Close"], ["new", "Back to new"]],
  closed: [["new", "Reopen"]],
};

/**
 * One enquiry, laid out like a boarding pass: the stub shows where the student wants to study,
 * the body shows who they are and the quickest ways to reach them.
 */
export default function EnquiryTicket({ q, flag, filter = "all", from, compact = false }: {
  q: Enquiry;
  flag: string;            // flag-icons code for the chosen country, "" when not decided
  filter?: string;         // keeps the Enquiries tab after an action
  from?: "dashboard";      // return to the dashboard after an action
  compact?: boolean;       // dashboard: shorter message, no delete
}) {
  const at = enquiryTime(q);
  const overdue = isOverdue(q);
  const digits = phoneDigits(q.phone);
  const hidden = (op: string) => (
    <>
      <input type="hidden" name="id" value={q.id} />
      <input type="hidden" name="op" value={op} />
      <input type="hidden" name="filter" value={filter} />
      {from && <input type="hidden" name="from" value={from} />}
    </>
  );

  return (
    <article className={`ticket ticket-${q.status}${compact ? " ticket-compact" : ""}`}>
      <div className="ticket-stub">
        <span className="ticket-label">Destination</span>
        {flag ? <span className={`fi fi-${flag} ticket-flag`} aria-hidden="true" /> : <span className="ticket-flag ticket-flag-none" aria-hidden="true"><Icon name="globe" size={20} /></span>}
        <strong className="ticket-country">{q.country || "Not decided"}</strong>
        {q.level && <span className="ticket-level">{q.level}</span>}
      </div>

      <div className="ticket-body">
        <header className="ticket-head">
          <h3>{q.name}</h3>
          <span className={`status status-${q.status}`}>{q.status === "new" ? "New" : q.status === "contacted" ? "Contacted" : "Closed"}</span>
          <time dateTime={at.toISOString()} title={istDateTime(at) + " IST"} className={overdue ? "ticket-age overdue" : "ticket-age"}>
            <Icon name="clock" size={14} />
            {q.status === "new" ? (overdue ? `Waiting ${timeAgo(at)}` : `${timeAgo(at)} ago`) : istDateTime(at)}
          </time>
        </header>

        <p className="ticket-meta">
          {[q.service, q.city].filter(Boolean).join(" · ")}
          {!compact && <span className="ticket-when"> · Sent {istDateTime(at)} IST</span>}
        </p>
        {q.message && <p className={compact ? "ticket-msg clamp" : "ticket-msg"}>{q.message}</p>}

        <div className="ticket-actions">
          <div className="ticket-contact">
            <a className="btn btn-small btn-call" href={`tel:+${digits}`}><Icon name="phone" size={15} />{q.phone}</a>
            <a className="btn btn-small" href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer"><Icon name="chat" size={15} />WhatsApp</a>
            {q.email && <a className="btn btn-small" href={`mailto:${q.email}`} title={q.email}><Icon name="mail" size={15} /><span className="btn-label">Email</span></a>}
          </div>
          <div className="ticket-status">
            {NEXT_STEPS[q.status].slice(0, compact ? 1 : undefined).map(([op, label], i) => (
              <ActionForm key={op} action={updateEnquiry} className="inline">
                {hidden(op)}
                <button type="submit" className={i === 0 ? "btn btn-small btn-dark" : "btn btn-small"}>{i === 0 && op === "contacted" && <Icon name="check" size={15} />}{label}</button>
              </ActionForm>
            ))}
            {!compact && (
              <ActionForm action={updateEnquiry} className="inline" confirm={`Delete the enquiry from ${q.name} permanently?`}>
                {hidden("delete")}
                <button type="submit" className="btn btn-small btn-danger">Delete</button>
              </ActionForm>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
