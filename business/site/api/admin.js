// GET /api/admin (Authorization: Bearer SCEAU_SECRET) : demandes reçues + liens des tableaux de bord.
import { readAll, ready, dashKey, isAdmin } from './_store.js';
import INVITES from './_invites.js';

export default async function handler(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'key' });
  const leads = ready() ? (await readAll('leads/')).sort((a, b) => a.at < b.at ? 1 : -1) : [];
  const invites = Object.entries(INVITES).map(([slug, v]) => ({ slug, couple: v.couple, demo: v.demo, date: v.date, link: `/d/${slug}/`, dashboard: `/tableau/#i=${slug}&k=${dashKey(slug)}` }));
  res.status(200).json({ storage: ready(), leads, invites });
}
