// Les mariés modifient eux-mêmes leur faire-part commandé en ligne (lien « Modifier mon faire-part » du tableau de bord
// et de l'e-mail : /creer/?edit=<slug>#k=<clé du tableau de bord>). Le lien des invités ne change pas.
// GET /api/fiche?s=slug (Authorization: Bearer <clé>) : les choix du configurateur, pour le rouvrir tel quel.
// PUT /api/fiche {s, fiche, config} (même clé)      : la nouvelle fiche, nettoyée et vérifiée comme à la commande.
import { save, readOne, ready, dashKey, same, bearer, isAdmin } from './_store.js';
import { sanitize } from './_fiche.js';

export default async function handler(req, res) {
  const slug = String((req.method === 'PUT' ? (req.body || {}).s : req.query.s) || '');
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) return res.status(400).json({ error: 's' });
  if (!(isAdmin(req) || same(bearer(req), dashKey(slug)))) return res.status(401).json({ error: 'key' });
  if (!ready()) return res.status(503).json({ error: 'storage' });
  const f = await readOne(`fiches/${slug}.json`);
  if (!f) return res.status(404).json({ error: 'fiche' });
  if (req.method === 'GET') return res.status(200).json({ slug, plan: f.plan, config: f.config || null, updatedAt: f.updatedAt || f.at });
  if (req.method === 'PUT') {
    const b = req.body || {};
    let inv;
    try { inv = sanitize(b.fiche, f.plan, f.options); } catch (e) { return res.status(400).json({ error: e.message }); }
    const config = JSON.stringify(b.config || {}).length <= 60000 ? b.config || {} : f.config;
    // l'historique des versions : on garde la précédente, au cas où
    await save(`fiches-avant/${slug}/${Date.now()}.json`, f);
    await save(`fiches/${slug}.json`, Object.assign({}, f, { inv: Object.assign({ slug }, inv), config, updatedAt: new Date().toISOString() }));
    return res.status(200).json({ ok: true, link: `/d/${slug}/` });
  }
  res.status(405).json({ error: 'method' });
}
