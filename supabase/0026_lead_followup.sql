-- 0026 — Relance automatique des leads par email. À coller dans Supabase → SQL Editor → Run.

alter table client_leads add column if not exists client_email   text;
alter table client_leads add column if not exists relance_sent_at timestamptz;  -- marqueur anti-double relance
