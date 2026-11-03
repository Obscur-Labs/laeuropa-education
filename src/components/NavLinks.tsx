"use client";

import { usePathname } from "next/navigation";

const NAV: Array<[string, string]> = [
  ["/", "Home"], ["/about", "About"], ["/countries", "Countries"], ["/services", "Services"],
  ["/reviews", "Reviews"], ["/updates", "Updates"], ["/contact", "Contact"],
];

export default function NavLinks() {
  const path = usePathname() || "/";
  return (
    <>
      {NAV.map(([href, label]) => {
        const active = href === "/" ? path === "/" : path === href || path.startsWith(href + "/");
        return (
          <a key={href} href={href} className={active ? "is-active" : ""} aria-current={active ? "page" : undefined}>{label}</a>
        );
      })}
      <a href="/contact" className="btn btn-red nav-cta">Free Counselling</a>
    </>
  );
}
