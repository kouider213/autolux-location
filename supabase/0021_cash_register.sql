-- 0021 — Caisse (cash register). À coller dans Supabase → SQL Editor → Run.

create table if not exists cash_entries (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null default 'income',   -- income | expense
  category    text,                             -- location, vente, carburant, entretien, salaire, autre...
  label       text,
  amount      numeric(12,2) not null check (amount >= 0),
  currency    text not null default 'DZD',      -- DZD | EUR
  entry_date  date not null default current_date,
  booking_id  uuid references bookings(id) on delete set null,
  created_at  timestamptz default now()
);
create index if not exists cash_entries_date_idx on cash_entries (entry_date desc);

alter table cash_entries enable row level security;

-- Lecture/écriture réservées aux utilisateurs authentifiés (admin)
drop policy if exists "cash read auth" on cash_entries;
create policy "cash read auth" on cash_entries for select using (auth.role() = 'authenticated');
drop policy if exists "cash write auth" on cash_entries;
create policy "cash write auth" on cash_entries for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
