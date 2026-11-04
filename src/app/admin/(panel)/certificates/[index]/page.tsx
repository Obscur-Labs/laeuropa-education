import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import { getCertificates, type Certificate } from "@/lib/content";
import { mediaUrl } from "@/lib/store";
import ActionForm from "@/components/admin/ActionForm";
import { saveCertificate } from "../actions";

export default async function EditCertificate({ params }: { params: Promise<{ index: string }> }) {
  await requirePageUser();
  const { index } = await params;
  const certs = await getCertificates();
  const isNew = index === "new";
  const i = isNew ? -1 : /^\d{1,3}$/.test(index) ? parseInt(index, 10) : NaN;
  if (!isNew && !certs[i]) notFound();
  const c: Certificate = isNew ? { title: "", course: "", issuer: "", holder: "", ref: "", date: "", image: "", pdf: "" } : certs[i];

  return (
    <>
      <div className="page-head">
        <div><Link href="/admin/certificates" className="back-link">← All certificates</Link><h1>{isNew ? "Add certificate" : "Edit certificate"}</h1></div>
      </div>
      <ActionForm action={saveCertificate}>
        <div className="editor-layout">
          <input type="hidden" name="index" value={i} />
          <input type="hidden" name="orig_image" value={c.image} />
          <div className="panel">
            <div className="settings-grid">
              <label className="field-label span-2">Certificate title<input type="text" name="title" defaultValue={c.title} required maxLength={150} placeholder="e.g. ICEF Trained Agent Counsellor (ITAC)" /></label>
              <label className="field-label span-2">Course name<input type="text" name="course" defaultValue={c.course} maxLength={200} placeholder="e.g. ICEF Agent Training Course (IATC)" /></label>
              <label className="field-label">Issued by<input type="text" name="issuer" defaultValue={c.issuer} required maxLength={120} placeholder="e.g. ICEF Academy" /></label>
              <label className="field-label">Awarded to<input type="text" name="holder" defaultValue={c.holder} maxLength={80} placeholder="e.g. Ankit Vasani" /></label>
              <label className="field-label">Date<input type="date" name="date" defaultValue={c.date} /></label>
              <label className="field-label">Certificate / graduate number<input type="text" name="ref" defaultValue={c.ref} maxLength={60} placeholder="optional" /></label>
            </div>
          </div>
          <aside className="editor-side">
            <div className="panel">
              <h3>Certificate image</h3>
              {c.image && <img src={mediaUrl(c.image)} alt="" className="cert-preview" />}
              <input type="file" name="image" accept="image/jpeg,image/png,image/webp" data-max="1400" />
              <p className="hint">JPG/PNG of the certificate (a screenshot of the PDF works). Shown on the website.</p>
            </div>
            <div className="panel">
              <h3>PDF (optional)</h3>
              {c.pdf && <>
                <p className="hint"><a href={mediaUrl(c.pdf)} target="_blank" rel="noopener noreferrer">Current PDF ↗</a></p>
                <label className="check"><input type="checkbox" name="remove_pdf" value="1" /> Remove PDF</label>
              </>}
              <input type="file" name="pdf" accept="application/pdf" data-limit-mb="3.5" />
              <p className="hint">Visitors can open the original PDF. Max 3.5 MB.</p>
              <button type="submit" className="btn btn-primary btn-block">Save certificate</button>
            </div>
          </aside>
        </div>
      </ActionForm>
    </>
  );
}
