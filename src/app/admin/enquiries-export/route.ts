import { currentUser } from "@/lib/auth";
import type { Enquiry } from "@/lib/content";
import { listDocs } from "@/lib/store";

/** CSV download of all enquiries — logged-in team members only. */
export async function GET() {
  if (!(await currentUser())) return new Response(null, { status: 302, headers: { Location: "/admin/login" } });

  const rows = (await listDocs<Enquiry>("enquiries")).sort((a, b) => b.id.localeCompare(a.id));
  const cell = (v: string) => {
    let s = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
    return '"' + s.replace(/"/g, '""') + '"';
  };
  const header = ["Date", "Status", "Name", "Phone", "Email", "City", "Country", "Level", "Service", "Message", "Consent"];
  const lines = [header.map(cell).join(",")].concat(rows.map((q) =>
    [q.created_at, q.status, q.name, q.phone, q.email, q.city, q.country, q.level, q.service, q.message, q.consent].map(cell).join(",")));
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
