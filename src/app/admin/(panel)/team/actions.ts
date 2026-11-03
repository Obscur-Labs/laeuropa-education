"use server";

import { adminAction, FormError, type ActionResult } from "@/lib/admin";
import {
  getUser, hashPassword, listUsers, LOGIN_ID_RE, normaliseLoginId, passwordProblem, removeUser, saveUser, startSession,
} from "@/lib/auth";
import bcrypt from "bcryptjs";
import { text } from "@/lib/sanitize";

export async function changeOwnPassword(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return adminAction(undefined, async (me) => {
    const current = String(form.get("current") ?? "");
    const next = String(form.get("new") ?? "");
    if (!(await bcrypt.compare(current.slice(0, 200), me.hash))) throw new FormError("Your current password is incorrect.");
    const problem = passwordProblem(next);
    if (problem) throw new FormError(problem);
    if (next !== String(form.get("new2") ?? "")) throw new FormError("New passwords do not match.");
    const updated = { ...me, hash: await hashPassword(next), sessionVersion: me.sessionVersion + 1 };
    await saveUser(updated);
    await startSession(updated); // keep this device signed in; every other device is logged out
    return "/admin/team?ok=pw-changed";
  });
}

export async function teamOp(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return adminAction("admin", async (me) => {
    const op = text(form.get("op"), 10);
    const target = normaliseLoginId(form.get("username"));

    if (op === "add") {
      const name = text(form.get("name"), 80);
      const password = String(form.get("password") ?? "");
      if (!name || !LOGIN_ID_RE.test(target)) throw new FormError("Enter a name, and an email address or a login ID of 3–60 letters/numbers.");
      if (await getUser(target)) throw new FormError("That login ID is already in use.");
      const problem = passwordProblem(password);
      if (problem) throw new FormError(problem);
      await saveUser({
        id: target, name, role: text(form.get("role"), 10) === "admin" ? "admin" : "editor",
        hash: await hashPassword(password), created_at: new Date().toISOString(), sessionVersion: 1,
      });
      return "/admin/team?ok=member-added";
    }

    if (target === me.id) throw new FormError("Use \"Change my password\" for your own account. You cannot remove or demote yourself.");
    const user = await getUser(target);
    if (!user) throw new FormError("That team member no longer exists.");

    if (op === "delete") {
      await removeUser(target); // their sessions stop working immediately (user lookup fails)
      return "/admin/team?ok=member-removed";
    }
    if (op === "reset") {
      const password = String(form.get("password") ?? "");
      const problem = passwordProblem(password);
      if (problem) throw new FormError(problem);
      await saveUser({ ...user, hash: await hashPassword(password), sessionVersion: user.sessionVersion + 1 });
      return "/admin/team?ok=pw-reset";
    }
    if (op === "role") {
      const role = text(form.get("role"), 10) === "admin" ? "admin" : "editor";
      if (role === "editor" && user.role === "admin" && (await listUsers()).filter((u) => u.role === "admin").length <= 1) {
        throw new FormError("There must always be at least one admin.");
      }
      await saveUser({ ...user, role, sessionVersion: user.sessionVersion + 1 });
      return "/admin/team?ok=role-updated";
    }
    throw new FormError("Unknown action.");
  });
}
