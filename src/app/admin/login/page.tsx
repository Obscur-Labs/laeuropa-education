import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  if (await currentUser()) redirect("/admin/updates");
  return (
    <div className="admin-bare">
      <main className="bare-main">
        <div className="auth-card">
          <img src="/img/logo.png" alt="LA Europa Education" className="auth-logo" />
          <h1>Team login</h1>
          <p className="muted">Sign in to manage the website.</p>
          <LoginForm />
          <a href="/" className="back-link">← Back to website</a>
        </div>
      </main>
    </div>
  );
}
