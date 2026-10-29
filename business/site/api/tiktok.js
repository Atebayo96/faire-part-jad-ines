// Notre outil TikTok (voir _tiktok.js). Trois entrées :
//   GET  /tiktok/retour?code&state       retour de TikTok après l'autorisation (réécriture vers ?action=callback)
//   GET  /tm/<clé>                        une image ou une vidéo déposée chez nous, lue par TikTok (réécriture vers ?media=)
//   POST /api/tiktok  (Authorization: Bearer SCEAU_SECRET)  {op, …} : pour nous seulement (business/tools/tiktok.mjs, MCP)
//     connect → {url} ; status ; disconnect ; media {data} ou part/media-done (gros fichiers par morceaux) → {key, url} ;
//     add {kind, media, title, caption, at, mode, privacy, aigc, music} → {item} ; list ; remove {id} ; now {id} ; check {id?}
import { ready, isAdmin, clean, id as newId } from './_store.js';
import { configured, connectUrl, finishConnect, disconnect, accessToken, creatorInfo, queue, saveQueue, run, putBin, getBin, KEY, newKey, typeOf, TYPES, mediaUrl, redirectUri } from './_tiktok.js';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const page = (title, body) => `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>body{font:18px/1.5 Georgia,serif;max-width:560px;margin:12vh auto;padding:0 20px;color:#1e1a17}h1{font-weight:normal;font-size:28px}</style><h1>${esc(title)}</h1><p>${body}</p>`;

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // fichier servi à TikTok (clé imprévisible, un jour de cache)
    const key = String(req.query.media || '');
    if (key) {
      if (!KEY.test(key)) return res.status(400).send('clé');
      const buf = await getBin('tiktok/media/' + key);
      if (!buf) return res.status(404).send('introuvable');
      res.setHeader('Content-Type', typeOf(key)); res.setHeader('Content-Length', String(buf.length));
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.status(200).send(buf);
    }
    if (req.query.action === 'callback') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-store');
      if (req.query.error) return res.status(400).send(page('TikTok a refusé', esc(req.query.error_description || req.query.error) + '.'));
      try {
        const t = await finishConnect(req.query.code, req.query.state);
        return res.status(200).send(page('Compte TikTok relié', `Save The Oui peut publier sur <b>@${esc(t.username || t.open_id)}</b>. Vous pouvez fermer cette page.`));
      } catch (e) { return res.status(400).send(page('Connexion impossible', esc(e.message || e) + '.')); }
    }
    return res.status(401).json({ error: 'key' });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!isAdmin(req)) return res.status(401).json({ error: 'key' });
  if (!ready()) return res.status(503).json({ error: 'storage' });
  const b = req.body || {}, op = String(b.op || '');
  try {
    if (op === 'connect') return res.status(200).json({ url: await connectUrl(), redirect: redirectUri() });
    if (op === 'disconnect') { await disconnect(); return res.status(200).json({ ok: true }); }
    if (op === 'status') {
      const out = { configured: configured(), redirect: redirectUri(), connected: false };
      try {
        const t = await accessToken();
        if (t) {
          Object.assign(out, { connected: true, username: t.username, open_id: t.open_id, connected_at: t.connected_at, refresh_expires_at: new Date(t.refresh_expires_at).toISOString() });
          if (b.live) { const i = await creatorInfo(t); out.username = i.creator_username; out.privacy_options = i.privacy_level_options; out.max_video_sec = i.max_video_post_duration_sec; }
          else out.privacy_options = t.privacy_options;
        }
      } catch (e) { out.error = String(e.message || e); }
      const q = await queue();
      out.queue = { prevu: q.filter(i => i.status === 'prevu').length, envoye: q.filter(i => i.status === 'envoye').length, publie: q.filter(i => i.status === 'publie' || i.status === 'brouillon').length, echec: q.filter(i => i.status === 'echec').length };
      return res.status(200).json(out);
    }
    // dépôt d'un fichier : en une fois (≤ 3 Mo) ou par morceaux (part 0..n-1 puis media-done)
    if (op === 'media' || op === 'part') {
      const m = /^data:[\w/.+-]+;base64,([A-Za-z0-9+/=]+)$/.exec(String(b.data || ''));
      if (!m) return res.status(400).json({ error: 'data' });
      const buf = Buffer.from(m[1], 'base64');
      if (buf.length > 3 * 1024 * 1024) return res.status(413).json({ error: 'size' });
      if (op === 'part') {
        const up = String(b.upload || ''), n = Number(b.part);
        if (!/^[\w-]{6,60}$/.test(up) || !Number.isInteger(n) || n < 0 || n > 200) return res.status(400).json({ error: 'part' });
        await putBin(`tiktok/parts/${up}/${String(n).padStart(3, '0')}.bin`, buf, 'application/octet-stream');
        return res.status(200).json({ ok: true, part: n });
      }
      const ext = String(b.ext || 'jpg').toLowerCase();
      if (!TYPES[ext]) return res.status(400).json({ error: 'ext' });
      const key = newKey(ext);
      await putBin('tiktok/media/' + key, buf, TYPES[ext]);
      return res.status(200).json({ key, url: mediaUrl(key), size: buf.length });
    }
    if (op === 'media-done') {
      const up = String(b.upload || ''), n = Number(b.parts), ext = String(b.ext || 'mp4').toLowerCase();
      if (!/^[\w-]{6,60}$/.test(up) || !Number.isInteger(n) || n < 1 || n > 200 || !TYPES[ext]) return res.status(400).json({ error: 'parts' });
      const parts = [];
      for (let i = 0; i < n; i++) { const p = await getBin(`tiktok/parts/${up}/${String(i).padStart(3, '0')}.bin`); if (!p) return res.status(400).json({ error: 'part-' + i }); parts.push(p); }
      const buf = Buffer.concat(parts), key = newKey(ext);
      await putBin('tiktok/media/' + key, buf, TYPES[ext]);
      const { removeAll } = await import('./_store.js'); await removeAll(`tiktok/parts/${up}/`);
      return res.status(200).json({ key, url: mediaUrl(key), size: buf.length });
    }
    if (op === 'add') {
      const kind = b.kind === 'video' ? 'video' : 'photo';
      const media = Array.isArray(b.media) ? b.media.map(String).filter(k => KEY.test(k)) : [];
      if (!media.length || media.length > 35) return res.status(400).json({ error: 'media' });
      if (kind === 'video' && (media.length !== 1 || !typeOf(media[0]).startsWith('video/'))) return res.status(400).json({ error: 'video' });
      if (kind === 'photo' && media.some(k => !typeOf(k).startsWith('image/'))) return res.status(400).json({ error: 'photo' });
      const at = new Date(String(b.at || ''));
      if (Number.isNaN(at.getTime())) return res.status(400).json({ error: 'at' });
      const item = {
        id: newId(), kind, media, title: clean(b.title, 90), caption: clean(b.caption, kind === 'photo' ? 4000 : 2200),
        at: at.toISOString(), mode: b.mode === 'brouillon' ? 'brouillon' : 'direct',
        privacy: ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'FOLLOWER_OF_CREATOR', 'SELF_ONLY'].includes(b.privacy) ? b.privacy : 'PUBLIC_TO_EVERYONE',
        aigc: !!b.aigc, music: !!b.music, status: 'prevu', createdAt: new Date().toISOString(),
      };
      const q = await queue(); q.push(item); await saveQueue(q);
      return res.status(200).json({ item });
    }
    if (op === 'list') return res.status(200).json({ queue: (await queue()).sort((a, c) => a.at < c.at ? -1 : 1) });
    if (op === 'remove') {
      const q = await queue(), i = q.findIndex(x => x.id === b.id);
      if (i < 0) return res.status(404).json({ error: 'id' });
      const [gone] = q.splice(i, 1); await saveQueue(q);
      return res.status(200).json({ removed: gone });
    }
    if (op === 'now') {
      const q = await queue(), it = q.find(x => x.id === b.id);
      if (!it) return res.status(404).json({ error: 'id' });
      if (it.status === 'echec') { it.status = 'prevu'; it.error = undefined; await saveQueue(q); }
      else if (it.status !== 'prevu') return res.status(409).json({ error: 'status', status: it.status });
      const r = await run([it.id]);
      return res.status(200).json({ done: r.done, item: r.queue.find(x => x.id === it.id), error: r.error });
    }
    if (op === 'check') {
      const r = await run(b.id ? [String(b.id)] : (await queue()).filter(i => i.status === 'envoye').map(i => i.id));
      return res.status(200).json({ done: r.done, error: r.error, queue: r.queue.sort((a, c) => a.at < c.at ? -1 : 1) });
    }
    return res.status(400).json({ error: 'op' });
  } catch (e) { return res.status(500).json({ error: String(e.message || e) }); }
}
