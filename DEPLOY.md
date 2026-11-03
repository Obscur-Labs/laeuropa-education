# LA Europa Education: going live on Vercel + Firebase

The website is a Next.js app. **Vercel** runs the website; **Firebase Firestore** stores the content
(settings, reviews, updates, enquiries, team logins) and **Cloudinary** stores the uploaded photos/PDFs. Both have free plans.
Your **GoDaddy** domain is connected to Vercel at the end.

> ⚠️ Vercel's free **Hobby** plan is officially for personal / non-commercial use. A business site may be
> asked to move to Pro (~$20/month). Everything else here stays the same if you upgrade later.

You only do steps 1-6 once. Allow about 30-45 minutes.

---

## 1. Set up Firebase (database) and Cloudinary (photos and PDFs)

1. Go to **console.firebase.google.com** and open the project `la-europa` (or create it).
2. **Build > Firestore Database > Create database**: Native mode, location **asia-south1 (Mumbai)**.
3. **Lock it down.** Firestore Database > **Rules**: replace everything with the contents of `firestore.rules`
   from this folder and click **Publish** (browsers get no access at all; only the website's server can read/write).

   Or from a terminal in this folder: `npx firebase-tools login` then `npx firebase-tools deploy --only firestore:rules`.
4. **Cloudinary:** sign up free at **cloudinary.com**. Then:
   - Dashboard > **API Keys**: copy the **API environment variable** (`cloudinary://...`). **This is secret.**
   - Settings > **Security**: tick **Allow delivery of PDF and ZIP files** (free accounts block PDFs by default;
     certificate PDFs need it) and save.
5. Back in Firebase: **Project settings (gear icon) > Service accounts > Generate new private key.** A JSON file downloads.
   **This file is secret**: never share it, never put it in chat or email, never commit it.

## 2. Create the admin login

1. In this folder (`la-europa-next`), copy `.env.example` to a new file named **`.env.local`** and fill in
   from the JSON file: `project_id`, `client_email`, `private_key` (keep it in double quotes with the \n),
   plus `CLOUDINARY_URL` from step 1.4.
2. Open a terminal in this folder and run:

   ```
   ..\tools\node\node.exe --env-file=.env.local scripts\setup.mjs
   ```

   It asks for the admin email (press Enter for `info.laeuropa@gmail.com`),
   name and a **new strong password** (min 10 characters, upper + lower case + number).
   Only a secure hash of the password is stored.

## 3. Put the website on Vercel

**Option A: with GitHub (recommended, updates deploy automatically)**
1. Create a new GitHub repository (e.g. `la-europa-website`) and upload **this folder's contents**
   (GitHub Desktop is easiest). `.env.local`, `.local-data` and `node_modules` are ignored automatically: keep it that way.
2. **vercel.com** → sign up with GitHub → **Add New → Project** → import the repository → **Deploy**.

**Option B: without GitHub**
1. In a terminal in this folder: `..\tools\node\npx.cmd vercel` → log in in the browser → accept the defaults.

## 4. Add the secret settings in Vercel

Vercel → your project → **Settings → Environment Variables** → add (for *Production* and *Preview*):

| Name | Value |
|---|---|
| `FIREBASE_PROJECT_ID` | `project_id` from the JSON file |
| `FIREBASE_CLIENT_EMAIL` | `client_email` from the JSON file |
| `FIREBASE_PRIVATE_KEY` | `private_key` from the JSON file (paste it exactly, including BEGIN/END lines) |
| `CLOUDINARY_URL` | API environment variable from step 1.4 |
| `SITE_URL` | `https://www.yourdomain.com` |

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
  Firestore rules deny all browser access. Cloudinary uploads are signed on the server; files are only public to view.
- Passwords: bcrypt hashes; 5 wrong logins → 15-minute block per connection, 10/hour per account.
  Sessions expire after 2 h idle / 12 h max; changing a password or removing a member logs them out everywhere.
- No public sign-up and no setup page: new logins can only be created by an admin.
- Every form/action re-checks the login and role on the server; cross-site requests are rejected.
- Strict Content-Security-Policy with a fresh nonce per page, HSTS, clickjacking and MIME-sniffing protection.
- All text is escaped; blog HTML is cleaned with a strict allow-list when saved **and** when shown.
- Uploaded images are re-encoded to WebP (strips hidden data like GPS); PDFs are checked by file signature.
- Optional email alerts for new enquiries: add `RESEND_API_KEY` (resend.com, free) and set the
  "Send new enquiries to" email in Site settings.

## Running it on your computer

Double-click **`Start New Website.bat`** in the main folder → http://localhost:3000
(without `.env.local` it uses a local test store in `.local-data/`; with it, it uses your real Firebase).
