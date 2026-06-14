-- Historique des devis générés depuis l'app. À coller dans Supabase → SQL Editor → Run.
create table if not exists quotes (
  id          uuid primary key default gen_random_uuid(),
  ref         text,
  client_name text,
  total       numeric,
  currency    text,
  url         text,
  lines       jsonb,
  created_at  timestamptz default now()
);
alter table quotes enable row level security;
drop policy if exists "quotes auth" on quotes;
create policy "quotes auth" on quotes for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
