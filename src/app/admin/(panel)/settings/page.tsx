import { requirePageUser } from "@/lib/auth";
import { getSettings } from "@/lib/content";
import Flash from "@/components/admin/Flash";
import ActionForm from "@/components/admin/ActionForm";
import { saveSettings } from "./actions";
import { SETTINGS_GROUPS } from "./fields";

export default async function SettingsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requirePageUser("admin");
  const sp = await searchParams;
  const s = (await getSettings()) as unknown as Record<string, string>;
  return (
    <>
      <Flash ok={sp.ok} />
      <div className="page-head">
        <div><h1>Site settings</h1><p className="muted">Contact details, texts and links used across the whole website.</p></div>
      </div>
      <ActionForm action={saveSettings} className="settings-form">
        {Object.entries(SETTINGS_GROUPS).map(([title, fields]) => (
          <section key={title} className="panel">
            <h3>{title}</h3>
            <div className="settings-grid">
              {Object.entries(fields).map(([key, [label, type, hint]]) => (
                <label key={key} className={`field-label${type === "textarea" ? " span-2" : ""}`}>{label}
                  {type === "textarea"
                    ? <textarea name={key} rows={3} defaultValue={s[key] ?? ""} maxLength={1000} />
                    : <input type={type} name={key} defaultValue={s[key] ?? ""} maxLength={1000} />}
                  {hint && <small>{hint}</small>}
                </label>
              ))}
            </div>
          </section>
        ))}
        <div className="save-bar"><button type="submit" className="btn btn-primary">Save settings</button></div>
      </ActionForm>
    </>
  );
}
