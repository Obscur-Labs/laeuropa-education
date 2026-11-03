import { MESSAGES } from "@/lib/admin";

/** Shows a fixed, pre-written message for ?ok=… / ?err=… (never echoes arbitrary text from the URL). */
export default function Flash({ ok, err }: { ok?: string; err?: string }) {
  const okMsg = ok ? MESSAGES[ok] : undefined;
  const errMsg = err ? MESSAGES[err] : undefined;
  return (
    <>
      {okMsg && <div className="alert alert-success">{okMsg}</div>}
      {errMsg && <div className="alert alert-error">{errMsg}</div>}
    </>
  );
}
