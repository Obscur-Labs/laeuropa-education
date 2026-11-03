import { requirePageUser } from "@/lib/auth";
import { listDocs } from "@/lib/store";
import type { Enquiry } from "@/lib/content";
import AdminNav from "@/components/admin/AdminNav";
import { logout } from "../auth-actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();
  const newEnquiries = (await listDocs<Enquiry>("enquiries")).filter((q) => q.status === "new").length;
  return (
    <div className="admin">
      <aside className="sidebar">
        <a className="side-brand" href="/admin/updates"><img src="/img/logo.png" alt="LA Europa Education" /><span>Team Panel</span></a>
        <AdminNav isAdmin={user.role === "admin"} newEnquiries={newEnquiries} />
        <div className="side-user">
          <span>Signed in as <strong>{user.name}</strong></span>
          <form action={logout}><button type="submit" className="linkish">Log out</button></form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
