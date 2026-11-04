"use client";

import Link from "next/link";
import { Fragment, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import type { Country } from "@/lib/content";
import { Flag } from "@/components/ui";
import { countryOp, reorderCountries } from "@/app/admin/(panel)/countries/actions";
import ActionForm from "./ActionForm";
import Icon from "./Icon";

/** Where the order matters on the website: a labelled line is drawn under these positions. */
const MARKS: Record<number, string> = {
  6: "The first 6 countries appear in the website footer",
  16: "The first 16 countries appear in the home page flag circle",
};

const EASE = "transform .22s cubic-bezier(.2, .7, .2, 1)";

type Status = { kind: "idle" | "saving" | "saved" | "error"; text: string };

type Drag = {
  code: string;
  from: number;
  to: number;
  list: Country[];
  rows: HTMLElement[];
  tops: number[];      // each row's top in page coordinates when the drag started
  heights: number[];
  startY: number;      // pointer position in page coordinates when the drag started
  clientY: number;     // latest pointer position in the window
  raf: number;
};

function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Countries table with drag-and-drop ordering.
 * While dragging nothing in the DOM is reordered: the picked-up row follows the pointer and the
 * others slide into their new slots with CSS transforms, so the drag never loses the pointer.
 * The new order is committed (and saved) on drop. Esc cancels. Arrow keys on a handle also move rows.
 */
export default function CountryOrder({ initial }: { initial: Country[] }) {
  const [list, setList] = useState(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle", text: "" });
  const body = useRef<HTMLTableSectionElement>(null);
  const saved = useRef(initial);                       // last order the server confirmed
  const flip = useRef<Map<string, number> | null>(null); // where rows were on screen just before a reorder

  const rowEls = () => Array.from(body.current?.querySelectorAll<HTMLElement>("tr[data-code]") ?? []);

  // After a reorder, slide every row from where it was on screen to its new place (FLIP)
  useLayoutEffect(() => {
    const before = flip.current;
    if (!before) return;
    flip.current = null;
    const rows = rowEls();
    for (const row of rows) {
      row.style.transition = "none";
      row.style.transform = "";
      const was = before.get(row.dataset.code!);
      if (was === undefined) continue;
      const delta = was - row.getBoundingClientRect().top;
      if (Math.abs(delta) > 0.5) row.style.transform = `translateY(${delta}px)`;
    }
    void body.current?.offsetHeight; // apply the starting positions before animating
    for (const row of rows) {
      row.style.transition = row.style.transform ? EASE : "";
      row.style.transform = "";
    }
  }, [list]);

  function remember(rows = rowEls()) {
    flip.current = new Map(rows.map((r) => [r.dataset.code!, r.getBoundingClientRect().top]));
  }

  async function save(next: Country[], movedName: string) {
    setStatus({ kind: "saving", text: "Saving the new order…" });
    const res = await reorderCountries(next.map((c) => c.code));
    if (res?.error) {
      remember();
      setList(saved.current);
      setStatus({ kind: "error", text: res.error });
      return;
    }
    saved.current = next;
    setStatus({ kind: "saved", text: `Saved. ${movedName} is now number ${next.findIndex((c) => c.name === movedName) + 1}.` });
  }

  /** Positions the rows for the current pointer position during a drag. */
  function layout(d: Drag) {
    const dy = d.clientY + window.scrollY - d.startY;
    const centre = d.tops[d.from] + d.heights[d.from] / 2 + dy;
    let to = 0;
    d.tops.forEach((top, k) => { if (k !== d.from && top + d.heights[k] / 2 < centre) to++; });
    d.to = to;
    d.rows.forEach((row, k) => {
      const pos = row.querySelector<HTMLElement>(".order-pos");
      if (k === d.from) {
        row.style.transform = `translateY(${dy}px)`;
        if (pos) pos.dataset.live = String(to + 1);
        return;
      }
      let n = k; // this row's slot once the dragged row lands at `to`
      if (d.from < to && k > d.from && k <= to) n = k - 1;
      else if (to < d.from && k >= to && k < d.from) n = k + 1;
      row.style.transform = n === k ? "" : `translateY(${d.tops[n] - d.tops[k]}px)`;
      if (pos) pos.dataset.live = String(n + 1);
    });
  }

  function onPointerDown(e: ReactPointerEvent<HTMLButtonElement>, code: string) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    const rows = rowEls();
    const from = rows.findIndex((r) => r.dataset.code === code);
    if (from < 0) return;
    const rects = rows.map((r) => r.getBoundingClientRect());
    const d: Drag = {
      code, from, to: from, list, rows,
      tops: rects.map((r) => r.top + window.scrollY),
      heights: rects.map((r) => r.height),
      startY: e.clientY + window.scrollY,
      clientY: e.clientY,
      raf: 0,
    };
    rows.forEach((r, k) => { r.style.transition = k === from ? "none" : EASE; });
    setDragging(code);

    // scroll the page while the pointer is held near the top or bottom of the window
    const tick = () => {
      const edge = 80;
      const y = d.clientY;
      const speed = y < edge ? -Math.ceil((edge - y) / 5) : y > window.innerHeight - edge ? Math.ceil((y - (window.innerHeight - edge)) / 5) : 0;
      if (speed) { window.scrollBy(0, speed); layout(d); }
      d.raf = requestAnimationFrame(tick);
    };
    d.raf = requestAnimationFrame(tick);

    const onMove = (ev: PointerEvent) => { d.clientY = ev.clientY; layout(d); };
    const onKey = (ev: globalThis.KeyboardEvent) => { if (ev.key === "Escape") { ev.preventDefault(); end(true); } };
    const onUp = () => end(false);
    const onCancel = () => end(true);

    function end(cancel: boolean) {
      cancelAnimationFrame(d.raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
      for (const row of d.rows) delete row.querySelector<HTMLElement>(".order-pos")?.dataset.live;
      setDragging(null);
      if (cancel || d.to === d.from) {
        for (const row of d.rows) { row.style.transition = EASE; row.style.transform = ""; }
        if (cancel) setStatus({ kind: "idle", text: "" });
        return;
      }
      remember(d.rows); // where everything is on screen right now, so the drop settles smoothly
      const next = move(d.list, d.from, d.to);
      setList(next);
      save(next, d.list[d.from].name);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const to = e.key === "ArrowUp" ? i - 1 : e.key === "ArrowDown" ? i + 1 : e.key === "Home" ? 0 : e.key === "End" ? list.length - 1 : -1;
    if (to < 0 || to >= list.length || to === i) return;
    e.preventDefault();
    remember();
    const next = move(list, i, to);
    setList(next);
    save(next, list[i].name);
  }

  return (
    <>
      <p className={`order-status order-${status.kind}`} role="status" aria-live="polite">
        {status.kind === "idle"
          ? <><Icon name="grip" size={16} weight={3} /> Drag a country by its handle to any position. It saves when you let go. Press Esc to cancel.</>
          : status.text}
      </p>
      <div className="table-wrap">
        <table className={`table order-table${dragging ? " is-dragging" : ""}`}>
          <thead><tr><th aria-label="Move"></th><th>#</th><th>Country</th><th>Region</th><th>Intakes</th><th>Popular</th><th className="th-actions">Actions</th></tr></thead>
          <tbody ref={body}>
            {list.map((c, i) => (
              <Fragment key={c.code}>
                <Row c={c} i={i} total={list.length} dragging={dragging === c.code} onPointerDown={onPointerDown} onKeyDown={onKeyDown} />
                {MARKS[i + 1] && list.length > i + 1 && (
                  <tr className="order-mark" aria-hidden="true"><td colSpan={7}><span>{MARKS[i + 1]}</span></td></tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Row({ c, i, total, dragging, onPointerDown, onKeyDown }: {
  c: Country; i: number; total: number; dragging: boolean;
  onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>, code: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>, i: number) => void;
}) {
  return (
    <tr data-code={c.code} className={dragging ? "dragging" : undefined}>
      <td className="order-handle-cell">
        <button type="button" className="order-handle" aria-label={`Move ${c.name}, number ${i + 1} of ${total}. Use the arrow keys.`}
          title="Drag to reorder" onPointerDown={(e) => onPointerDown(e, c.code)} onKeyDown={(e) => onKeyDown(e, i)}>
          <Icon name="grip" size={18} weight={3} />
        </button>
      </td>
      <td className="muted order-pos"><span>{i + 1}</span></td>
      <td><div className="t-title"><Flag code={c.code} name={c.name} className="admin-flag" /><Link href={`/admin/countries/${i}`}><strong>{c.name}</strong></Link></div></td>
      <td>{c.region}</td>
      <td>{c.intake}</td>
      <td>{c.popular && <span className="status status-published">Popular</span>}</td>
      <td className="t-actions">
        <Link href={`/admin/countries/${i}`}>Edit</Link>
        <ActionForm action={countryOp} className="inline" confirm={`Remove ${c.name} from the website?`}>
          <input type="hidden" name="index" value={i} /><input type="hidden" name="code" value={c.code} /><input type="hidden" name="op" value="delete" />
          <button type="submit" className="linkish danger">Remove</button>
        </ActionForm>
      </td>
    </tr>
  );
}
