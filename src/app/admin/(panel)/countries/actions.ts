"use server";

import { adminAction, FormError, type ActionResult } from "@/lib/admin";
import { getCountries, type Country } from "@/lib/content";
import { putDoc } from "@/lib/store";
import { text } from "@/lib/sanitize";

function indexOf(form: FormData): number {
  const raw = text(form.get("index"), 4);
  return /^\d{1,3}$/.test(raw) ? parseInt(raw, 10) : -1;
}

export async function saveCountry(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return adminAction(undefined, async () => {
    const list = [...(await getCountries())];
    const i = indexOf(form);
    const item: Country = {
      code: text(form.get("code"), 2).toLowerCase(),
      name: text(form.get("name"), 60),
      region: text(form.get("region"), 60),
      lang: text(form.get("lang"), 80),
      intake: text(form.get("intake"), 60),
      popular: !!form.get("popular"),
      blurb: text(form.get("blurb"), 400),
      tags: text(form.get("tags"), 300).split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
    };
    if (!/^[a-z]{2}$/.test(item.code)) throw new FormError("Flag code must be the 2-letter country code (for example de, fr, gb).");
    if (!item.name || !item.region) throw new FormError("Please enter the country name and region.");
    if (i >= 0 && list[i]?.code !== text(form.get("orig_code"), 2)) {
      throw new FormError("The list was changed by someone else. Please go back and open this country again.");
    }
    if (list.some((c, k) => c.code === item.code && k !== i)) throw new FormError("This country is already in the list.");
    if (i >= 0 && list[i]) list[i] = item; else list.push(item);
    await putDoc("countries", "list", list);
    return "/admin/countries?ok=saved";
  });
}

export async function countryOp(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return adminAction(undefined, async () => {
    const list = [...(await getCountries())];
    const i = indexOf(form);
    if (!list[i] || list[i].code !== text(form.get("code"), 2)) throw new FormError("The list was changed by someone else. Please reload the page.");
    const op = text(form.get("op"), 10);
    if (op === "delete") {
      list.splice(i, 1);
      await putDoc("countries", "list", list);
      return "/admin/countries?ok=deleted";
    }
    const j = op === "up" ? i - 1 : op === "down" ? i + 1 : -1;
    if (j >= 0 && j < list.length) {
      [list[i], list[j]] = [list[j], list[i]];
      await putDoc("countries", "list", list);
    }
    return "/admin/countries";
  });
}
