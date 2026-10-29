// Côté Claude : parle à notre API TikTok (business/landing/api/tiktok.js). Partagé par la ligne de commande
// (tiktok.mjs) et le serveur MCP (tiktok-mcp.mjs). Réglages : SCEAU_SECRET (obligatoire), SCEAU_SITE_URL (par défaut
// https://savetheoui.fr). Les fichiers (images d'un carrousel, vidéo) sont lus sur le disque et déposés chez nous.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

export const SITE = (process.env.SCEAU_SITE_URL || 'https://savetheoui.fr').replace(/\/$/, '');
const CHUNK = 3 * 1024 * 1024;
const EXT = { '.jpg': 'jpg', '.jpeg': 'jpg', '.png': 'png', '.webp': 'webp', '.mp4': 'mp4', '.mov': 'mov', '.webm': 'webm' };
const IMG = new Set(['jpg', 'png', 'webp']);

export async function api(op, body) {
  if (!process.env.SCEAU_SECRET) throw new Error('SCEAU_SECRET manquant dans l’environnement (la clé du site, la même que sur Vercel)');
  const r = await fetch(SITE + '/api/tiktok', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.SCEAU_SECRET }, body: JSON.stringify(Object.assign({ op }, body || {})) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${op} : ${j.error || r.status}${j.status ? ' (' + j.status + ')' : ''}`);
  return j;
}

// un dossier (toutes ses images, dans l'ordre des numéros) ou une liste de fichiers → {kind, files}
export async function resolveFiles(args) {
  const files = [];
  for (const a of args) {
    const st = await fs.stat(a).catch(() => null);
    if (!st) throw new Error('introuvable : ' + a);
    if (st.isDirectory()) {
      const names = (await fs.readdir(a)).filter(n => EXT[path.extname(n).toLowerCase()]);
      names.sort((x, y) => x.localeCompare(y, 'fr', { numeric: true }));
      files.push(...names.map(n => path.join(a, n)));
    } else files.push(a);
  }
  if (!files.length) throw new Error('aucun fichier');
  const exts = files.map(f => { const e = EXT[path.extname(f).toLowerCase()]; if (!e) throw new Error('format inconnu : ' + f); return e; });
  const kind = IMG.has(exts[0]) ? 'photo' : 'video';
  if (kind === 'video' && files.length !== 1) throw new Error('une vidéo = un seul fichier');
  if (kind === 'photo' && exts.some(e => !IMG.has(e))) throw new Error('un carrousel ne contient que des images');
  if (files.length > 35) throw new Error('35 images au plus');
  return { kind, files, exts };
}

export async function upload(file, ext) {
  const buf = await fs.readFile(file);
  if (buf.length <= CHUNK) return (await api('media', { ext, data: `data:${IMG.has(ext) ? 'image' : 'video'}/${ext};base64,` + buf.toString('base64') })).key;
  const up = randomBytes(9).toString('base64url'), n = Math.ceil(buf.length / CHUNK);
  for (let i = 0; i < n; i++) await api('part', { upload: up, part: i, data: 'data:application/octet-stream;base64,' + buf.subarray(i * CHUNK, (i + 1) * CHUNK).toString('base64') });
  return (await api('media-done', { upload: up, parts: n, ext })).key;
}

// heure de Paris → instant ISO ('2026-11-02', '12:00')
export function parisToIso(date, heure) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || ''), h = /^(\d{1,2})[:h](\d{2})?$/.exec(heure || '12:00');
  if (!m || !h) throw new Error('date au format 2026-11-02 et heure au format 12:00');
  const wall = Date.UTC(+m[1], +m[2] - 1, +m[3], +h[1], +(h[2] || 0));
  let t = wall;
  for (let i = 0; i < 2; i++) t = wall - parisOffset(t);
  return new Date(t).toISOString();
}
function parisOffset(t) {
  const p = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(t));
  const g = k => Number(p.find(x => x.type === k).value);
  return Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute')) - Math.floor(t / 60000) * 60000;
}
export const paris = iso => new Date(iso).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// programme (ou publie tout de suite) un post : dépose les fichiers, puis l'ajoute à la file
export async function schedule(o) {
  const { kind, files, exts } = await resolveFiles(o.files);
  const media = [];
  for (let i = 0; i < files.length; i++) media.push(await upload(files[i], exts[i]));
  const at = o.now ? new Date().toISOString() : parisToIso(o.date, o.heure);
  const { item } = await api('add', { kind, media, title: o.title || '', caption: o.caption || '', at, mode: o.brouillon ? 'brouillon' : 'direct', privacy: o.prive ? 'SELF_ONLY' : 'PUBLIC_TO_EVERYONE', aigc: !!o.ia, music: !!o.musique });
  if (!o.now) return { item, files };
  const r = await api('now', { id: item.id });
  return { item: r.item, files, done: r.done, error: r.error };
}

const ST = { prevu: 'prévu', envoye: 'envoyé à TikTok', publie: 'publié', brouillon: 'dans les brouillons de l’app', echec: 'échec' };
export function line(i) {
  const s = ST[i.status] || i.status;
  return `${i.id}  ${paris(i.at)}  ${i.kind === 'photo' ? i.media.length + ' image' + (i.media.length > 1 ? 's' : '') : 'vidéo'}  ${i.mode === 'brouillon' ? 'brouillon' : i.privacy === 'SELF_ONLY' ? 'privé' : 'public'}  [${s}]` +
    (i.title ? `  « ${i.title} »` : i.caption ? `  « ${i.caption.slice(0, 60)}${i.caption.length > 60 ? '…' : ''} »` : '') +
    (i.error ? `\n    erreur : ${i.error}` : '') + (i.note ? `\n    note : ${i.note}` : '') + (i.post_id ? `\n    post : ${i.post_id}` : '');
}
export function statusText(s) {
  const out = [];
  if (!s.configured) out.push('App TikTok non réglée sur Vercel : TIKTOK_CLIENT_KEY et TIKTOK_CLIENT_SECRET manquent.');
  out.push(s.connected ? `Compte relié : @${s.username || s.open_id} (depuis le ${new Date(s.connected_at).toLocaleDateString('fr-FR')}, à renouveler avant le ${new Date(s.refresh_expires_at).toLocaleDateString('fr-FR')}).` : 'Aucun compte TikTok relié.');
  if (s.privacy_options) out.push(s.privacy_options.includes('PUBLIC_TO_EVERYONE') ? 'Publication publique possible.' : `Visibilités possibles : ${s.privacy_options.join(', ')} (app pas encore auditée, ou compte privé : les posts directs seront privés).`);
  if (s.error) out.push('Erreur : ' + s.error);
  if (s.queue) out.push(`File : ${s.queue.prevu} prévu(s), ${s.queue.envoye} envoyé(s), ${s.queue.publie} publié(s), ${s.queue.echec} en échec.`);
  out.push('Retour OAuth à déclarer dans l’app TikTok : ' + s.redirect);
  return out.join('\n');
}
