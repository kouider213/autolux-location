-- 0023 — Fix RLS newsletter_subscribers : l'admin ne voyait AUCUN abonné.
-- 0020 n'avait créé qu'une policy INSERT (publique). Sans policy SELECT, RLS
-- refuse la lecture même à l'admin authentifié → liste vide. On ajoute lecture/maj/suppression admin.
-- À coller dans Supabase → SQL Editor → Run.

drop policy if exists "newsletter read auth"   on newsletter_subscribers;
create policy "newsletter read auth"   on newsletter_subscribers for select using (auth.role() = 'authenticated');

drop policy if exists "newsletter update auth" on newsletter_subscribers;
create policy "newsletter update auth" on newsletter_subscribers for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "newsletter delete auth" on newsletter_subscribers;
create policy "newsletter delete auth" on newsletter_subscribers for delete using (auth.role() = 'authenticated');
