// Cron Vercel (toutes les 10 minutes) : publie sur TikTok les posts de la file dont l'heure est venue, et relit l'état
// de ceux qui sont partis (voir _tiktok.js). Sans compte relié ni post dû, ne fait rien.
import { ready, same } from './_store.js';
import { run } from './_tiktok.js';

export default async function handler(req, res) {
  const auth = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!process.env.CRON_SECRET || !same(auth, process.env.CRON_SECRET)) return res.status(401).json({ error: 'key' });
  if (!ready()) return res.status(200).json({ skipped: 'storage' });
  const r = await run();
  res.status(200).json({ done: r.done, error: r.error });
}
