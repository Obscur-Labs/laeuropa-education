"use server";

import { redirect } from "next/navigation";
import { endSession, normaliseLoginId, startSession, verifyLogin } from "@/lib/auth";
import { clearHits, clientIpHash, hit, isLimited } from "@/lib/ratelimit";

export async function login(_prev: { error: string } | null, form: FormData): Promise<{ error: string } | null> {
  const loginId = normaliseLoginId(form.get("username"));
  const password = String(form.get("password") ?? "");
  const ip = await clientIpHash();

  // 5 failures per connection per 15 min, and 10 per account per hour (stops slow, distributed guessing)
  if (await isLimited("login-ip", ip, 5, 900) || await isLimited("login-acct", loginId, 10, 3600)) {
    return { error: "Too many failed attempts. Please wait 15 minutes and try again." };
  }
  const user = await verifyLogin(loginId, password);
  if (!user) {
    await hit("login-ip", ip, 900);
    await hit("login-acct", loginId, 3600);
    return { error: "Incorrect email / login ID or password." };
  }
  await clearHits("login-acct", loginId);
  await startSession(user);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
