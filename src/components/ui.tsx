import type { CSSProperties, ReactNode } from "react";

const ICONS: Record<string, ReactNode> = {
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  doc: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>,
  passport: <><rect x="5" y="3" width="14" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M9 17h6" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  pin: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="m5 12 4.5 4.5L19 7" />,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  plane: <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />,
  shield: <><path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  chat: <path d="M4 5h16v11H8l-4 4z" />,
};

export function Icon({ name }: { name: keyof typeof ICONS | string }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
  );
}

export function WhatsappIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.6 11.6 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
    </svg>
  );
}

/** Ring of 12 five-pointed stars, as in the European flag. */
export function EuStars({ size = 200, className = "eu-stars", color = "#FFCC00" }: { size?: number; className?: string; color?: string }) {
  const c = size / 2, r = size * 0.38, s = size * 0.055;
  const stars = [];
  for (let i = 0; i < 12; i++) {
    const a = ((i * 30 - 90) * Math.PI) / 180;
    const cx = c + r * Math.cos(a), cy = c + r * Math.sin(a);
    const pts = [];
    for (let k = 0; k < 10; k++) {
      const rad = k % 2 ? s * 0.42 : s;
      const b = ((k * 36 - 90) * Math.PI) / 180;
      pts.push(`${(cx + rad * Math.cos(b)).toFixed(2)},${(cy + rad * Math.sin(b)).toFixed(2)}`);
    }
    stars.push(<polygon key={i} fill={color} points={pts.join(" ")} />);
  }
  return <svg className={className} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">{stars}</svg>;
}

export function Flag({ code, name, className = "", style }: { code: string; name?: string; className?: string; style?: CSSProperties }) {
  const safe = /^[a-z]{2}$/.test(code) ? code : "xx";
  return <span className={`flag fi fi-${safe} fis ${className}`.trim()} role="img" aria-label={`${name || safe.toUpperCase()} flag`} style={style} />;
}

export function RatingStars({ n }: { n: number }) {
  const v = Math.max(1, Math.min(5, Math.round(n)));
  return (
    <span className="rating" role="img" aria-label={`${v} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= v ? "on" : "off"}>★</span>)}
    </span>
  );
}

export function PageHero({ eyebrow, title, lead, crumb }: { eyebrow: string; title: ReactNode; lead: string; crumb: string }) {
  return (
    <section className="page-hero">
      <div className="page-hero-stars"><EuStars size={520} className="eu-stars spin-slow" /></div>
      <div className="container page-hero-inner">
        <nav className="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>{crumb}</span></nav>
        <p className="eyebrow eyebrow-light">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
      </div>
    </section>
  );
}
