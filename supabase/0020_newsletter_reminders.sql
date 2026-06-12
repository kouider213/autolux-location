-- 0020 — Newsletter diaspora + rappel J-1
-- À coller dans Supabase → SQL Editor → Run.

-- 1) Abonnés newsletter (capture email, aucun compte requis)
create table if not exists newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  lang        text default 'fr',
  source      text default 'site',
  status      text default 'active',          -- active | unsubscribed
  created_at  timestamptz default now()
);
create unique index if not exists newsletter_email_uk on newsletter_subscribers (lower(email));

alter table newsletter_subscribers enable row level security;

-- Inscription publique autorisée (insert), lecture/maj réservées au service key (admin)
drop policy if exists "newsletter insert public" on newsletter_subscribers;
create policy "newsletter insert public" on newsletter_subscribers
  for insert with check (true);

-- 2) Rappel J-1 : marqueur pour ne pas renvoyer deux fois
alter table bookings add column if not exists reminder_sent_at timestamptz;
