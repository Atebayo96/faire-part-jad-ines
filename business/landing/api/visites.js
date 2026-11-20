// GET /api/visites?days=7&parcours=50 (clé admin) : les chiffres de la mesure maison et les derniers parcours, visite par
// visite (page, clic, défilement, jeu, champ touché, départ). Lu par l'onglet Visites de /admin/ et par
// business/tools/visites.mjs.
import { ready, isAdmin } from './_store.js';
import { visitData } from './_visites.js';

export default async function handler(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'key' });
  if (!ready()) return res.status(503).json({ error: 'storage' });
  const days = Math.max(1, Math.min(90, parseInt(req.query.days, 10) || 7));
  const keep = Math.max(0, Math.min(500, parseInt(req.query.parcours, 10) || 0));
  res.status(200).json(Object.assign({ days, now: new Date().toISOString() }, await visitData(days, keep)));
}
