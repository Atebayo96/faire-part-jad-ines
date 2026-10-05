// Liste de mariage tenue chez nous (gifts.mode = 'liste' dans la fiche du faire-part).
// GET  /api/gifts?invite=slug                       : les cadeaux déjà réservés (identifiants seulement, sans les noms).
// GET  /api/gifts?invite=slug (Authorization: Bearer <clé>) : qui offre quoi, pour le tableau de bord des mariés.
// POST /api/gifts {invite, item, name}               : réserve un cadeau ; 409 s'il est déjà pris.
import { save, readAll, readOne, ready, dashKey, same, bearer, isAdmin, clean } from './_store.js';
import INVITES from './_invites.js';

export default async function handler(req, res) {
  const slug = String((req.method === 'POST' ? (req.body || {}).invite : req.query.invite) || '');
  const inv = INVITES[slug];
  if (!inv || !(inv.gifts || []).length) return res.status(404).json({ error: 'invite' });
  if (req.method === 'POST') {
    const b = req.body || {};
    if (b.website) return res.status(200).json({ ok: true });
    if (inv.demo) return res.status(200).json({ ok: true, demo: true });
    const item = String(b.item || '');
    if (!inv.gifts.includes(item)) return res.status(400).json({ error: 'item' });
    const name = clean(b.name, 120);
    if (!name) return res.status(400).json({ error: 'name' });
    if (!ready()) return res.status(503).json({ error: 'storage' });
    const p = `gifts/${slug}/${item}.json`;
    if (await readOne(p)) return res.status(409).json({ error: 'taken' });
    await save(p, { at: new Date().toISOString(), item, name });
    return res.status(200).json({ ok: true });
  }
  if (req.method === 'GET') {
    if (!ready()) return res.status(200).json({ taken: [] });
    const rows = await readAll(`gifts/${slug}/`);
    if (isAdmin(req) || same(bearer(req), dashKey(slug))) return res.status(200).json({ gifts: rows.map(({ pathname, ...r }) => ({ ...r, label: (inv.giftLabels || {})[r.item] || r.item })).sort((a, b) => a.at < b.at ? -1 : 1) });
    return res.status(200).json({ taken: rows.map(r => r.item) });
  }
  res.status(405).json({ error: 'method' });
}
