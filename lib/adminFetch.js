// fetch() des pages admin : ajoute la session admin (les routes /api d'administration la demandent depuis le 13/11)
import { supabase } from './supabase';

export async function adminFetch(url, opts = {}) {
  let token = null;
  try { const { data } = await supabase.auth.getSession(); token = data?.session?.access_token || null; } catch { /* */ }
  return fetch(url, { ...opts, headers: { ...(opts.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
}
