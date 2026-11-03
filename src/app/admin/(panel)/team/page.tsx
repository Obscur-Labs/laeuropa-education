import { listUsers, requirePageUser } from "@/lib/auth";
import Flash from "@/components/admin/Flash";
import ActionForm from "@/components/admin/ActionForm";
import { changeOwnPassword, teamOp } from "./actions";

const PW_HINT = "At least 10 characters, with upper-case, lower-case letters and a number.";

export default async function Team({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const me = await requirePageUser();
  const sp = await searchParams;
  const isAdmin = me.role === "admin";
  const users = isAdmin ? await listUsers() : [];

  return (
    <>
      <Flash ok={sp.ok} />
      <div className="page-head">
        <div>
          <h1>{isAdmin ? "Team logins" : "My password"}</h1>
          {isAdmin && <p className="muted"><strong>Editor</strong>: updates, enquiries, reviews, certificates, countries and FAQs. <strong>Admin</strong>: everything, including site settings and team logins.</p>}
        </div>
      </div>
      <div className="two-col">
        {isAdmin && (
          <section className="panel">
            <h3>Team members</h3>
            <div className="team-list">
              {users.map((u) => {
                const self = u.id === me.id;
                return (
                  <div key={u.id} className="team-row">
                    <div className="team-who"><strong>{u.name}</strong>{self && <> <small className="muted">(you)</small></>}<small>{u.id}</small></div>
                    {self ? <span className="status status-published">{u.role === "admin" ? "Admin" : "Editor"}</span> : (
                      <>
                        <ActionForm action={teamOp} className="inline-form">
                          <input type="hidden" name="op" value="role" /><input type="hidden" name="username" value={u.id} />
                          <select name="role" defaultValue={u.role}><option value="editor">Editor</option><option value="admin">Admin</option></select>
                          <button type="submit" className="btn btn-small">Set role</button>
                        </ActionForm>
                        <details className="team-more">
                          <summary className="linkish">Reset password / remove</summary>
                          <ActionForm action={teamOp} className="inline-form">
                            <input type="hidden" name="op" value="reset" /><input type="hidden" name="username" value={u.id} />
                            <input type="password" name="password" placeholder="New password" autoComplete="new-password" required minLength={10} maxLength={200} />
                            <button type="submit" className="btn btn-small">Reset</button>
                          </ActionForm>
                          <ActionForm action={teamOp} confirm="Remove this team member? They will no longer be able to log in.">
                            <input type="hidden" name="op" value="delete" /><input type="hidden" name="username" value={u.id} />
                            <button type="submit" className="linkish danger">Remove team member</button>
                          </ActionForm>
                        </details>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <h3 className="mt">Add team member</h3>
            <ActionForm action={teamOp} className="stack">
              <input type="hidden" name="op" value="add" />
              <label>Name<input type="text" name="name" required maxLength={80} /></label>
              <label>Login ID (email or username)<input type="text" name="username" required autoComplete="off" placeholder="name@example.com" maxLength={120} /></label>
              <label>Password<input type="password" name="password" required autoComplete="new-password" minLength={10} maxLength={200} /><small className="muted">{PW_HINT}</small></label>
              <label>Role<select name="role"><option value="editor">Editor</option><option value="admin">Admin</option></select></label>
              <button className="btn btn-primary" type="submit">Add member</button>
            </ActionForm>
          </section>
        )}
        <section className="panel">
          <h3>Change my password</h3>
          <ActionForm action={changeOwnPassword} className="stack">
            <label>Current password<input type="password" name="current" required autoComplete="current-password" maxLength={200} /></label>
            <label>New password<input type="password" name="new" required autoComplete="new-password" minLength={10} maxLength={200} /><small className="muted">{PW_HINT}</small></label>
            <label>Confirm new password<input type="password" name="new2" required autoComplete="new-password" minLength={10} maxLength={200} /></label>
            <button className="btn btn-primary" type="submit">Change password</button>
          </ActionForm>
        </section>
      </div>
    </>
  );
}
