-- 0024 — Langue du client (pour répondre dans SA langue + emails/WhatsApp auto traduits).
-- À coller dans Supabase → SQL Editor → Run.

alter table bookings      add column if not exists client_lang text default 'fr';   -- fr | ar | en
alter table client_leads  add column if not exists lang        text default 'fr';
-- import_orders.lang existe déjà (0022)
