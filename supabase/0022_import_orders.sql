-- 0022 — Suivi d'importation véhicule A→Z. À coller dans Supabase → SQL Editor → Run.

create table if not exists import_orders (
  id              uuid primary key default gen_random_uuid(),
  order_ref       text unique not null,            -- ex: IMP-7K2QF (donné au client)
  status          text not null default 'REQUESTED',
  -- client
  client_name     text,
  client_phone    text,
  client_email    text,
  client_city     text,
  lang            text default 'fr',
  -- véhicule demandé
  vehicle_brand   text,
  vehicle_model   text,
  vehicle_year    text,
  vehicle_type    text,
  vehicle_fuel    text,
  vehicle_gearbox text,
  vehicle_color   text,
  vehicle_specs   text,                            -- options / détails libres
  budget          numeric(12,2),
  currency        text default 'EUR',
  country_origin  text,
  deadline        text,
  -- gestion
  photos          jsonb default '[]'::jsonb,       -- [url, url, ...]
  notes_admin     text,                            -- privé (jamais exposé au client)
  notes_client    text,                            -- visible côté client
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists import_orders_ref_idx on import_orders (order_ref);
create index if not exists import_orders_created_idx on import_orders (created_at desc);

-- updated_at auto
create or replace function set_import_orders_updated_at()
returns trigger as $$ begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_import_orders_updated on import_orders;
create trigger trg_import_orders_updated before update on import_orders
  for each row execute function set_import_orders_updated_at();

alter table import_orders enable row level security;

-- Insertion publique (formulaire commande-vehicule) — création de la demande seulement.
drop policy if exists "import insert public" on import_orders;
create policy "import insert public" on import_orders for insert with check (true);

-- Lecture / écriture complètes réservées à l'admin authentifié.
-- (le suivi public passe par l'API clé-service /api/import-order — pas d'exposition directe)
drop policy if exists "import read auth" on import_orders;
create policy "import read auth" on import_orders for select using (auth.role() = 'authenticated');
drop policy if exists "import write auth" on import_orders;
create policy "import write auth" on import_orders for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "import delete auth" on import_orders;
create policy "import delete auth" on import_orders for delete using (auth.role() = 'authenticated');
