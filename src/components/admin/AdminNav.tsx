"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./Icon";

type Item = { href: string; label: string; icon: IconName; exact?: boolean; badge?: number };

export default function AdminNav({ isAdmin, newEnquiries }: { isAdmin: boolean; newEnquiries: number }) {
  const path = usePathname() || "";
  const isOn = (i: Item) => (i.exact ? path === i.href : path === i.href || path.startsWith(i.href + "/"));

  const groups: [string, Item[]][] = [
    ["", [
      { href: "/admin", label: "Dashboard", icon: "home", exact: true },
      { href: "/admin/enquiries", label: "Enquiries", icon: "inbox", badge: newEnquiries },
      { href: "/admin/updates", label: "Updates", icon: "updates" },
    ]],
    ["Website content", [
      { href: "/admin/reviews", label: "Student reviews", icon: "star" },
      { href: "/admin/certificates", label: "Certificates", icon: "award" },
      { href: "/admin/countries", label: "Countries", icon: "globe" },
      { href: "/admin/faqs", label: "FAQs", icon: "help" },
      ...(isAdmin ? [{ href: "/admin/settings", label: "Site settings", icon: "sliders" as const }] : []),
    ]],
    ["Account", [{ href: "/admin/team", label: isAdmin ? "Team logins" : "My password", icon: "users" }]],
  ];

  return (
    <nav aria-label="Team panel">
      <Link href="/admin/updates/new" className="nav-cta"><Icon name="plus" /> New update</Link>
      {groups.map(([title, items]) => (
        <div className="nav-group" key={title || "main"}>
          {title && <span className="nav-label">{title}</span>}
          {items.map((i) => {
            const on = isOn(i) && !(i.href === "/admin/updates" && path === "/admin/updates/new");
            return (
              <Link key={i.href} href={i.href} className={on ? "on" : undefined} aria-current={on ? "page" : undefined}>
                <Icon name={i.icon} />
                <span>{i.label}</span>
                {!!i.badge && <b className="pill" aria-label={`${i.badge} new`}>{i.badge}</b>}
              </Link>
            );
          })}
        </div>
      ))}
      <a href="/" target="_blank" rel="noopener noreferrer" className="nav-out"><Icon name="external" /> <span>View website</span></a>
    </nav>
  );
}
