// POST /api/rsvp : réponse d'un invité (avec rid + rkey : modifie sa réponse précédente au lieu d'en créer une nouvelle).
//   Les mariés (en-tête Authorization: Bearer <clé du tableau de bord>) peuvent aussi ajouter ou corriger une réponse
//   à la main (l'oncle qui a répondu par téléphone) : « manual », et rid seul suffit pour remplacer.
// GET /api/rsvp?invite=slug&r=<rid>.<rkey> : la réponse de cet invité, pour la pré-remplir sur un autre téléphone.
// GET /api/rsvp?invite=slug (en-tête Authorization: Bearer <clé>) : réponses et ouvertures des liens par famille, pour le tableau de bord.
import { save, readAll, readOne, ready, dashKey, same, bearer, isAdmin, clean, id, newKey, keyHash } from './_store.js';
import { getInvite } from './_fiche.js';

const owner = (req, slug) => isAdmin(req) || same(bearer(req), dashKey(slug));

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const b = req.body || {};
    const inv = await getInvite(b.invite);
    if (!inv) return res.status(404).json({ error: 'invite' });
    if (b.website) return res.status(200).json({ ok: true });
    if (inv.demo) return res.status(200).json({ ok: true, demo: true });
    const byOwner = owner(req, b.invite);
    // les mariés disent qu'une réponse au même nom qu'une autre vient d'une autre personne (deux « Marie Martin ») :
    // elle n'est plus remplacée par la plus récente dans le tableau de bord
    if (byOwner && b.distinct && /^[\w-]{10,80}$/.test(b.rid || '')) {
      if (!ready()) return res.status(503).json({ error: 'storage' });
      const p = `rsvp/${b.invite}/${b.rid}.json`, old = await readOne(p);
      if (!old) return res.status(404).json({ error: 'rid' });
      await save(p, Object.assign(old, { distinct: true }));
      return res.status(200).json({ ok: true, rid: b.rid });
    }
    const name = clean(b.name, 120);
    if (!name) return res.status(400).json({ error: 'name' });
    const fam = b.family && inv.families[b.family] ? b.family : null;
    const allowed = fam && inv.families[fam].events ? inv.families[fam].events : inv.events;
    const events = {};
    for (const e of allowed) { if (typeof (b.events || {})[e] === 'boolean') events[e] = b.events[e]; }
    if (!Object.keys(events).length) return res.status(400).json({ error: 'events' });
    if (!ready()) return res.status(503).json({ error: 'storage' });
    // qui vient : les personnes nommées (prénom, menu choisi parmi ceux du faire-part) ; le nombre en découle
    const menus = inv.rsvpMenu || [];
    const people = (Array.isArray(b.people) ? b.people : []).slice(0, 20)
      .map(p => ({ name: clean(p && p.name, 80), menu: menus.includes(p && p.menu) ? p.menu : '' })).filter(p => p.name);
    const guests = Math.max(1, Math.min(20, people.length || parseInt(b.guests, 10) || 1));
    // l'invité qui renvoie sa réponse avec son lien personnel remplace sa réponse précédente ; les mariés remplacent avec rid seul
    let rid = /^[\w-]{10,80}$/.test(b.rid || '') ? b.rid : null, rkey = rid ? String(b.rkey || '') : null;
    if (rid) { const old = await readOne(`rsvp/${b.invite}/${rid}.json`); if (!old || !(byOwner || same(old.k, keyHash(rkey)))) rid = null; else if (byOwner) rkey = null; }
    if (!rid) { rid = id(); rkey = newKey(); }
    const row = { at: new Date().toISOString(), name, family: fam, guests, events, people, diet: clean(b.diet, 200), answer: clean(b.answer, 300), message: clean(b.message, 1000) };
    if (byOwner && b.manual) row.manual = true;
    const old = await readOne(`rsvp/${b.invite}/${rid}.json`);
    row.k = rkey == null && old ? old.k : keyHash(rkey);
    if (old && old.distinct) row.distinct = true;
    await save(`rsvp/${b.invite}/${rid}.json`, row);
    return res.status(200).json(rkey == null ? { ok: true, rid } : { ok: true, rid, rkey });
  }
  if (req.method === 'GET') {
    const slug = String(req.query.invite || '');
    const inv = await getInvite(slug);
    if (!inv) return res.status(404).json({ error: 'invite' });
    if (req.query.r) {
      const [rid, rkey] = String(req.query.r).split('.');
      if (!/^[\w-]{10,80}$/.test(rid || '')) return res.status(400).json({ error: 'r' });
      if (!ready()) return res.status(503).json({ error: 'storage' });
      const row = await readOne(`rsvp/${slug}/${rid}.json`);
      if (!row || !same(row.k, keyHash(rkey))) return res.status(404).json({ error: 'r' });
      const { k, ...reply } = row;
      return res.status(200).json({ reply });
    }
    if (!owner(req, slug)) return res.status(401).json({ error: 'key' });
    if (!ready()) return res.status(503).json({ error: 'storage' });
    const rows = (await readAll(`rsvp/${slug}/`)).sort((a, b) => a.at < b.at ? -1 : 1);
    // une personne qui répond deux fois (deux téléphones, sans son lien personnel) : on compte sa dernière réponse ; les plus
    // anciennes restent dans la liste, marquées « replaced » (le tableau de bord les montre à part : ce peut être un homonyme,
    // que les mariés marquent « autre personne », distinct)
    const last = new Map();
    for (const r of rows) { const n = r.name.toLowerCase().replace(/\s+/g, ' ').trim(); if (!r.distinct) last.set(n, r); }
    const keep = new Set(last.values());
    const tidy = ({ k, pathname, ...r }) => Object.assign({ rid: pathname.slice(`rsvp/${slug}/`.length, -5) }, r);
    // ouvertures des liens par famille (api/seen.js) : { famille: { first, last, n } }
    const seen = {}; for (const s of await readAll(`seen/${slug}/`)) { const f = s.pathname.slice(`seen/${slug}/`.length, -5); seen[f] = { first: s.first, last: s.last, n: s.n }; }
    return res.status(200).json({ invite: { slug, couple: inv.couple, online: !!inv.online, events: inv.eventList, families: inv.familyLabels, menu: inv.rsvpMenu || [], question: inv.rsvpQuestion || '' },
      responses: rows.map(r => Object.assign(tidy(r), r.distinct || keep.has(r) ? {} : { replaced: true })), seen });
  }
  res.status(405).json({ error: 'method' });
}
