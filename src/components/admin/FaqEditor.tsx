"use client";

import { useState } from "react";

type Item = { key: number; q: string; a: string };

export default function FaqEditor({ initial }: { initial: Array<{ q: string; a: string }> }) {
  const [items, setItems] = useState<Item[]>(initial.map((f, i) => ({ key: i, ...f })));
  const [next, setNext] = useState(initial.length);
  const move = (i: number, d: number) => setItems((l) => {
    const j = i + d;
    if (j < 0 || j >= l.length) return l;
    const c = [...l]; [c[i], c[j]] = [c[j], c[i]]; return c;
  });
  return (
    <>
      <div className="faq-admin">
        {items.map((f, i) => (
          <div key={f.key} className="panel faq-item">
            <div className="faq-tools">
              <button type="button" className="linkish" title="Move up" onClick={() => move(i, -1)}>↑</button>
              <button type="button" className="linkish" title="Move down" onClick={() => move(i, 1)}>↓</button>
              <button type="button" className="linkish danger" onClick={() => { if (confirm("Remove this question?")) setItems((l) => l.filter((x) => x.key !== f.key)); }}>Remove</button>
            </div>
            <label className="field-label">Question<input type="text" name="q" defaultValue={f.q} maxLength={300} /></label>
            <label className="field-label">Answer<textarea name="a" rows={3} defaultValue={f.a} maxLength={3000} /></label>
          </div>
        ))}
      </div>
      <div className="save-bar">
        <button type="button" className="btn btn-ghost" onClick={() => { setItems((l) => [...l, { key: next, q: "", a: "" }]); setNext((n) => n + 1); }}>+ Add question</button>
        <button type="submit" className="btn btn-primary">Save FAQs</button>
      </div>
    </>
  );
}
