import Link from "next/link";
import Icon from "@/components/admin/Icon";
import { requirePageUser } from "@/lib/auth";
import { getCountries } from "@/lib/content";
import Flash from "@/components/admin/Flash";
import CountryOrder from "@/components/admin/CountryOrder";

export default async function CountriesAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requirePageUser();
  const sp = await searchParams;
  const list = await getCountries();
  // Remount the list only when countries are added or removed, not when they are merely reordered
  const setKey = list.map((c) => c.code).sort().join(",");
  return (
    <>
      <Flash ok={sp.ok} />
      <div className="page-head">
        <div><h1>Countries</h1><p className="muted">{list.length} countries on the website, shown in this order.</p></div>
        <Link href="/admin/countries/new" className="btn btn-primary"><Icon name="plus" size={16} />Add country</Link>
      </div>
      <CountryOrder key={setKey} initial={list} />
    </>
  );
}
