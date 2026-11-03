"use server";

import { adminAction, FormError, type ActionResult } from "@/lib/admin";
import { getCertificates, type Certificate } from "@/lib/content";
import { deleteMedia, putDoc } from "@/lib/store";
import { text } from "@/lib/sanitize";
import { isFile, saveImageDetailed, savePdf } from "@/lib/uploads";

export async function saveCertificate(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return adminAction(undefined, async () => {
    const certs = [...(await getCertificates())];
    const idxRaw = text(form.get("index"), 4);
    const i = /^\d{1,3}$/.test(idxRaw) ? parseInt(idxRaw, 10) : -1;
    if (idxRaw && idxRaw !== "-1" && !certs[i]) throw new FormError("That certificate no longer exists.");
    if (certs[i] && certs[i].image !== text(form.get("orig_image"), 300)) {
      throw new FormError("The list was changed by someone else. Please go back and open this certificate again.");
    }
    const old: Certificate | undefined = certs[i];
    const date = text(form.get("date"), 10);
    const item: Certificate = {
      title: text(form.get("title"), 150),
      course: text(form.get("course"), 200),
      issuer: text(form.get("issuer"), 120),
      holder: text(form.get("holder"), 80),
      ref: text(form.get("ref"), 60),
      date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
      image: old?.image ?? "",
      pdf: old?.pdf ?? "",
      ...(old?.wide !== undefined ? { wide: old.wide } : {}),
    };
    if (!item.title || !item.issuer) throw new FormError("Please enter the certificate title and who issued it.");

    const toDelete: string[] = [];
    const pdf = form.get("pdf");
    // Check the PDF before uploading anything, so a bad PDF never leaves an orphaned image behind
    if (isFile(pdf)) {
      const head = Buffer.from(await pdf.slice(0, 5).arrayBuffer()).toString("latin1");
      if (head !== "%PDF-") throw new FormError("That file is not a PDF.");
      if (pdf.size > 3.5 * 1024 * 1024) throw new FormError("PDF is too large (max 3.5 MB).");
    }
    const img = form.get("image");
    if (!item.image && !isFile(img)) throw new FormError("Please upload an image of the certificate (JPG or PNG). Tip: take a screenshot of the PDF.");
    if (isFile(img)) {
      const saved = await saveImageDetailed(img, 1400);
      if (item.image) toDelete.push(item.image);
      item.image = saved.key;
      item.wide = saved.width > saved.height;
    }
    if (isFile(pdf)) {
      const key = await savePdf(pdf);
      if (item.pdf) toDelete.push(item.pdf);
      item.pdf = key;
    } else if (form.get("remove_pdf") && item.pdf) {
      toDelete.push(item.pdf);
      item.pdf = "";
    }

    if (old) certs[i] = item; else certs.unshift(item);
    await putDoc("certificates", "list", certs);
    for (const k of toDelete) await deleteMedia(k); // built-in /certificates/… files are never deleted
    return "/admin/certificates?ok=saved";
  });
}

export async function certificateOp(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return adminAction(undefined, async () => {
    const certs = [...(await getCertificates())];
    const idxRaw = text(form.get("index"), 4);
    const i = /^\d{1,3}$/.test(idxRaw) ? parseInt(idxRaw, 10) : -1;
    if (!certs[i] || certs[i].image !== text(form.get("orig_image"), 300)) throw new FormError("The list was changed by someone else. Please reload the page.");
    const op = text(form.get("op"), 10);
    if (op === "delete") {
      const [gone] = certs.splice(i, 1);
      await putDoc("certificates", "list", certs);
      await deleteMedia(gone.image);
      await deleteMedia(gone.pdf);
      return "/admin/certificates?ok=deleted";
    }
    const j = op === "up" ? i - 1 : op === "down" ? i + 1 : -1;
    if (j >= 0 && j < certs.length) {
      [certs[i], certs[j]] = [certs[j], certs[i]];
      await putDoc("certificates", "list", certs);
    }
    return "/admin/certificates";
  });
}
