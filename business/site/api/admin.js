// GET /api/admin (Authorization: Bearer SCEAU_SECRET) : demandes reçues + liens des tableaux de bord.
import { readAll, ready, dashKey, isAdmin } from './_store.js';
import { links } from './_publish.js';
import INVITES from './_invites.js';

export default async function handler(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'key' });
  const leads = ready() ? (await readAll('leads/')).sort((a, b) => a.at < b.at ? 1 : -1) : [];
  const invites = Object.entries(INVITES).map(([slug, v]) => ({ slug, couple: v.couple, demo: v.demo, date: v.date, link: `/d/${slug}/`, dashboard: `/tableau/#i=${slug}&k=${dashKey(slug)}` }));
  // commandes Essentiel en libre-service : payées (publiées, avec leurs liens) ou abandonnées avant le paiement
  const commandes = ready() ? (await readAll('commandes/')).sort((a, b) => a.at < b.at ? 1 : -1)
    .map(({ k, inv, config, pathname, ...c }) => Object.assign(c, { couple: inv && inv.couple.join(' & '), date: inv && inv.date }, c.slug ? links(c.slug, '') : {})) : [];
  res.status(200).json({ storage: ready(), leads, commandes, invites });
}
