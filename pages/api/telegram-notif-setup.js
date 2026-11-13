// 13/11 : branche le bot de notifs sur /api/telegram-notif (boutons). Appel admin ou Dzaryx (jeton interne) uniquement.
import { requireAdmin } from '../../lib/adminAuth';
import { tgCall } from '../../lib/telegramNotify';
import { hookSecret } from './telegram-notif';

export default async function handler(req, res) {
  if (!(await requireAdmin(req, res))) return;
  if (req.query.check) { const i = await tgCall('getWebhookInfo', {}); const me = await tgCall('getMe', {}); return res.status(200).json({ bot: me?.result?.username, url: i?.result?.url || '', pending: i?.result?.pending_update_count }); }
  const set = await tgCall('setWebhook', { url: 'https://fikconciergerie.com/api/telegram-notif', secret_token: hookSecret(), allowed_updates: ['callback_query', 'message'], drop_pending_updates: true });
  const info = await tgCall('getWebhookInfo', {});
  return res.status(200).json({ set: set?.ok === true, description: set?.description, url: info?.result?.url, pending: info?.result?.pending_update_count, last_error: info?.result?.last_error_message || null });
}
