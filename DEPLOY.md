# LA Europa Education — Going live on Vercel (free) + Supabase (free)

The website is a Next.js app. **Vercel** runs the website; **Supabase** stores the content
(settings, reviews, updates, enquiries, team logins) and the uploaded photos/PDFs.
Your **GoDaddy** domain is connected to Vercel at the end.

> ⚠️ Vercel's free **Hobby** plan is officially for personal / non-commercial use. A business site may be
> asked to move to Pro (~$20/month). Everything else here stays the same if you upgrade later.

You only do steps 1–6 once. Allow about 30–45 minutes.

---

## 1. Create the database (Supabase, free)

1. Go to **supabase.com** → sign up → **New project**.
   - Name: `la-europa` · Region: **South Asia (Mumbai)** · set a strong database password (save it).
2. When the project is ready: left menu **SQL Editor** → **New query** → open the file
   `supabase/setup.sql` from this folder, copy everything, paste, click **Run**. You should see "Success".
3. Left menu **Project Settings → API**. Keep this page open — you need:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **service_role** key (click "Reveal"). **This key is secret** — never share it, never put it in chat or email.

## 2. Create the admin login

1. In this folder (`la-europa-next`), copy `.env.example` to a new file named **`.env.local`**
   and fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from step 1.3.
2. Open a terminal in this folder and run:

   ```
   ..\tools\node\node.exe --env-file=.env.local scripts\setup.mjs
   ```

   It creates the storage bucket and asks for the admin email (press Enter for `info.laeuropa@gmail.com`),
   name and a **new strong password** (min 10 characters, upper + lower case + number).
   Only a secure hash of the password is stored.

## 3. Put the website on Vercel

**Option A — with GitHub (recommended, updates deploy automatically)**
1. Create a new GitHub repository (e.g. `la-europa-website`) and upload **this folder's contents**
   (GitHub Desktop is easiest). `.env.local`, `.local-data` and `node_modules` are ignored automatically — keep it that way.
2. **vercel.com** → sign up with GitHub → **Add New → Project** → import the repository → **Deploy**.

**Option B — without GitHub**
1. In a terminal in this folder: `..\tools\node\npx.cmd vercel` → log in in the browser → accept the defaults.

## 4. Add the secret settings in Vercel

Vercel → your project → **Settings → Environment Variables** → add (for *Production* and *Preview*):

| Name | Value |
|---|---|
| `SUPABASE_URL` | Project URL from step 1.3 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key from step 1.3 |
| `SITE_URL` | `https://www.yourdomain.com` |
| `CRON_SECRET` | any long random text (e.g. 40 random letters/numbers) |

Then **Deployments → ⋯ → Redeploy** so the new settings are used.

## 5. Connect your GoDaddy domain

1. Vercel → project → **Settings → Domains** → add `yourdomain.com` **and** `www.yourdomain.com`.
2. Vercel shows the DNS records to create. In **GoDaddy → My Products → your domain → DNS**:
   - edit/add the **A** record for `@` with the IP Vercel shows (usually `76.76.21.21`);
   - add a **CNAME** for `www` with the value Vercel shows (usually `cname.vercel-dns.com`).
   - Delete any old A/CNAME records for `@` / `www` that point elsewhere (e.g. GoDaddy parking).
3. Wait 10 minutes to a few hours. Vercel issues the free **HTTPS** certificate automatically.

## 6. Final checks (2 minutes)

- `https://yourdomain.com` opens with the padlock 🔒.
- `https://yourdomain.com/admin/login` → log in with the admin from step 2.
- Admin → **Team logins** → add your team (they get **Editor** unless you choose Admin).
- Submit a test enquiry on the Contact page → it appears in Admin → **Enquiries**.

---

## Everyday use

Everything is managed in `/admin`: Updates (blog), Enquiries (+CSV), Student reviews (photo + consent),
Certificates, Countries, FAQs, Site settings (admins) and Team logins (admins).

## Security summary

- Database and files are reachable **only** through the website's server (secret key lives in Vercel only).
  Row Level Security is on with no public access.
- Passwords: bcrypt hashes; 5 wrong logins → 15-minute block per connection, 10/hour per account.
  Sessions expire after 2 h idle / 12 h max; changing a password or removing a member logs them out everywhere.
- No public sign-up and no setup page — new logins can only be created by an admin.
- Every form/action re-checks the login and role on the server; cross-site requests are rejected.
- Strict Content-Security-Policy with a fresh nonce per page, HSTS, clickjacking and MIME-sniffing protection.
- All text is escaped; blog HTML is cleaned with a strict allow-list when saved **and** when shown.
- Uploaded images are re-encoded to WebP (strips hidden data like GPS); PDFs are checked by file signature.
- Optional email alerts for new enquiries: add `RESEND_API_KEY` (resend.com, free) and set the
  "Send new enquiries to" email in Site settings.

## Running it on your computer

Double-click **`Start New Website.bat`** in the main folder → http://localhost:3000
(without `.env.local` it uses a local test store in `.local-data/`; with it, it uses your real Supabase).
