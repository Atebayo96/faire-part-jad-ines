// Stockage des données (demandes de démo, réponses des invités).
// En ligne : Vercel Blob privé, région Paris (cdg1). En local (SCEAU_LOCAL=1) : fichiers dans /tmp/sceau-data.
import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const LOCAL = process.env.SCEAU_LOCAL === '1';
const DIR = '/tmp/sceau-data';
export const ready = () => LOCAL || !!process.env.BLOB_READ_WRITE_TOKEN;

export async function save(pathname, data) {
  const body = JSON.stringify(data);
  if (LOCAL) { const f = path.join(DIR, pathname); await fs.mkdir(path.dirname(f), { recursive: true }); await fs.writeFile(f, body); return; }
  const { put } = await import('@vercel/blob');
  await put(pathname, body, { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true });
}

export async function readOne(pathname) {
  if (LOCAL) { try { return JSON.parse(await fs.readFile(path.join(DIR, pathname), 'utf8')); } catch { return null; } }
  const { get } = await import('@vercel/blob');
  try { const g = await get(pathname, { access: 'private' }); return g ? JSON.parse(await new Response(g.stream).text()) : null; } catch { return null; }
}

export async function readAll(prefix) {
  if (LOCAL) {
    const d = path.join(DIR, prefix); let names = [];
    try { names = await fs.readdir(d); } catch { return []; }
    return Promise.all(names.map(async n => ({ pathname: prefix + n, ...JSON.parse(await fs.readFile(path.join(d, n), 'utf8')) })));
  }
  const { list, get } = await import('@vercel/blob');
  const out = []; let cursor;
  do {
    const r = await list({ prefix, cursor, limit: 1000 });
    const rows = await Promise.all(r.blobs.map(async b => {
      const g = await get(b.url, { access: 'private' });
      return g ? { pathname: b.pathname, ...JSON.parse(await new Response(g.stream).text()) } : null;
    }));
    out.push(...rows.filter(Boolean)); cursor = r.cursor;
  } while (cursor);
  return out;
}

export async function removeAll(prefix) {
  if (LOCAL) { await fs.rm(path.join(DIR, prefix), { recursive: true, force: true }); return; }
  const { list, del } = await import('@vercel/blob');
  let cursor;
  do { const r = await list({ prefix, cursor, limit: 1000 }); if (r.blobs.length) await del(r.blobs.map(b => b.url)); cursor = r.cursor; } while (cursor);
}

// Clé du tableau de bord d'un faire-part : HMAC du slug avec le secret du site.
export function dashKey(slug) {
  return createHmac('sha256', process.env.SCEAU_SECRET || 'dev-secret').update('dash:' + slug).digest('base64url').slice(0, 22);
}
export function same(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length === y.length && timingSafeEqual(x, y);
}
export const isAdmin = req => !!process.env.SCEAU_SECRET && same(bearer(req), process.env.SCEAU_SECRET);
export const bearer = req => (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
export const clean = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
export const id = () => new Date().toISOString().replace(/[:.]/g, '-') + '-' + Math.random().toString(36).slice(2, 8);
// Lien personnel d'un invité pour modifier sa réponse : identifiant + clé (seule l'empreinte de la clé est stockée).
export const newKey = () => randomBytes(12).toString('base64url');
export const keyHash = k => createHash('sha256').update('rsvp:' + String(k || '')).digest('base64url');
