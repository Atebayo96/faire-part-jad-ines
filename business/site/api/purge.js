// Tâche quotidienne (cron Vercel) : supprime les réponses des invités 90 jours après le mariage (promesse RGPD).
import { removeAll, readAll, ready, same } from './_store.js';
import { summary } from './_fiche.js';
import INVITES from './_invites.js';

export default async function handler(req, res) {
  const auth = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!process.env.CRON_SECRET || !same(auth, process.env.CRON_SECRET)) return res.status(401).json({ error: 'key' });
  if (!ready()) return res.status(200).json({ skipped: 'storage' });
  const done = [];
  // les faire-part du dépôt, et ceux commandés en ligne (fiches/)
  const all = Object.entries(INVITES);
  for (const f of await readAll('fiches/')) if (f.inv && f.inv.slug) all.push([f.inv.slug, summary(f.inv)]);
  for (const [slug, v] of all) {
    if (Date.now() > new Date(v.date).getTime() + 90 * 864e5) { await removeAll(`rsvp/${slug}/`); await removeAll(`seen/${slug}/`); done.push(slug); }
  }
  res.status(200).json({ purged: done });
}
