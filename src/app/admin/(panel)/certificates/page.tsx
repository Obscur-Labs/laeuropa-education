import { requirePageUser } from "@/lib/auth";
import { formatDate, getCertificates } from "@/lib/content";
import { mediaUrl } from "@/lib/store";
import Flash from "@/components/admin/Flash";
import ActionForm from "@/components/admin/ActionForm";
import { certificateOp } from "./actions";

export default async function CertificatesAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requirePageUser();
  const sp = await searchParams;
  const certs = await getCertificates();
  return (
    <>
      <Flash ok={sp.ok} />
      <div className="page-head">
        <div><h1>Certificates</h1><p className="muted">Shown on the About page and the home page (first 6). Use ↑ ↓ to change the order.</p></div>
        <a href="/admin/certificates/new" className="btn btn-primary">+ Add certificate</a>
      </div>
      <div className="cert-admin-grid">
        {certs.map((c, i) => (
          <div key={i} className="panel cert-admin">
            <img src={mediaUrl(c.image)} alt="" />
            <div><strong>{c.title}</strong><small>{c.issuer}{c.date ? ` · ${formatDate(c.date)}` : ""}</small></div>
            <div className="cert-admin-actions">
              <ActionForm action={certificateOp} className="inline"><input type="hidden" name="index" value={i} /><input type="hidden" name="orig_image" value={c.image} /><input type="hidden" name="op" value="up" />
                <button type="submit" className="linkish" title="Move up" disabled={i === 0}>↑</button></ActionForm>
              <ActionForm action={certificateOp} className="inline"><input type="hidden" name="index" value={i} /><input type="hidden" name="orig_image" value={c.image} /><input type="hidden" name="op" value="down" />
                <button type="submit" className="linkish" title="Move down" disabled={i === certs.length - 1}>↓</button></ActionForm>
              <a href={`/admin/certificates/${i}`}>Edit</a>
              <ActionForm action={certificateOp} className="inline" confirm="Remove this certificate from the website?">
                <input type="hidden" name="index" value={i} /><input type="hidden" name="orig_image" value={c.image} /><input type="hidden" name="op" value="delete" />
                <button type="submit" className="linkish danger">Remove</button></ActionForm>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
