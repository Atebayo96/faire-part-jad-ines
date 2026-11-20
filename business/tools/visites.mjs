#!/usr/bin/env node
// Les visites du site, lues dans notre mesure (landing/mesure.js → api/t.js → api/visites.js).
//   node business/tools/visites.mjs                 → les chiffres des 7 derniers jours
//   node business/tools/visites.mjs --jours 30
//   node business/tools/visites.mjs --parcours 20   → en plus, les 20 derniers parcours, action par action
//   node business/tools/visites.mjs --json          → tout, brut
// Clé : ADMIN_KEY, TIKTOK_ADMIN_KEY ou SCEAU_SECRET ; dans une session Claude, l'accès à savetheoui.fr est posé par l'environnement.
const a = process.argv.slice(2), opt = k => { const i = a.indexOf('--' + k); return i < 0 ? null : (a[i + 1] && !a[i + 1].startsWith('--') ? a[i + 1] : true); };
const SITE = (process.env.SCEAU_SITE_URL || 'https://savetheoui.fr').replace(/\/$/, '');
const key = process.env.ADMIN_KEY || process.env.TIKTOK_ADMIN_KEY || process.env.SCEAU_SECRET || 'session';
const days = +opt('jours') || 7, keep = opt('parcours') === true ? 20 : +opt('parcours') || 0;
const r = await fetch(`${SITE}/api/visites?days=${days}&parcours=${opt('json') ? Math.max(keep, 200) : keep}`, { headers: { Authorization: 'Bearer ' + key } });
if (!r.ok) { console.error('Lecture impossible : ' + r.status + ' ' + (await r.text()).slice(0, 200)); process.exit(1); }
const U = await r.json();
if (opt('json')) { console.log(JSON.stringify(U, null, 1)); process.exit(0); }
const out = s => console.log(s), pct = (x, y) => y ? Math.round(x / y * 100) + ' %' : '—';
const list = (t, rows, n = 10) => { if (!rows || !rows.length) return; out('\n' + t); for (const x of rows.slice(0, n)) out('  ' + String(x.y).padStart(5) + '  ' + x.x); };
out(`${days} derniers jours : ${U.visits} visites, ${U.visitors} visiteurs (${U.nouveaux} nouveaux), ${U.pageviews} pages vues`);
out(`Rebond ${pct(U.bounces, U.visits)} · ${U.visits ? Math.round(U.totaltime / U.visits) : 0} s actives par visite${U.aNous ? ' · ' + U.aNous + ' visites à nous, hors chiffres' : ''}`);
out('\nPar jour : ' + U.series.map(p => p.d.slice(5) + ' ' + p.n).join(' · '));
out('\nTunnel'); for (const [l, n] of U.tunnel) out('  ' + String(n).padStart(5) + '  ' + l + '  (' + pct(n, U.tunnel[0][1]) + ')');
list('Provenance', U.refs); list('Page d’arrivée', U.entrees); list('Pages vues', U.pages); list('Appareils', U.devices); list('Pays', U.countries, 6); list('Villes', U.villes, 8);
list('Clics', U.clics, 25); list('Événements', U.events, 20); list('Champs touchés', U.champs, 15); list('Erreurs', U.erreurs);
if (U.parPage.length) { out('\nPar page (visites, secondes actives, % de la page vu)'); for (const p of U.parPage) out(`  ${String(p.n).padStart(5)}  ${String(p.s).padStart(4)} s  ${String(p.max).padStart(3)} %  ${p.p}`); }
for (const s of U.parcours || []) {
  out(`\n— ${s.debut.slice(0, 16).replace('T', ' ')} · ${s.source} · ${s.appareil} ${s.os} · ${[s.ville, s.pays].filter(Boolean).join(', ')} · ${s.secondes} s${s.nouveau ? '' : ' · déjà venu'}${s.own ? ' · à nous' : ''}`);
  for (const x of s.e) { const d = x.d || {}; const w = x.n === 'vue' ? 'ouvre ' + x.p : x.n === 'clic' ? `clique « ${d.tx || ''} »${d.to ? ' → ' + d.to : ''}` : x.n === 'defile' ? `défile ${d.pct} %` : x.n === 'quitte' ? `quitte (${d.s} s, ${d.max} %)` : x.n === 'champ' ? 'champ ' + d.f : x.n === 'jeu' ? `jeu ${d.jeu} ${d.theme || ''} : ${d.etat}` : x.n + ' ' + JSON.stringify(d);
    out(`   ${String(x.t).padStart(4)} s  ${w}`); }
}
