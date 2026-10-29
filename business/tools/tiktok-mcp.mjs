#!/usr/bin/env node
// Serveur MCP « tiktok » (stdio, sans dépendance) : les mêmes gestes que tiktok.mjs, offerts à Claude comme outils.
// Déclaré dans .mcp.json à la racine du dépôt ; a besoin de SCEAU_SECRET dans l'environnement.
import { api, schedule, line, statusText } from './tiktok-lib.mjs';
import { createInterface } from 'node:readline';

const TOOLS = [
  { name: 'tiktok_statut', description: 'État de notre TikTok : compte relié, visibilités possibles, file des posts.', inputSchema: { type: 'object', properties: {} } },
  { name: 'tiktok_connecter', description: 'Donne le lien à ouvrir (10 minutes) pour relier le compte TikTok de Save The Oui, une fois.', inputSchema: { type: 'object', properties: {} } },
  { name: 'tiktok_programmer', description: 'Programme un post TikTok à une date et une heure de Paris : un carrousel (dossier d’images, ou liste de fichiers) ou une vidéo (un .mp4). Publié automatiquement à l’heure dite.',
    inputSchema: { type: 'object', required: ['fichiers', 'date', 'legende'], properties: {
      fichiers: { type: 'string', description: 'Dossier d’images (ordre des numéros) ou fichiers séparés par des virgules, chemins relatifs au dépôt.' },
      date: { type: 'string', description: 'AAAA-MM-JJ' }, heure: { type: 'string', description: 'HH:MM, heure de Paris (12:00 par défaut)' },
      legende: { type: 'string', description: 'Légende, hashtags compris (4000 caractères pour un carrousel, 2200 pour une vidéo).' },
      titre: { type: 'string', description: 'Titre d’un carrousel (90 caractères au plus), facultatif.' },
      brouillon: { type: 'boolean', description: 'Déposer dans les brouillons de l’application TikTok au lieu de publier.' },
      prive: { type: 'boolean', description: 'Visible par le compte seulement (SELF_ONLY).' },
      ia: { type: 'boolean', description: 'Marquer « contenu généré par IA » (images des thèmes).' },
      musique: { type: 'boolean', description: 'Laisser TikTok ajouter une musique (carrousel).' } } } },
  { name: 'tiktok_publier_maintenant', description: 'Publie tout de suite un carrousel ou une vidéo (mêmes champs que tiktok_programmer, sans date).',
    inputSchema: { type: 'object', required: ['fichiers', 'legende'], properties: { fichiers: { type: 'string' }, legende: { type: 'string' }, titre: { type: 'string' }, brouillon: { type: 'boolean' }, prive: { type: 'boolean' }, ia: { type: 'boolean' }, musique: { type: 'boolean' } } } },
  { name: 'tiktok_liste', description: 'La file : posts prévus, envoyés, publiés, en échec.', inputSchema: { type: 'object', properties: {} } },
  { name: 'tiktok_publier', description: 'Publie tout de suite un post déjà dans la file (ou relance un post en échec).', inputSchema: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } } },
  { name: 'tiktok_retirer', description: 'Retire un post de la file.', inputSchema: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } } },
  { name: 'tiktok_verifier', description: 'Relit chez TikTok l’état des posts envoyés (ou d’un seul).', inputSchema: { type: 'object', properties: { id: { type: 'string' } } } },
];

async function call(name, a) {
  a = a || {};
  const files = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean);
  switch (name) {
    case 'tiktok_statut': return statusText(await api('status', {}));
    case 'tiktok_connecter': return 'Lien à ouvrir (valable 10 minutes) :\n' + (await api('connect')).url;
    case 'tiktok_programmer': case 'tiktok_publier_maintenant': {
      const r = await schedule({ files: files(a.fichiers), date: a.date, heure: a.heure, title: a.titre, caption: a.legende, brouillon: !!a.brouillon, prive: !!a.prive, ia: !!a.ia, musique: !!a.musique, now: name === 'tiktok_publier_maintenant' });
      return `${r.files.length} fichier(s) déposé(s).\n` + line(r.item) + (r.error ? '\nerreur : ' + r.error : '');
    }
    case 'tiktok_liste': { const { queue } = await api('list'); return queue.length ? queue.map(line).join('\n') : 'File vide.'; }
    case 'tiktok_publier': { const r = await api('now', { id: a.id }); return line(r.item) + (r.error ? '\nerreur : ' + r.error : ''); }
    case 'tiktok_retirer': return 'Retiré : ' + line((await api('remove', { id: a.id })).removed);
    case 'tiktok_verifier': { const r = await api('check', a.id ? { id: a.id } : {}); return (r.done.length ? r.done.map(d => `${d.id} → ${d.status}${d.tk ? ' (' + d.tk + ')' : ''}${d.error ? ' : ' + d.error : ''}`).join('\n') : 'Rien à vérifier.') + (r.error ? '\nerreur : ' + r.error : ''); }
    default: throw new Error('outil inconnu : ' + name);
  }
}

const send = m => process.stdout.write(JSON.stringify(m) + '\n');
const rl = createInterface({ input: process.stdin });
let chain = Promise.resolve(); // un appel après l'autre : une liste demandée juste après une programmation la voit
rl.on('line', l => { chain = chain.then(() => handle(l)).catch(() => {}); });
async function handle(l) {
  if (!l.trim()) return;
  let m; try { m = JSON.parse(l); } catch { return; }
  const { id, method, params } = m;
  if (id === undefined) return; // notification
  try {
    if (method === 'initialize') send({ jsonrpc: '2.0', id, result: { protocolVersion: params && params.protocolVersion || '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'tiktok-save-the-oui', version: '1.0.0' } } });
    else if (method === 'tools/list') send({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
    else if (method === 'tools/call') {
      try { send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: await call(params.name, params.arguments) }] } }); }
      catch (e) { send({ jsonrpc: '2.0', id, result: { isError: true, content: [{ type: 'text', text: 'Erreur : ' + (e.message || e) }] } }); }
    }
    else if (method === 'ping') send({ jsonrpc: '2.0', id, result: {} });
    else send({ jsonrpc: '2.0', id, error: { code: -32601, message: 'méthode inconnue : ' + method } });
  } catch (e) { send({ jsonrpc: '2.0', id, error: { code: -32603, message: String(e.message || e) } }); }
}
