import Link from "next/link";
import Icon from "@/components/admin/Icon";
import { requirePageUser } from "@/lib/auth";
import { getCountries } from "@/lib/content";
import Flash from "@/components/admin/Flash";
import ActionForm from "@/components/admin/ActionForm";
import { Flag } from "@/components/ui";
import { countryOp } from "./actions";

export default async function CountriesAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requirePageUser();
  const sp = await searchParams;
  const list = await getCountries();
  return (
    <>
      <Flash ok={sp.ok} />
      <div className="page-head">
        <div><h1>Countries</h1><p className="muted">{list.length} countries on the website. The first 16 appear in the home page flag circle; the first 6 in the footer.</p></div>
        <Link href="/admin/countries/new" className="btn btn-primary"><Icon name="plus" size={16} />Add country</Link>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>#</th><th>Country</th><th>Region</th><th>Intakes</th><th>Popular</th><th></th></tr></thead>
          <tbody>
            {list.map((c, i) => (
              <tr key={c.code}>
                <td className="muted">{i + 1}</td>
                <td><div className="t-title"><Flag code={c.code} name={c.name} className="admin-flag" /><Link href={`/admin/countries/${i}`}><strong>{c.name}</strong></Link></div></td>
                <td>{c.region}</td>
                <td>{c.intake}</td>
                <td>{c.popular && <span className="status status-published">Popular</span>}</td>
                <td className="t-actions">
                  <ActionForm action={countryOp} className="inline"><input type="hidden" name="index" value={i} /><input type="hidden" name="code" value={c.code} /><input type="hidden" name="op" value="up" />
                    <button type="submit" className="linkish" title="Move up" disabled={i === 0}>↑</button></ActionForm>
                  <ActionForm action={countryOp} className="inline"><input type="hidden" name="index" value={i} /><input type="hidden" name="code" value={c.code} /><input type="hidden" name="op" value="down" />
                    <button type="submit" className="linkish" title="Move down" disabled={i === list.length - 1}>↓</button></ActionForm>
                  <Link href={`/admin/countries/${i}`}>Edit</Link>
                  <ActionForm action={countryOp} className="inline" confirm="Remove this country from the website?">
                    <input type="hidden" name="index" value={i} /><input type="hidden" name="code" value={c.code} /><input type="hidden" name="op" value="delete" />
                    <button type="submit" className="linkish danger">Remove</button></ActionForm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
