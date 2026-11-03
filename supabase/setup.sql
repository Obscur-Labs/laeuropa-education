-- LA Europa Education — run this ONCE in Supabase → SQL Editor → New query → Run.
--
-- One table holds all website content (settings, countries, reviews, posts, enquiries, logins…).
-- Row Level Security is ON with NO policies, so the public "anon" key can read or write nothing.
-- Only the website's server (using the secret service-role key stored in Vercel) can access it.

create table if not exists public.documents (
  collection  text        not null,
  id          text        not null,
  data        jsonb       not null,
  updated_at  timestamptz not null default now(),
  primary key (collection, id)
);

alter table public.documents enable row level security;

-- Belt and braces: remove any table privileges from the public roles
revoke all on table public.documents from anon, authenticated;

-- Storage: the setup script creates a public-read bucket called "media".
-- Uploads/deletes happen only from the server with the service-role key; no storage policies are needed.
