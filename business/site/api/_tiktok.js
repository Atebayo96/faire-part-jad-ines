// TikTok à nous (29 octobre 2026 : « je veux pas passer par Higgsfield, je veux faire le nôtre », « un truc très simple qui
// permet de publier quand on veut »). Ce module parle à l'API officielle de TikTok (Login Kit + Content Posting API) :
// connexion du compte (OAuth, une fois), jetons gardés dans le stockage privé, images et vidéos déposées chez nous et
// servies sur /tm/<clé> (TikTok va les chercher par URL : le domaine doit être vérifié dans l'app TikTok), file de posts
// (tiktok/queue.json) publiée à l'heure par le cron (api/tiktok-cron.js) ou tout de suite (api/tiktok.js, op « now »).
// Réglages Vercel : TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET (app développeur TikTok, jamais dans le dépôt).
// Tant que l'app n'est pas auditée par TikTok, un post direct ne peut être que privé (SELF_ONLY) : on le note sur le post.
import { save, readOne, removeAll } from './_store.js';
import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import META from './_meta.js';

const LOCAL = process.env.SCEAU_LOCAL === '1', DIR = '/tmp/sceau-data';
// surchargeables pour la recette locale (faux TikTok)
const API = process.env.TIKTOK_API || 'https://open.tiktokapis.com';
const AUTH = process.env.TIKTOK_AUTH || 'https://www.tiktok.com/v2/auth/authorize/';
const SCOPES = 'user.info.basic,video.publish,video.upload';

export const site = () => process.env.SCEAU_SITE_URL || META.site;
export const configured = () => !!(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
export const redirectUri = () => site() + '/tiktok/retour';
export const mediaUrl = key => `${site()}/tm/${key}`;

// ---- fichiers binaires (images des carrousels, vidéos) : Blob privé, servis publiquement par /tm/<clé> (clé imprévisible)
export const TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm' };
export const typeOf = key => TYPES[String(key).split('.').pop().toLowerCase()] || null;
export const KEY = /^[\w-]{8,60}\.(jpg|jpeg|png|webp|mp4|mov|webm)$/;
export const newKey = ext => randomBytes(12).toString('base64url') + '.' + ext;

export async function putBin(pathname, buf, contentType) {
  if (LOCAL) { const f = path.join(DIR, pathname); await fs.mkdir(path.dirname(f), { recursive: true }); await fs.writeFile(f, buf); return; }
  const { put } = await import('@vercel/blob');
  await put(pathname, buf, { access: 'private', contentType, addRandomSuffix: false, allowOverwrite: true });
}
export async function getBin(pathname) {
  if (LOCAL) { try { return await fs.readFile(path.join(DIR, pathname)); } catch { return null; } }
  const { get } = await import('@vercel/blob');
  try { const g = await get(pathname, { access: 'private', useCache: false }); return g ? Buffer.from(await new Response(g.stream).arrayBuffer()) : null; } catch { return null; }
}

// ---- connexion du compte (OAuth web : pas de PKCE, le secret reste côté serveur ; l'état protège le retour)
export async function connectUrl() {
  if (!configured()) throw new Error('config');
  const state = randomBytes(16).toString('base64url');
  await save(`tiktok/oauth/${state}.json`, { at: Date.now() });
  const q = new URLSearchParams({ client_key: process.env.TIKTOK_CLIENT_KEY, scope: SCOPES, response_type: 'code', redirect_uri: redirectUri(), state });
  return AUTH + '?' + q;
}

async function tokenCall(form) {
  const r = await fetch(API + '/v2/oauth/token/', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(Object.assign({ client_key: process.env.TIKTOK_CLIENT_KEY, client_secret: process.env.TIKTOK_CLIENT_SECRET }, form)),
  });
  const j = await r.json().catch(() => ({}));
  if (!j.access_token) throw new Error('jeton : ' + (j.error_description || j.error || ('http ' + r.status)));
  return j;
}

export async function finishConnect(code, state) {
  const ok = /^[\w-]{16,40}$/.test(String(state || '')) && await readOne(`tiktok/oauth/${state}.json`);
  if (!ok || Date.now() - ok.at > 10 * 60e3) throw new Error('lien expiré, relancez la connexion');
  await removeAll(`tiktok/oauth/${state}.json`);
  const j = await tokenCall({ grant_type: 'authorization_code', code: String(code || ''), redirect_uri: redirectUri() });
  const t = {
    access_token: j.access_token, refresh_token: j.refresh_token, open_id: j.open_id, scope: j.scope,
    expires_at: Date.now() + (j.expires_in || 86400) * 1000, refresh_expires_at: Date.now() + (j.refresh_expires_in || 365 * 86400) * 1000,
    connected_at: new Date().toISOString(),
  };
  try { const info = await creatorInfo(t); t.username = info.creator_username; t.nickname = info.creator_nickname; t.privacy_options = info.privacy_level_options; } catch (e) { t.warning = String(e.message || e); }
  await save('tiktok/token.json', t);
  return t;
}

export const disconnect = () => removeAll('tiktok/token.json');

// jeton d'accès valable (24 h), rafraîchi avec le jeton de rafraîchissement (365 jours) quand il expire
export async function accessToken() {
  const t = await readOne('tiktok/token.json');
  if (!t) return null;
  if (Date.now() < t.expires_at - 5 * 60e3) return t;
  if (Date.now() > t.refresh_expires_at) throw new Error('la connexion TikTok a expiré : reconnectez le compte');
  const j = await tokenCall({ grant_type: 'refresh_token', refresh_token: t.refresh_token });
  const n = Object.assign({}, t, {
    access_token: j.access_token, refresh_token: j.refresh_token || t.refresh_token,
    expires_at: Date.now() + (j.expires_in || 86400) * 1000,
    refresh_expires_at: j.refresh_expires_in ? Date.now() + j.refresh_expires_in * 1000 : t.refresh_expires_at,
  });
  await save('tiktok/token.json', n);
  return n;
}

// ---- appels à l'API (6 par minute et par jeton)
async function tk(tok, p, body) {
  const r = await fetch(API + p, { method: 'POST', headers: { Authorization: 'Bearer ' + tok.access_token, 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(body || {}) });
  const j = await r.json().catch(() => ({}));
  if (!j.error || j.error.code !== 'ok') throw new Error(j.error ? j.error.code + (j.error.message ? ' : ' + j.error.message : '') : 'http ' + r.status);
  return j.data || {};
}
export const creatorInfo = tok => tk(tok, '/v2/post/publish/creator_info/query/');

// ---- la file
export const queue = async () => (await readOne('tiktok/queue.json')) || [];
export const saveQueue = q => save('tiktok/queue.json', q);

// publie un post : carrousel photo (jusqu'à 35 images) ou vidéo ; direct (en ligne tout de suite, visibilité choisie) ou
// brouillon (déposé dans l'application TikTok, à finir là-bas). Les fichiers sont tirés par TikTok depuis /tm/<clé>.
export async function publishItem(item, tok) {
  const info = await creatorInfo(tok);
  const urls = item.media.map(mediaUrl);
  const direct = item.mode !== 'brouillon';
  let privacy = item.privacy || 'PUBLIC_TO_EVERYONE';
  const opts = info.privacy_level_options || [];
  if (direct && opts.length && !opts.includes(privacy)) {
    const fallback = opts.includes('SELF_ONLY') ? 'SELF_ONLY' : opts[0];
    item.note = `publié en ${fallback} : le compte ne propose pas ${privacy} (app TikTok pas encore auditée, ou compte privé)`;
    privacy = fallback;
  }
  // interactions et contenu commercial : choisis dans la page (/admin/tiktok/, règles de TikTok : tout décoché par défaut) ;
  // depuis la ligne de commande, les commentaires restent ouverts
  const no = k => item[k] === undefined ? k !== 'comment' : !item[k];
  const brand = { brand_content_toggle: !!item.brand_content, brand_organic_toggle: !!item.brand_organic };
  let d;
  if (item.kind === 'photo') {
    const post_info = { title: item.title || '', description: item.caption || '' };
    if (direct) Object.assign(post_info, { privacy_level: privacy, disable_comment: no('comment') || !!info.comment_disabled, auto_add_music: !!item.music }, brand);
    d = await tk(tok, '/v2/post/publish/content/init/', {
      post_info, source_info: { source: 'PULL_FROM_URL', photo_images: urls, photo_cover_index: 0 },
      post_mode: direct ? 'DIRECT_POST' : 'MEDIA_UPLOAD', media_type: 'PHOTO', is_aigc: !!item.aigc,
    });
  } else {
    const source_info = { source: 'PULL_FROM_URL', video_url: urls[0] };
    d = direct
      ? await tk(tok, '/v2/post/publish/video/init/', { post_info: Object.assign({ title: item.caption || '', privacy_level: privacy, disable_duet: no('duet') || !!info.duet_disabled, disable_comment: no('comment') || !!info.comment_disabled, disable_stitch: no('stitch') || !!info.stitch_disabled, is_aigc: !!item.aigc }, brand), source_info })
      : await tk(tok, '/v2/post/publish/inbox/video/init/', { source_info });
  }
  Object.assign(item, { publish_id: d.publish_id, status: 'envoye', sentAt: new Date().toISOString(), username: info.creator_username, error: undefined });
  if (direct) item.privacy = privacy;
  return item;
}

// état d'un post envoyé : TikTok le télécharge, puis le publie (ou le dépose dans l'application pour un brouillon)
export async function checkItem(item, tok) {
  const d = await tk(tok, '/v2/post/publish/status/fetch/', { publish_id: item.publish_id });
  item.tk_status = d.status; item.checkedAt = new Date().toISOString();
  if (d.status === 'PUBLISH_COMPLETE') { item.status = 'publie'; item.post_id = Array.isArray(d.publicaly_available_post_id) ? d.publicaly_available_post_id[0] : d.publicaly_available_post_id; }
  else if (d.status === 'SEND_TO_USER_INBOX') item.status = 'brouillon';
  else if (d.status === 'FAILED') { item.status = 'echec'; item.error = d.fail_reason || 'FAILED'; }
  return item;
}

// le cron et « publier maintenant » : publie ce qui est dû, vérifie ce qui est parti. `ids` limite à certains posts (et
// les publie même si leur heure n'est pas venue).
export async function run(ids) {
  const q = await queue();
  const now = Date.now(), done = [];
  const pick = i => !ids || ids.includes(i.id);
  const todo = q.filter(i => pick(i) && (i.status === 'prevu' && (ids || new Date(i.at).getTime() <= now) || i.status === 'envoye'));
  if (!todo.length) return { done, queue: q };
  let tok;
  try { tok = await accessToken(); } catch (e) { for (const i of todo) if (i.status === 'prevu') { i.status = 'echec'; i.error = String(e.message || e); } await saveQueue(q); return { done, queue: q, error: String(e.message || e) }; }
  if (!tok) return { done, queue: q, error: 'compte TikTok non relié' };
  for (const i of todo) {
    try {
      if (i.status === 'prevu') { await publishItem(i, tok); done.push({ id: i.id, status: i.status }); }
      else if (i.status === 'envoye' && i.publish_id) { await checkItem(i, tok); done.push({ id: i.id, status: i.status, tk: i.tk_status }); }
    } catch (e) { i.status = 'echec'; i.error = String(e.message || e); i.tries = (i.tries || 0) + 1; done.push({ id: i.id, status: 'echec', error: i.error }); }
  }
  await saveQueue(q);
  return { done, queue: q };
}
