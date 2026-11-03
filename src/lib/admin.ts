import "server-only";
import { redirect, unstable_rethrow } from "next/navigation";
import { AuthError, requireActionUser, type Role, type User } from "./auth";
import { UploadError } from "./uploads";

export type ActionResult = { error: string } | null;

export class FormError extends Error {}

/**
 * Wraps every admin Server Action:
 *  1. re-checks the logged-in user (and role) — actions are public POST endpoints
 *  2. turns expected problems into a message shown on the form
 *  3. redirects to the returned URL on success
 */
export async function adminAction(role: Role | undefined, fn: (user: User) => Promise<string>): Promise<ActionResult> {
  let next: string;
  try {
    const user = await requireActionUser(role);
    next = await fn(user);
  } catch (e) {
    unstable_rethrow(e);
    if (e instanceof AuthError || e instanceof FormError || e instanceof UploadError) return { error: e.message };
    console.error("Admin action failed", e);
    return { error: "Something went wrong while saving. Please try again." };
  }
  redirect(next);
}

/** Only allow redirects back into the admin panel. */
export function adminPath(p: string): string {
  return /^\/admin(\/[A-Za-z0-9/_?=&.-]*)?$/.test(p) ? p : "/admin/updates";
}

export const MESSAGES: Record<string, string> = {
  saved: "Saved. The website is updated.",
  deleted: "Deleted.",
  published: "Update published.",
  draft: "Draft saved.",
  live: "Review is live on the website.",
  hidden: "Review saved (hidden).",
  "pw-changed": "Password changed. Other devices have been logged out.",
  "member-added": "Team member added.",
  "member-removed": "Team member removed. They can no longer log in.",
  "pw-reset": "Password reset. Share the new password with them privately.",
  "role-updated": "Role updated.",
  "admin-only": "Only admins can open that section.",
};
