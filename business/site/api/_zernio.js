// Dernier maillon de notre outil TikTok (19 novembre 2026). TikTok n'audite pas un outil qui publie sur ses propres
// comptes, et sans audit aucun post direct ne passe sur un compte public : l'envoi passe donc par Zernio (zernio.com),
// dont l'app TikTok est auditée. Tout le reste est à nous : la file, les heures, les fichiers servis sur /tm/<clé>, que
// Zernio va chercher par URL. Réglage Vercel : ZERNIO_API_KEY (jamais dans le dépôt). Sans cette clé, l'outil garde
// l'API de TikTok (brouillons seulement). Pour changer de service, c'est ce fichier qu'on remplace.
const API = process.env.ZERNIO_API || 'https://zernio.com/api/v1';
export const zernio = () => !!process.env.ZERNIO_API_KEY;

async function call(method, p, body) {
  const r = await fetch(API + p, { method, headers: { Authorization: 'Bearer ' + process.env.ZERNIO_API_KEY, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('zernio ' + r.status + ' : ' + (j.error && (j.error.message || j.error) || j.message || 'erreur'));
  return j;
}

// le compte TikTok relié chez Zernio (le premier actif)
export async function account() {
  const j = await call('GET', '/accounts');
  const a = (j.accounts || []).find(x => x.platform === 'tiktok' && x.isActive !== false);
  if (!a) throw new Error('aucun compte TikTok relié chez Zernio');
  return { id: a._id, username: a.username, connected_at: a.metadata && a.metadata.connectedAt };
}

// publie tout de suite (l'heure est gérée par notre file). Une vidéo ne sort qu'en public chez Zernio ; pour une autre
// audience, on passe par les brouillons de l'application.
export async function publish(item, urls) {
  const acc = await account();
  const photo = item.kind === 'photo', draft = item.mode === 'brouillon';
  const privacy = item.privacy || 'PUBLIC_TO_EVERYONE';
  if (!photo && !draft && privacy !== 'PUBLIC_TO_EVERYONE') throw new Error('une vidéo ne peut sortir qu’en public (ou en brouillon) par Zernio');
  const on = k => item[k] === undefined ? k === 'comment' : !!item[k];
  const tiktokSettings = {
    privacy_level: privacy, allow_comment: on('comment'), allow_duet: on('duet'), allow_stitch: on('stitch'),
    commercial_content_type: item.brand_content ? 'branded_content' : item.brand_organic ? 'brand_organic' : 'none',
    content_preview_confirmed: true, express_consent_given: true,
    media_type: photo ? 'photo' : 'video', auto_add_music: !!item.music, video_made_with_ai: !!item.aigc,
  };
  if (draft) tiktokSettings.draft = true;
  if (photo && item.caption) tiktokSettings.description = item.caption;
  const body = {
    content: photo ? (item.title || item.caption || '') : (item.caption || ''), publishNow: true,
    platforms: [{ platform: 'tiktok', accountId: acc.id }],
    mediaItems: urls.map(url => ({ type: photo ? 'image' : 'video', url })),
    tiktokSettings,
  };
  if (photo && item.title) body.title = item.title;
  const j = await call('POST', '/posts', body);
  const p = j.post || j;
  return { id: p._id || p.id, username: acc.username };
}

// état d'un post parti : publié, brouillon déposé, échec, ou encore en route
export async function check(id) {
  const j = await call('GET', '/posts/' + encodeURIComponent(id));
  const p = j.post || j, pl = (p.platforms || [])[0] || {};
  const st = String(pl.status || p.status || '');
  const out = { raw: st, url: pl.platformPostUrl || pl.postUrl || undefined };
  if (/^(published|success)/i.test(st)) out.status = 'ok';
  else if (/fail|error/i.test(st)) { out.status = 'echec'; out.error = pl.errorMessage || pl.error || p.errorMessage || p.error || st; if (typeof out.error !== 'string') out.error = JSON.stringify(out.error); }
  return out;
}

// les chiffres de chaque post du compte (vues, portée, likes, commentaires, partages, enregistrements, vu jusqu'au bout)
export async function stats() {
  // Zernio peut porter un autre compte TikTok que le nôtre (jusqu'à 2) : on ne garde que les posts du compte de l'outil
  const acc = await account();
  const j = await call('GET', '/analytics?limit=100&platform=tiktok&accountId=' + encodeURIComponent(acc.id));
  const ids = p => [p.accountId, p.account && (p.account._id || p.account.id || p.account), p.socialAccountId]
    .concat((p.platforms || []).map(x => x.accountId && (x.accountId._id || x.accountId)), (p.platformAnalytics || []).map(x => x.accountId))
    .filter(Boolean).map(String);
  const mine = p => { const l = ids(p); return !l.length || l.includes(String(acc.id)); };
  const posts = (j.posts || []).filter(mine).map(p => { const a = p.analytics || {}; return {
    at: p.publishedAt, text: String(p.content || '').slice(0, 90), views: a.views || 0, reach: a.reach || 0, likes: a.likes || 0,
    comments: a.comments || 0, shares: a.shares || 0, saves: a.saves || 0, completion: a.completionRate || 0,
    forYou: a.impressionSources ? a.impressionSources.forYou : undefined, updated: a.lastUpdated }; })
    .sort((x, y) => String(x.at) < String(y.at) ? -1 : 1);
  return { synced: j.overview && j.overview.lastSync, account: acc.username, posts };
}
