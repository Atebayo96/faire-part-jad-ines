// Tâche quotidienne (cron Vercel) : supprime les réponses des invités 90 jours après le mariage (promesse RGPD).
import { removeAll, ready, same } from './_store.js';
import INVITES from './_invites.js';

export default async function handler(req, res) {
  const auth = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!process.env.CRON_SECRET || !same(auth, process.env.CRON_SECRET)) return res.status(401).json({ error: 'key' });
  if (!ready()) return res.status(200).json({ skipped: 'storage' });
  const done = [];
  for (const [slug, v] of Object.entries(INVITES)) {
    if (Date.now() > new Date(v.date).getTime() + 90 * 864e5) { await removeAll(`rsvp/${slug}/`); done.push(slug); }
  }
  res.status(200).json({ purged: done });
}
