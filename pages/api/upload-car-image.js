import { supabaseAdmin } from '../../lib/supabase';

export const config = { api: { bodyParser: { sizeLimit: '12mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { base64, fileName, mimeType } = req.body;
  if (!base64 || !fileName) return res.status(400).json({ error: 'base64 and fileName required' });

  const admin = supabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'Service role key missing' });

  try {
    const binary = Buffer.from(base64, 'base64');
    const ext = fileName.split('.').pop() || 'jpg';
    const path = `cars/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await admin.storage
      .from('car-images')
      .upload(path, binary, { contentType: mimeType || 'image/jpeg', upsert: false });

    if (error) return res.status(500).json({ error: error.message });

    const { data: urlData } = admin.storage.from('car-images').getPublicUrl(path);
    return res.json({ url: urlData.publicUrl });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
