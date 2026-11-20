// Lecture de la mesure maison (mesure.js → api/t.js) : les paquets d'une période, regroupés par visite, puis les chiffres.
// Un jour passé est rangé en un seul fichier par la tâche quotidienne (`visites-jour/<jour>.json`, compact()) ; le jour en
// cours se lit paquet par paquet. Les visites marquées « à nous » (?moi=1) sont gardées mais hors des chiffres.
import { readAll, readOne, save, removeAll } from './_store.js';

const dayOf = t => new Date(t).toISOString().slice(0, 10);
const SEARCH = /google|bing|duckduckgo|ecosia|qwant|yahoo|brave/i;

async function batches(days) {
  const out = [], today = dayOf(Date.now());
  const list = []; for (let i = 0; i < days; i++) list.push(dayOf(Date.now() - i * 864e5));
  await Promise.all(list.map(async d => {
    const packed = d === today ? null : await readOne(`visites-jour/${d}.json`);
    if (packed && packed.batches) out.push(...packed.batches);
    out.push(...(await readAll(`visites/${d}/`)).map(({ pathname, ...b }) => b));
  }));
  return out;
}

// la tâche quotidienne : chaque jour passé devient un seul fichier ; au-delà de 13 mois, il est supprimé
export async function compact() {
  const today = dayOf(Date.now()), rows = await readAll('visites/'), byDay = {};
  for (const { pathname, ...b } of rows) { const d = pathname.split('/')[1]; if (d && d < today) (byDay[d] = byDay[d] || []).push(b); }
  for (const [d, list] of Object.entries(byDay)) {
    const old = await readOne(`visites-jour/${d}.json`);
    await save(`visites-jour/${d}.json`, { day: d, batches: ((old && old.batches) || []).concat(list) });
    await removeAll(`visites/${d}/`);
  }
  await removeAll(`visites-jour/${dayOf(Date.now() - 400 * 864e5)}`);
  return Object.keys(byDay);
}

function source(c) {
  const u = ((c.qs || {}).utm_source || '').toLowerCase(), ref = c.ref || '';
  if (c.app === 'tiktok' || c.clid === 'tiktok' || /tiktok/.test(u + ref)) return 'TikTok';
  if (c.app === 'instagram' || /instagram/.test(u + ref)) return 'Instagram';
  if (c.app === 'facebook' || c.clid === 'meta' || /facebook|fb\./.test(u + ref)) return 'Facebook';
  if (c.app) return c.app[0].toUpperCase() + c.app.slice(1);
  if (u) return u;
  if (SEARCH.test(ref)) return 'Recherche (' + ref.split('/')[0].replace(/^www\./, '') + ')';
  if (ref) return ref.split('/')[0].replace(/^www\./, '');
  return 'Direct';
}

export function sessions(list) {
  const m = new Map();
  for (const b of list) { let s = m.get(b.s); if (!s) m.set(b.s, s = { id: b.s, v: b.v, own: false, c: null, e: [] }); if (b.o) s.own = true; if (b.c) s.c = b.c; s.e.push(...b.e); }
  return [...m.values()].map(s => {
    s.e.sort((x, y) => x.a - y.a);
    const c = s.c || {}, pages = [], active = {};
    for (const x of s.e) { if (x.n === 'vue' && pages[pages.length - 1] !== x.p) pages.push(x.p); if (x.n === 'quitte' || x.n === 'actif') active[x.p] = Math.max(active[x.p] || 0, (x.d || {}).s || 0); }
    const has = (n, f) => s.e.some(x => x.n === n && (!f || f(x)));
    return {
      raw: s.e, id: s.id, visiteur: s.v, own: s.own, debut: new Date(s.e[0].a).toISOString(), fin: new Date(s.e[s.e.length - 1].a).toISOString(),
      secondes: Object.values(active).reduce((a, n) => a + n, 0), source: source(c), ref: c.ref || '', qs: c.qs || {},
      entree: c.lp || (s.e[0] || {}).p, pays: c.pays || '', ville: c.ville || '', appareil: c.kind || '', os: c.os || '', app: c.app || '', nouveau: c.neu === 1,
      pages, clics: s.e.filter(x => x.n === 'clic').length,
      pas: { jeuTouche: has('jeu', x => (x.d || {}).etat === 'touche'), jeuFini: has('jeu', x => (x.d || {}).etat === 'fin'),
        creer: pages.some(p => /^\/(save-the-date|creer)\//.test(p)), champ: has('champ', x => /^\/(save-the-date|creer)\//.test(x.p)),
        commander: has('commander'), paiement: has('paiement') },
      e: s.e.filter(x => x.n !== 'actif').map(x => ({ t: Math.round((x.a - s.e[0].a) / 1000), n: x.n, p: x.p, d: x.d }))
    };
  }).sort((a, b) => a.debut < b.debut ? 1 : -1);
}

const top = (rows, f, n = 12) => { const m = {}; for (const r of rows) { const k = f(r); if (k) m[k] = (m[k] || 0) + 1; } return Object.entries(m).map(([x, y]) => ({ x, y })).sort((a, b) => b.y - a.y).slice(0, n); };

// days : la période ; keep : combien de parcours détaillés renvoyer (les plus récents)
export async function visitData(days, keep = 0) {
  const all = sessions(await batches(days)), S = all.filter(s => !s.own);
  const ev = S.flatMap(s => s.e.map(x => Object.assign({ s: s.id }, x)));
  const vues = ev.filter(x => x.n === 'vue');
  const bounce = S.filter(s => s.pages.length <= 1 && !s.clics && s.secondes < 10).length;
  // défilement moyen et temps par page
  const pg = {}; for (const s of S) { const seen = {}; for (const x of s.raw) if (x.n === 'quitte' || x.n === 'actif') seen[x.p] = { s: Math.max((seen[x.p] || {}).s || 0, x.d.s || 0), max: Math.max((seen[x.p] || {}).max || 0, x.d.max || 0) };
    for (const [p, o] of Object.entries(seen)) { const g = pg[p] = pg[p] || { n: 0, s: 0, max: 0 }; g.n++; g.s += o.s; g.max += o.max; } }
  const series = {}; for (const s of S) { const d = s.debut.slice(0, 10); series[d] = (series[d] || 0) + 1; }
  const names = top(ev.filter(x => !['vue', 'clic', 'defile', 'quitte', 'champ', 'actif'].includes(x.n)), x => x.n === 'jeu' ? `jeu ${(x.d || {}).jeu || ''} : ${(x.d || {}).etat || ''}` : x.n, 20);
  const step = k => S.filter(s => s.pas[k]).length;
  return {
    maison: true, visitors: new Set(S.map(s => s.visiteur)).size, visits: S.length, pageviews: vues.length, bounces: bounce,
    totaltime: S.reduce((a, s) => a + s.secondes, 0), nouveaux: S.filter(s => s.nouveau).length, aNous: all.length - S.length,
    series: Object.entries(series).sort().map(([d, n]) => ({ d, n })),
    pages: top(vues, x => x.p), refs: top(S, s => s.source), entrees: top(S, s => s.entree), countries: top(S, s => s.pays), villes: top(S, s => s.ville),
    devices: top(S, s => s.appareil && `${s.appareil} (${s.os})`), events: names,
    clics: top(ev.filter(x => x.n === 'clic'), x => `${(x.d || {}).tx || '(sans mot)'} · ${x.p}`, 25),
    champs: top(ev.filter(x => x.n === 'champ'), x => `${x.d.f} · ${x.p}`, 15), erreurs: top(ev.filter(x => x.n === 'erreur'), x => `${x.d.m} (${x.d.f}:${x.d.l})`, 10),
    parPage: Object.entries(pg).map(([p, g]) => ({ p, n: g.n, s: Math.round(g.s / g.n), max: Math.round(g.max / g.n) })).sort((a, b) => b.n - a.n).slice(0, 15),
    tunnel: [['Visites', S.length], ['Ont touché le jeu', step('jeuTouche')], ['Jeu vu jusqu’au bout', step('jeuFini')], ['Page de création ouverte', step('creer')],
      ['Ont commencé à remplir', step('champ')], ['Ont cliqué Commander', step('commander')], ['Ont payé', step('paiement')]],
    parcours: keep ? all.slice(0, keep).map(({ raw, ...s }) => s) : undefined
  };
}
