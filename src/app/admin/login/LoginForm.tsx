"use client";

import { useActionState, useTransition } from "react";
import { login } from "../auth-actions";

export default function LoginForm() {
  const [state, run] = useActionState(login, null);
  const [pending, start] = useTransition();
  return (
    <form className="stack" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); start(() => run(fd)); }}>
      {state?.error && <div className="alert alert-error" role="alert">{state.error}</div>}
      <label>Email or login ID<input type="text" name="username" required autoFocus autoComplete="username" maxLength={120} /></label>
      <label>Password<input type="password" name="password" required autoComplete="current-password" maxLength={200} /></label>
      <button className="btn btn-primary" type="submit" disabled={pending}>{pending ? "Signing in…" : "Log in"}</button>
    </form>
  );
}
