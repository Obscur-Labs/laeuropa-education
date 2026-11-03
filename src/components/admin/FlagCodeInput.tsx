"use client";

import { useState } from "react";

export default function FlagCodeInput({ initial }: { initial: string }) {
  const [code, setCode] = useState(initial);
  const safe = /^[a-z]{2}$/.test(code) ? code : "xx";
  return (
    <span className="flag-input">
      <span className={`fi fi-${safe} fis admin-flag`} />
      <input type="text" name="code" value={code} maxLength={2} required
        onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))} />
    </span>
  );
}
