-- 0025 — Suivi de dossier (achat/vente véhicule + immobilier). À coller dans Supabase → SQL Editor → Run.

create table if not exists dossiers (
  id              uuid primary key default gen_random_uuid(),
  ref             text unique not null,            -- VTE-XXXX (voiture) ou IMM-XXXX (immo)
  kind            text not null default 'voiture', -- voiture | immo
  status          text not null default 'REQUESTED',
  -- client
  client_name     text,
  client_phone    text,
  client_email    text,
  client_city     text,
  lang            text default 'fr',
  -- objet du dossier
  subject         text,                            -- ex: "Golf 8 2020" ou "Appartement F3 Bir El Djir"
  listing_id      uuid,                            -- lien optionnel vers vehicles_for_sale / properties
  budget          numeric(12,2),
  currency        text default 'DZD',
  details         text,                            -- précisions libres
  -- gestion
  photos          jsonb default '[]'::jsonb,
  notes_admin     text,
  notes_client    text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists dossiers_ref_idx on dossiers (ref);
create index if not exists dossiers_created_idx on dossiers (created_at desc);

create or replace function set_dossiers_updated_at()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_dossiers_updated on dossiers;
create trigger trg_dossiers_updated before update on dossiers
  for each row execute function set_dossiers_updated_at();

alter table dossiers enable row level security;

drop policy if exists "dossiers insert public" on dossiers;
create policy "dossiers insert public" on dossiers for insert with check (true);

drop policy if exists "dossiers read auth" on dossiers;
create policy "dossiers read auth" on dossiers for select using (auth.role() = 'authenticated');
drop policy if exists "dossiers write auth" on dossiers;
create policy "dossiers write auth" on dossiers for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "dossiers delete auth" on dossiers;
create policy "dossiers delete auth" on dossiers for delete using (auth.role() = 'authenticated');
