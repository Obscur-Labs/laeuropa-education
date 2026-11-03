"use client";

import { useEffect } from "react";

/** Header shadow, mobile menu, scroll reveal, count-up, country filter, copy-link and certificate lightbox. */
export default function SiteEffects() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const on = <K extends keyof DocumentEventMap>(t: Document | Window | Element, ev: K | string, fn: EventListener, opts?: AddEventListenerOptions) => {
      t.addEventListener(ev, fn, opts);
      cleanups.push(() => t.removeEventListener(ev, fn, opts));
    };

    // Header shadow
    const header = document.querySelector(".site-header");
    const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 40);
    onScroll();
    on(window, "scroll", onScroll, { passive: true });

    // Mobile menu
    const toggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
    if (toggle) {
      on(toggle, "click", () => {
        const open = document.body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
      on(document, "keydown", ((e: KeyboardEvent) => {
        if (e.key === "Escape" && document.body.classList.contains("nav-open")) toggle.click();
      }) as EventListener);
    }

    // Reveal on scroll
    const items = document.querySelectorAll<HTMLElement>(".reveal");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      items.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + "ms"; io.observe(el); });
      cleanups.push(() => io.disconnect());
    } else {
      items.forEach((el) => el.classList.add("is-visible"));
    }

    // Count-up numbers
    const counters = document.querySelectorAll<HTMLElement>("[data-count]");
    if (counters.length && "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const co = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target as HTMLElement;
          const end = parseInt(el.dataset.count || "0", 10), suffix = el.dataset.suffix || "";
          let start = 0;
          co.unobserve(el);
          const step = (t: number) => {
            if (!start) start = t;
            const p = Math.min(1, (t - start) / 1400);
            el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      }, { threshold: 0.5 });
      counters.forEach((el) => co.observe(el));
      cleanups.push(() => co.disconnect());
    }

    // Country search + region filter
    const grid = document.getElementById("country-grid");
    const search = document.getElementById("country-search") as HTMLInputElement | null;
    if (grid && search) {
      const empty = document.getElementById("country-empty");
      const chips = document.querySelectorAll<HTMLButtonElement>(".chip-btn[data-region]");
      let region = "all";
      const apply = () => {
        const q = search.value.trim().toLowerCase();
        let shown = 0;
        grid.querySelectorAll<HTMLElement>(".country-card").forEach((card) => {
          const ok = (region === "all" || card.dataset.region === region) && (!q || (card.dataset.search || "").includes(q));
          card.classList.toggle("is-hidden", !ok);
          if (ok) { shown++; card.classList.add("is-visible"); }
        });
        if (empty) empty.hidden = shown !== 0;
      };
      on(search, "input", apply);
      chips.forEach((chip) => on(chip, "click", () => {
        chips.forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        region = chip.dataset.region || "all";
        apply();
      }));
    }

    // Certificate lightbox (only opens the site's own files)
    const lb = document.getElementById("lightbox");
    if (lb) {
      const img = lb.querySelector("img")!, cap = lb.querySelector("figcaption span")!, pdf = lb.querySelector<HTMLAnchorElement>(".lightbox-pdf")!;
      const allowed = (u?: string) => {
        if (!u) return false;
        if (/^\/(certificates|media)\/[\w/.-]+$/.test(u) && !u.includes("..")) return true;
        try { const x = new URL(u); return x.protocol === "https:" && x.hostname === "res.cloudinary.com" && /^\/[\w-]+\/(image|raw)\/upload\/media\/\d{4}\/\d{2}\/[a-f0-9]{24}\.(webp|pdf)$/.test(x.pathname); } catch { return false; }
      };
      let last: HTMLElement | null = null;
      const close = () => { lb.hidden = true; document.body.style.overflow = ""; last?.focus(); };
      document.querySelectorAll<HTMLButtonElement>("[data-lightbox]").forEach((btn) => on(btn, "click", () => {
        if (!allowed(btn.dataset.lightbox)) return;
        last = btn;
        img.src = btn.dataset.lightbox!;
        img.alt = btn.dataset.caption || "";
        cap.textContent = btn.dataset.caption || "";
        if (allowed(btn.dataset.pdf)) { pdf.href = btn.dataset.pdf!; pdf.hidden = false; } else { pdf.hidden = true; }
        lb.hidden = false;
        document.body.style.overflow = "hidden";
        lb.querySelector<HTMLButtonElement>(".lightbox-close")?.focus();
      }));
      on(lb, "click", (e) => { const t = e.target as HTMLElement; if (t === lb || t.closest(".lightbox-close")) close(); });
      on(document, "keydown", ((e: KeyboardEvent) => { if (e.key === "Escape" && !lb.hidden) close(); }) as EventListener);
    }

    // Copy link buttons
    document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((btn) => on(btn, "click", () => {
      const done = () => { const t = btn.textContent; btn.textContent = "Copied!"; setTimeout(() => { btn.textContent = t; }, 1600); };
      navigator.clipboard?.writeText(btn.dataset.copy || "").then(done).catch(() => {});
    }));

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
