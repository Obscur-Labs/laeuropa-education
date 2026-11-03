"use client";

import { usePathname } from "next/navigation";

export default function AdminNav({ isAdmin, newEnquiries }: { isAdmin: boolean; newEnquiries: number }) {
  const path = usePathname() || "";
  const link = (href: string, label: React.ReactNode, exact = false) => {
    const on = exact ? path === href : path === href || path.startsWith(href + "/");
    return <a href={href} className={on ? "on" : ""}>{label}</a>;
  };
  return (
    <nav>
      {link("/admin/updates", "Updates", true)}
      {link("/admin/updates/new", "+ New update")}
      {link("/admin/enquiries", <>Enquiries{newEnquiries > 0 && <b className="pill">{newEnquiries}</b>}</>)}
      <span className="nav-label">Website content</span>
      {link("/admin/reviews", "Student reviews")}
      {link("/admin/certificates", "Certificates")}
      {link("/admin/countries", "Countries")}
      {link("/admin/faqs", "FAQs")}
      {isAdmin && link("/admin/settings", "Site settings")}
      <span className="nav-label">Account</span>
      {link("/admin/team", isAdmin ? "Team logins" : "My password")}
      <a href="/" target="_blank" rel="noopener noreferrer">View website ↗</a>
    </nav>
  );
}
