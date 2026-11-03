import { requirePageUser } from "@/lib/auth";
import { getFaqs } from "@/lib/content";
import Flash from "@/components/admin/Flash";
import ActionForm from "@/components/admin/ActionForm";
import FaqEditor from "@/components/admin/FaqEditor";
import { saveFaqs } from "./actions";

export default async function FaqsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requirePageUser();
  const sp = await searchParams;
  const faqs = await getFaqs();
  return (
    <>
      <Flash ok={sp.ok} />
      <div className="page-head">
        <div><h1>FAQs</h1><p className="muted">Questions shown on the Services page. Leave a question empty to remove it. Use ↑ ↓ to change the order.</p></div>
      </div>
      <ActionForm action={saveFaqs}><FaqEditor initial={faqs} /></ActionForm>
    </>
  );
}
