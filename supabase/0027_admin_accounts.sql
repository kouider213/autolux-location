-- 0027 — Comptes admin : login par nom d'utilisateur + gestion d'équipe. Coller dans Supabase → SQL Editor → Run.

-- Nom d'utilisateur (login sans email). Unique, insensible à la casse.
alter table profiles add column if not exists username text;
create unique index if not exists profiles_username_uk on profiles (lower(username));

-- Admin suprême : peut gérer les autres comptes. Kouider = true par défaut.
alter table profiles add column if not exists is_super boolean default false;
update profiles set is_super = true where role = 'kouider';

-- (le rôle accepte déjà 'kouider' | 'houari' | 'admin')
