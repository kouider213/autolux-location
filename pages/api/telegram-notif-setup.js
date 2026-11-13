// 13/11 : branche le bot de notifs sur /api/telegram-notif (boutons). Appel admin ou Dzaryx (jeton interne) uniquement.
import { requireAdmin } from '../../lib/adminAuth';
import { tgCall } from '../../lib/telegramNotify';
import { hookSecret } from './telegram-notif';

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;
  if (req.query.check) { const i = await tgCall('getWebhookInfo', {}); const me = await tgCall('getMe', {}); return res.status(200).json({ bot: me?.result?.username, url: i?.result?.url || '', pending: i?.result?.pending_update_count }); }
  // 13/11 : Telegram limite setWebhook (« Too Many Requests: retry after 1 ») → on attend et on réessaie (3 fois max)
  const params = { url: 'https://fikconciergerie.com/api/telegram-notif', secret_token: hookSecret(), allowed_updates: ['callback_query', 'message'], drop_pending_updates: true };
  let set = null;
  for (let i = 0; i < 3; i++) {
    set = await tgCall('setWebhook', params);
    if (set?.ok || set?.error_code !== 429) break;
    await new Promise(r => setTimeout(r, (Number(set?.parameters?.retry_after) || 1) * 1000 + 300));
  }
  const info = await tgCall('getWebhookInfo', {});
  return res.status(200).json({ set: set?.ok === true, description: set?.description, url: info?.result?.url, pending: info?.result?.pending_update_count, last_error: info?.result?.last_error_message || null });
}
