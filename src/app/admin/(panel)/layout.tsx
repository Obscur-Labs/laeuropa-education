import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { listDocs } from "@/lib/store";
import type { Enquiry } from "@/lib/content";
import AdminNav from "@/components/admin/AdminNav";
import Icon from "@/components/admin/Icon";
import { logout } from "../auth-actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();
  const newEnquiries = (await listDocs<Enquiry>("enquiries")).filter((q) => q.status === "new").length;
  return (
    <div className="admin">
      <aside className="sidebar">
        <Link className="side-brand" href="/admin"><img src="/img/logo.png" alt="LA Europa Education" /><span>Team panel</span></Link>
        <AdminNav isAdmin={user.role === "admin"} newEnquiries={newEnquiries} />
        <div className="side-user">
          <span className="side-avatar" aria-hidden="true">{user.name.trim().slice(0, 1).toUpperCase()}</span>
          <span className="side-who"><strong>{user.name}</strong><small>{user.role === "admin" ? "Admin" : "Editor"}</small></span>
          <form action={logout}><button type="submit" className="side-logout" title="Log out"><Icon name="logout" /><span className="sr-only">Log out</span></button></form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
