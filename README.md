# LA Europa Education — Website (Next.js)

**Explore · Experience · Educate**

Public website + admin panel, built for **Vercel** (hosting) and **Supabase** (database & file storage).

- **Go live:** follow [DEPLOY.md](DEPLOY.md) step by step.
- **Run locally:** double-click `Start New Website.bat` in the parent folder → http://localhost:3000

## Structure

| Path | What |
|---|---|
| `src/app/(site)/` | Public pages: home, about, countries, services, reviews, updates, contact, legal pages |
| `src/app/admin/` | Admin panel (login, updates, enquiries, reviews, certificates, countries, FAQs, settings, team) |
| `src/lib/` | Server-only logic: storage, auth/sessions, rate limiting, uploads, HTML sanitising |
| `src/proxy.ts` | Security headers, per-request CSP nonce, cross-site request blocking |
| `src/data/` | Default content (settings, 35 countries, FAQs, certificates, starter posts, official Terms text) |
| `public/certificates/` | The six built-in certificates (image + PDF) |
| `supabase/setup.sql` | One-time database setup |
| `scripts/setup.mjs` | Creates the storage bucket and the admin login |

## Commands

```bash
npm run dev      # local development (http://localhost:3000)
npm run build    # production build
npm run lint
```
