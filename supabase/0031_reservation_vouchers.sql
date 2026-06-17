-- Historique des bons de réservation générés depuis l'app. À coller dans Supabase → SQL Editor → Run.
create table if not exists reservation_vouchers (
  id          uuid primary key default gen_random_uuid(),
  ref         text,
  client_name text,
  passport    text,
  vehicle     text,
  deposit     numeric,
  total       numeric,
  currency    text,
  pickup      text,
  dropoff     text,
  url         text,
  created_at  timestamptz default now()
);
alter table reservation_vouchers enable row level security;
drop policy if exists "reservation_vouchers auth" on reservation_vouchers;
create policy "reservation_vouchers auth" on reservation_vouchers for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
