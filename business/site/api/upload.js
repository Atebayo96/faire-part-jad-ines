// Photos d'un lieu, envoyées depuis le configurateur (« Parlez-nous de votre lieu ») : elles servent à peindre la chaîne
// du faire-part après la commande. L'image est réduite dans le navigateur (1600 px, JPEG) avant l'envoi.
// POST /api/upload {data: 'data:image/jpeg;base64,…'} -> {id}
// GET  /api/upload?id=… (Authorization: Bearer <SCEAU_SECRET>) : l'image, pour nous seulement.
import { ready, isAdmin, id as newId } from './_store.js';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const LOCAL = process.env.SCEAU_LOCAL === '1', DIR = '/tmp/sceau-data/uploads';
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String((req.body || {}).data || ''));
    if (!m) return res.status(400).json({ error: 'image' });
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 3 * 1024 * 1024) return res.status(413).json({ error: 'size' });
    if (!ready()) return res.status(503).json({ error: 'storage' });
    const key = newId() + '.' + (m[1] === 'jpeg' ? 'jpg' : m[1]);
    if (LOCAL) { await fs.mkdir(DIR, { recursive: true }); await fs.writeFile(path.join(DIR, key), buf); }
    else { const { put } = await import('@vercel/blob'); await put('uploads/' + key, buf, { access: 'private', contentType: 'image/' + m[1], addRandomSuffix: false }); }
    return res.status(200).json({ id: key });
  }
  if (req.method === 'GET') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'key' });
    const key = String(req.query.id || '');
    if (!/^[\w-]{6,80}\.(jpg|png|webp)$/.test(key)) return res.status(400).json({ error: 'id' });
    let buf = null;
    if (LOCAL) { try { buf = await fs.readFile(path.join(DIR, key)); } catch { buf = null; } }
    else { const { get } = await import('@vercel/blob'); try { const g = await get('uploads/' + key, { access: 'private' }); buf = g ? Buffer.from(await new Response(g.stream).arrayBuffer()) : null; } catch { buf = null; } }
    if (!buf) return res.status(404).json({ error: 'id' });
    res.setHeader('Content-Type', key.endsWith('.png') ? 'image/png' : key.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
    return res.status(200).send(buf);
  }
  res.status(405).json({ error: 'method' });
}
