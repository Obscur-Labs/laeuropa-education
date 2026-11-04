import "server-only";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getDoc, putDoc, deleteDoc, listDocs } from "./store";

export type Role = "admin" | "editor";

export type User = {
  id: string;            // login id, lowercase (email or username)
  name: string;
  role: Role;
  hash: string;          // bcrypt
  created_at: string;
  sessionVersion: number; // bumped on password change / removal -> logs out every device
};

type Session = { userId: string; version: number; created: number; lastSeen: number };

const IDLE_MS = 2 * 60 * 60 * 1000;      // auto-logout after 2 hours idle
const ABSOLUTE_MS = 12 * 60 * 60 * 1000; // and always after 12 hours
const TOUCH_MS = 5 * 60 * 1000;          // write "last seen" at most every 5 minutes

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-lee_session" : "lee_session";

// Used so unknown logins take as long as wrong passwords (no account enumeration by timing)
const DUMMY_HASH = "$2b$12$SeTwrD/F.0NhZ.ICkfUtVOIDHGa7m4oti8CE7IcqnMYtplGqzHO2C";

export const LOGIN_ID_RE = /^(?:[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|[a-z0-9._-]{3,60})$/;

export function normaliseLoginId(v: unknown): string {
  return String(v ?? "").trim().toLowerCase().slice(0, 120);
}

export function userDocId(loginId: string): string {
  // document ids are restricted; derive a stable id from the login id
  return "u_" + createHash("sha256").update(loginId).digest("hex").slice(0, 32);
}

export function passwordProblem(pw: string): string | null {
  if (pw.length < 10) return "Password must be at least 10 characters.";
  if (pw.length > 200) return "Password is too long.";
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw)) return "Use upper-case and lower-case letters and at least one number.";
  return null;
}

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);

export async function getUser(loginId: string): Promise<User | null> {
  return getDoc<User>("users", userDocId(loginId));
}

export async function listUsers(): Promise<User[]> {
  return (await listDocs<User>("users")).sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function saveUser(u: User): Promise<void> {
  await putDoc("users", userDocId(u.id), u);
}

export async function removeUser(loginId: string): Promise<void> {
  await deleteDoc("users", userDocId(loginId));
}

export async function verifyLogin(loginId: string, password: string): Promise<User | null> {
  const user = LOGIN_ID_RE.test(loginId) ? await getUser(loginId) : null;
  const ok = await bcrypt.compare(password.slice(0, 200), user?.hash ?? DUMMY_HASH);
  return ok && user ? user : null;
}

const tokenId = (token: string) => "s_" + createHash("sha256").update(token).digest("hex");

/** Creates a session (only the token's hash is stored) and sets the cookie. Call from Server Actions only. */
export async function startSession(user: User): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  await putDoc<Session>("sessions", tokenId(token), { userId: user.id, version: user.sessionVersion, created: now, lastSeen: now });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ABSOLUTE_MS / 1000,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) await deleteDoc("sessions", tokenId(token));
  jar.delete(SESSION_COOKIE);
}

/** The logged-in user, or null. Validates idle/absolute expiry and password-change revocation. */
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const id = tokenId(token);
  const s = await getDoc<Session>("sessions", id);
  if (!s) return null;
  const now = Date.now();
  if (now - s.lastSeen > IDLE_MS || now - s.created > ABSOLUTE_MS) {
    await deleteDoc("sessions", id);
    return null;
  }
  const user = await getUser(s.userId);
  if (!user || user.sessionVersion !== s.version) {
    await deleteDoc("sessions", id);
    return null;
  }
  if (now - s.lastSeen > TOUCH_MS) await putDoc<Session>("sessions", id, { ...s, lastSeen: now });
  return user;
}

/** For admin pages: redirect to login when signed out; editors are sent away from admin-only pages. */
export async function requirePageUser(role?: Role): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if (role === "admin" && user.role !== "admin") redirect("/admin?err=admin-only");
  return user;
}

export class AuthError extends Error {}

/** For Server Actions / Route Handlers: every mutation re-checks the caller. */
export async function requireActionUser(role?: Role): Promise<User> {
  const user = await currentUser();
  if (!user) throw new AuthError("Your session has expired. Please log in again.");
  if (role === "admin" && user.role !== "admin") throw new AuthError("Only admins can do this.");
  return user;
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
