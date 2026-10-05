// POST /api/seen { invite, f } : une famille a ouvert son lien personnel (?f=…). On garde la première et la dernière
// ouverture et leur nombre, rien d'autre (pas d'adresse IP, pas d'appareil) : le tableau de bord des mariés distingue
// « pas ouvert », « ouvert sans réponse » et « répondu », pour ne relancer que ceux qu'il faut.
import { save, readOne, ready, clean } from './_store.js';
import INVITES from './_invites.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const b = req.body || {};
  const inv = INVITES[b.invite];
  if (!inv) return res.status(404).json({ error: 'invite' });
  const f = clean(b.f, 60);
  if (!f || !inv.families[f] || inv.demo) return res.status(200).json({ ok: true });
  if (!ready()) return res.status(503).json({ error: 'storage' });
  const p = `seen/${b.invite}/${f}.json`, now = new Date().toISOString();
  const old = await readOne(p);
  await save(p, { first: old ? old.first : now, last: now, n: (old ? old.n : 0) + 1 });
  res.status(200).json({ ok: true });
}
