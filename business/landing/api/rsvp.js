// POST /api/rsvp : réponse d'un invité.  GET /api/rsvp?invite=slug (en-tête Authorization: Bearer <clé>) : réponses pour le tableau de bord.
import { save, readAll, ready, dashKey, same, bearer, isAdmin, clean, id } from './_store.js';
import INVITES from './_invites.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const b = req.body || {};
    const inv = INVITES[b.invite];
    if (!inv) return res.status(404).json({ error: 'invite' });
    if (b.website) return res.status(200).json({ ok: true });
    if (inv.demo) return res.status(200).json({ ok: true, demo: true });
    const name = clean(b.name, 120);
    if (!name) return res.status(400).json({ error: 'name' });
    const fam = b.family && inv.families[b.family] ? b.family : null;
    const allowed = fam && inv.families[fam].events ? inv.families[fam].events : inv.events;
    const events = {};
    for (const e of allowed) { if (typeof (b.events || {})[e] === 'boolean') events[e] = b.events[e]; }
    if (!Object.keys(events).length) return res.status(400).json({ error: 'events' });
    if (!ready()) return res.status(503).json({ error: 'storage' });
    const guests = Math.max(1, Math.min(20, parseInt(b.guests, 10) || 1));
    await save(`rsvp/${b.invite}/${id()}.json`, { at: new Date().toISOString(), name, family: fam, guests, events, diet: clean(b.diet, 200), message: clean(b.message, 1000) });
    return res.status(200).json({ ok: true });
  }
  if (req.method === 'GET') {
    const slug = String(req.query.invite || '');
    const inv = INVITES[slug];
    if (!inv) return res.status(404).json({ error: 'invite' });
    if (!isAdmin(req) && !same(bearer(req), dashKey(slug))) return res.status(401).json({ error: 'key' });
    if (!ready()) return res.status(503).json({ error: 'storage' });
    const rows = (await readAll(`rsvp/${slug}/`)).sort((a, b) => a.at < b.at ? -1 : 1);
    // une personne qui répond deux fois : on garde sa dernière réponse
    const last = new Map(); for (const r of rows) last.set(r.name.toLowerCase().replace(/\s+/g, ' '), r);
    return res.status(200).json({ invite: { slug, couple: inv.couple, events: inv.eventList, families: inv.familyLabels }, responses: [...last.values()] });
  }
  res.status(405).json({ error: 'method' });
}
