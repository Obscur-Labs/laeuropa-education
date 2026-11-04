import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth";
import { getCountries, type Country } from "@/lib/content";
import ActionForm from "@/components/admin/ActionForm";
import FlagCodeInput from "@/components/admin/FlagCodeInput";
import { saveCountry } from "../actions";

export default async function EditCountry({ params }: { params: Promise<{ index: string }> }) {
  await requirePageUser();
  const { index } = await params;
  const list = await getCountries();
  const isNew = index === "new";
  const i = isNew ? -1 : /^\d{1,3}$/.test(index) ? parseInt(index, 10) : NaN;
  if (!isNew && !list[i]) notFound();
  const c: Country = isNew ? { code: "", name: "", region: "", lang: "", intake: "", popular: false, blurb: "", tags: [] } : list[i];
  const regions = [...new Set(list.map((x) => x.region))].sort();

  return (
    <>
      <div className="page-head">
        <div><Link href="/admin/countries" className="back-link">← All countries</Link><h1>{isNew ? "Add country" : `Edit ${c.name}`}</h1></div>
      </div>
      <ActionForm action={saveCountry} className="panel">
        <input type="hidden" name="index" value={i} />
        <input type="hidden" name="orig_code" value={c.code} />
        <div className="settings-grid">
          <label className="field-label">Country name<input type="text" name="name" defaultValue={c.name} required maxLength={60} /></label>
          <label className="field-label">Flag code (2 letters)
            <FlagCodeInput initial={c.code} />
            <small>Examples: gb, de, fr, it, nl. <a href="https://flagicons.lipis.dev/" target="_blank" rel="noopener noreferrer">Find a code ↗</a></small>
          </label>
          <label className="field-label">Region
            <input type="text" name="region" defaultValue={c.region} list="regions" required maxLength={60} />
            <datalist id="regions">{regions.map((r) => <option key={r} value={r} />)}</datalist>
            <small>Used for the filter buttons on the Countries page.</small>
          </label>
          <label className="field-label">Intakes<input type="text" name="intake" defaultValue={c.intake} placeholder="Sep · Feb" maxLength={60} /></label>
          <label className="field-label">Teaching language<input type="text" name="lang" defaultValue={c.lang} placeholder="English & German" maxLength={80} /></label>
          <label className="field-label">Popular courses (comma separated)<input type="text" name="tags" defaultValue={c.tags.join(", ")} placeholder="Engineering, Business, IT" maxLength={300} /></label>
          <label className="field-label span-2">Short description<textarea name="blurb" rows={3} defaultValue={c.blurb} maxLength={400} /></label>
          <label className="check span-2"><input type="checkbox" name="popular" value="1" defaultChecked={c.popular} /> Show &quot;Popular&quot; badge and list on the home page</label>
        </div>
        <div className="save-bar"><button type="submit" className="btn btn-primary">Save country</button></div>
      </ActionForm>
    </>
  );
}
