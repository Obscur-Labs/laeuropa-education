"use client";

import { useActionState, useTransition, type ReactNode } from "react";

type Result = { error: string } | null;

/** Shrinks a photo in the browser so uploads stay well under Vercel's 4.5 MB request limit. */
async function compressImage(file: File, max: number): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.9));
    return blob && blob.size < file.size ? new File([blob], "image.webp", { type: "image/webp" }) : file;
  } catch {
    return file;
  }
}

/**
 * Form that calls a Server Action without React's automatic reset, so typed values stay
 * when the server reports a problem. Images marked with data-max are compressed first.
 */
export default function ActionForm({ action, children, className, confirm }: {
  action: (prev: Result, fd: FormData) => Promise<Result>;
  children: ReactNode;
  className?: string;
  confirm?: string;
}) {
  const [state, run] = useActionState<Result, FormData>(action, null);
  const [pending, start] = useTransition();

  return (
    <form
      className={className}
      encType="multipart/form-data"
      onSubmit={async (e) => {
        e.preventDefault();
        if (confirm && !window.confirm(confirm)) return;
        const form = e.currentTarget;
        const fd = new FormData(form);
        for (const input of Array.from(form.querySelectorAll<HTMLInputElement>("input[type=file][data-max]"))) {
          const f = input.files?.[0];
          if (f) fd.set(input.name, await compressImage(f, Number(input.dataset.max)));
        }
        for (const input of Array.from(form.querySelectorAll<HTMLInputElement>("input[type=file][data-limit-mb]"))) {
          const f = input.files?.[0];
          if (f && f.size > Number(input.dataset.limitMb) * 1024 * 1024) {
            window.alert(`That file is too large (max ${input.dataset.limitMb} MB).`);
            return;
          }
        }
        start(() => run(fd));
      }}
      aria-busy={pending}
    >
      {state?.error && <div className="alert alert-error" role="alert">{state.error}</div>}
      <fieldset disabled={pending} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>{children}</fieldset>
    </form>
  );
}
