#!/usr/bin/env node
// Notre TikTok en ligne de commande (SCEAU_SECRET dans l'environnement ; SCEAU_SITE_URL pour un autre site).
//   node business/tools/tiktok.mjs statut
//   node business/tools/tiktok.mjs connecter                      → un lien à ouvrir, une fois, pour relier le compte
//   node business/tools/tiktok.mjs programmer <dossier|fichiers…> --date 2026-11-02 --heure 12:00 --legende "…" [--titre "…"]
//                                   [--brouillon] [--prive] [--ia] [--musique] [--maintenant]
//   node business/tools/tiktok.mjs liste
//   node business/tools/tiktok.mjs publier <id>                   → tout de suite, sans attendre l'heure
//   node business/tools/tiktok.mjs retirer <id>
//   node business/tools/tiktok.mjs verifier [id]                  → relit l'état chez TikTok
//   node business/tools/tiktok.mjs deconnecter
import { api, schedule, line, statusText } from './tiktok-lib.mjs';

const argv = process.argv.slice(2), cmd = argv.shift();
const opt = {}, pos = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) { const k = a.slice(2); const v = argv[i + 1]; if (v !== undefined && !v.startsWith('--')) { opt[k] = v; i++; } else opt[k] = true; }
  else pos.push(a);
}
const out = s => process.stdout.write(s + '\n');

try {
  if (cmd === 'statut') out(statusText(await api('status', { live: !!opt.live })));
  else if (cmd === 'connecter') { const r = await api('connect'); out('Ouvrez ce lien (valable 10 minutes) et autorisez Save The Oui :\n' + r.url); }
  else if (cmd === 'deconnecter') { await api('disconnect'); out('Compte TikTok détaché.'); }
  else if (cmd === 'programmer') {
    if (!pos.length) throw new Error('indiquez un dossier ou des fichiers');
    const r = await schedule({ files: pos, date: opt.date, heure: opt.heure, title: opt.titre, caption: opt.legende, brouillon: !!opt.brouillon, prive: !!opt.prive, ia: !!opt.ia, musique: !!opt.musique, now: !!opt.maintenant });
    out(`${r.files.length} fichier(s) déposé(s).\n` + line(r.item) + (r.error ? '\nerreur : ' + r.error : ''));
  }
  else if (cmd === 'liste') { const { queue } = await api('list'); out(queue.length ? queue.map(line).join('\n') : 'File vide.'); }
  else if (cmd === 'publier') { const r = await api('now', { id: pos[0] }); out(line(r.item) + (r.error ? '\nerreur : ' + r.error : '')); }
  else if (cmd === 'retirer') { const r = await api('remove', { id: pos[0] }); out('Retiré : ' + line(r.removed)); }
  else if (cmd === 'verifier') { const r = await api('check', pos[0] ? { id: pos[0] } : {}); out((r.done.length ? r.done.map(d => `${d.id} → ${d.status}${d.tk ? ' (' + d.tk + ')' : ''}${d.error ? ' : ' + d.error : ''}`).join('\n') : 'Rien à vérifier.') + (r.error ? '\nerreur : ' + r.error : '')); }
  else { out('Commandes : statut | connecter | programmer | liste | publier | retirer | verifier | deconnecter'); process.exit(cmd ? 1 : 0); }
} catch (e) { process.stderr.write('Erreur : ' + (e.message || e) + '\n'); process.exit(1); }
