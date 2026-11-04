"use client";

import Link from "next/link";
import { Fragment, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import type { Country } from "@/lib/content";
import { Flag } from "@/components/ui";
import { countryOp, reorderCountries } from "@/app/admin/(panel)/countries/actions";
import ActionForm from "./ActionForm";
import Icon from "./Icon";

/** Where the order matters on the website: a line is drawn under these positions. */
const MARKS: Record<number, string> = {
  6: "The first 6 countries appear in the website footer",
  16: "The first 16 countries appear in the home page flag circle",
};

type Status = { kind: "idle" | "saving" | "saved" | "error"; text: string };

function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Countries table with drag-and-drop ordering. Drag a row by its handle (mouse or touch), or focus the
 * handle and use the arrow keys. Every change is saved straight away.
 */
export default function CountryOrder({ initial }: { initial: Country[] }) {
  const [list, setList] = useState(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle", text: "" });
  const body = useRef<HTMLTableSectionElement>(null);
  const saved = useRef(initial); // last order the server confirmed

  async function save(next: Country[], movedName: string) {
    setStatus({ kind: "saving", text: "Saving the new order…" });
    const res = await reorderCountries(next.map((c) => c.code));
    if (res?.error) {
      setList(saved.current);
      setStatus({ kind: "error", text: res.error });
      return;
    }
    saved.current = next;
    setStatus({ kind: "saved", text: `Saved. ${movedName} is now number ${next.findIndex((c) => c.name === movedName) + 1}.` });
  }

  function onPointerDown(e: ReactPointerEvent<HTMLButtonElement>, code: string) {
    if ((e.pointerType === "mouse" && e.button !== 0) || status.kind === "saving") return;
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const before = list;
    let current = list;
    setDragging(code);

    const onMove = (ev: PointerEvent) => {
      const rows = Array.from(body.current?.querySelectorAll<HTMLElement>("tr[data-code]") ?? []);
      const from = current.findIndex((c) => c.code === code);
      let to = 0;
      for (const row of rows) {
        if (row.dataset.code === code) continue;
        const box = row.getBoundingClientRect();
        if (ev.clientY > box.top + box.height / 2) to++;
      }
      if (to !== from) {
        current = move(current, from, to);
        setList(current);
      }
      // keep scrolling when dragging near the top or bottom of the window
      if (ev.clientY < 70) window.scrollBy(0, -14);
      else if (ev.clientY > window.innerHeight - 70) window.scrollBy(0, 14);
    };
    const onUp = () => {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      setDragging(null);
      if (current !== before) save(current, current.find((c) => c.code === code)!.name);
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const to = e.key === "ArrowUp" ? i - 1 : e.key === "ArrowDown" ? i + 1 : e.key === "Home" ? 0 : e.key === "End" ? list.length - 1 : -1;
    if (to < 0 || to >= list.length || to === i || status.kind === "saving") return;
    e.preventDefault();
    const next = move(list, i, to);
    setList(next);
    save(next, list[i].name);
  }

  return (
    <>
      <p className={`order-status order-${status.kind}`} role="status" aria-live="polite">
        {status.kind === "idle" ? <><Icon name="grip" size={16} weight={3} /> Drag a country by its handle to change the order. It saves automatically.</> : status.text}
      </p>
      <div className="table-wrap">
        <table className={`table order-table${dragging ? " is-dragging" : ""}`}>
          <thead><tr><th aria-label="Move"></th><th>#</th><th>Country</th><th>Region</th><th>Intakes</th><th>Popular</th><th></th></tr></thead>
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
      <td className="muted order-pos">{i + 1}</td>
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
