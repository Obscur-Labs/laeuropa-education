import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import { getAllReviews, getCountries, type Review } from "@/lib/content";
import { mediaUrl } from "@/lib/store";
import ActionForm from "@/components/admin/ActionForm";
import PhotoPreview from "@/components/admin/PhotoPreview";
import { saveReview } from "../actions";

export default async function EditReview({ params }: { params: Promise<{ id: string }> }) {
  await requirePageUser();
  const { id } = await params;
  const isNew = id === "new";
  const [reviews, countries] = await Promise.all([getAllReviews(), getCountries()]);
  const found = isNew ? undefined : reviews.find((r) => r.id === id);
  if (!isNew && !found) notFound();
  const r: Review = found ?? { id: "", name: "", photo: "", university: "", course: "", country: "", intake: "", rating: 5, text: "", status: "published", consent: "", created_at: "" };

  return (
    <>
      <div className="page-head">
        <div><a href="/admin/reviews" className="back-link">← All reviews</a><h1>{isNew ? "Add student review" : "Edit review"}</h1></div>
      </div>
      <ActionForm action={saveReview}>
        <div className="editor-layout">
          <input type="hidden" name="id" value={r.id} />
          <div className="panel">
            <div className="settings-grid">
              <label className="field-label">Student name<input type="text" name="name" defaultValue={r.name} required maxLength={80} /></label>
              <label className="field-label">Rating
                <select name="rating" defaultValue={String(r.rating)}>
                  {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{"★".repeat(s) + "☆".repeat(5 - s)} ({s})</option>)}
                </select>
              </label>
              <label className="field-label">University / institution<input type="text" name="university" defaultValue={r.university} maxLength={120} placeholder="e.g. University of Galway" /></label>
              <label className="field-label">Course<input type="text" name="course" defaultValue={r.course} maxLength={120} placeholder="e.g. MSc Data Analytics" /></label>
              <label className="field-label">Study country
                <select name="country" defaultValue={r.country}>
                  <option value="">—</option>
                  {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </label>
              <label className="field-label">Intake / year<input type="text" name="intake" defaultValue={r.intake} maxLength={40} placeholder="e.g. Sep 2025" /></label>
              <label className="field-label span-2">Review (student&apos;s own words)<textarea name="text" rows={6} maxLength={1500} required defaultValue={r.text} /></label>
            </div>
          </div>
          <aside className="editor-side">
            <div className="panel">
              <h3>Student photo</h3>
              <PhotoPreview name="photo" current={mediaUrl(r.photo)} max={800} />
              <p className="hint">Square photo looks best. Resized automatically.</p>
              {r.photo && <label className="check"><input type="checkbox" name="remove_photo" value="1" /> Remove photo</label>}
            </div>
            <div className="panel">
              <h3>Publish</h3>
              <label className="check consent-check"><input type="checkbox" name="consent" value="1" defaultChecked={!!r.consent} />
                <span>The student has given <strong>written consent</strong> (email / WhatsApp) to show their name, photo and review on the website.</span></label>
              {r.consent && <p className="hint">{r.consent}</p>}
              <label className="field-label">Status
                <select name="status" defaultValue={r.status}>
                  <option value="published">Published (on website)</option>
                  <option value="hidden">Hidden</option>
                </select>
              </label>
              <button type="submit" className="btn btn-primary btn-block">Save review</button>
            </div>
          </aside>
        </div>
      </ActionForm>
    </>
  );
}
