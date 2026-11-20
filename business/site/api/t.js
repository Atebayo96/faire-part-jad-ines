// POST /api/t : un paquet d'événements d'une visite (mesure.js). On range le paquet tel quel dans le stockage privé,
// `visites/<jour>/<visite>-<n°>-<hasard>.json`, avec ce que la requête dit de l'appareil : le pays et la ville (en-têtes
// de Vercel), le type d'appareil et l'application qui a ouvert la page (TikTok, Instagram… : leur navigateur interne
// n'envoie souvent aucune provenance). Ni adresse IP ni en-tête complet gardés. Les robots sont écartés.
import { save, ready, clean } from './_store.js';

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|curl|wget|python|scrapy|monitor|preview/i;
const ID = /^[a-z0-9]{8,24}$/, NAME = /^[a-z_]{2,20}$/;

function device(ua) {
  const app = /musical_ly|bytedance|tiktok/i.test(ua) ? 'tiktok' : /instagram/i.test(ua) ? 'instagram' : /FBAN|FBAV|FB_IAB/.test(ua) ? 'facebook'
    : /snapchat/i.test(ua) ? 'snapchat' : /pinterest/i.test(ua) ? 'pinterest' : /whatsapp/i.test(ua) ? 'whatsapp' : '';
  const os = /iPhone|iPod/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Macintosh/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'autre';
  const kind = /iPhone|iPod|Android.*Mobile/.test(ua) ? 'téléphone' : /iPad|Android/.test(ua) ? 'tablette' : 'ordinateur';
  return { app, os, kind };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const ua = String(req.headers['user-agent'] || ''), b = req.body && typeof req.body === 'object' ? req.body : {};
  if (!ready() || !ua || BOT.test(ua) || !ID.test(b.s) || !ID.test(b.v) || !Array.isArray(b.e) || !b.e.length) return res.status(204).end();
  const e = [];
  for (const x of b.e.slice(0, 60)) {
    if (!x || !NAME.test(x.n) || typeof x.a !== 'number') continue;
    const o = { a: x.a, n: x.n, p: clean(x.p, 120) };
    if (x.d && typeof x.d === 'object') { const s = JSON.stringify(x.d); if (s.length <= 500) o.d = JSON.parse(clean(s, 500)); }
    e.push(o);
  }
  if (!e.length) return res.status(204).end();
  const now = new Date(), day = now.toISOString().slice(0, 10), n = Math.max(0, Math.min(9999, b.q | 0));
  const rec = { s: b.s, v: b.v, q: n, at: now.toISOString(), e };
  if (b.o) rec.o = 1;
  if (b.c && typeof b.c === 'object') {
    const s = JSON.stringify(b.c);
    if (s.length <= 900) {
      let city = ''; try { city = decodeURIComponent(String(req.headers['x-vercel-ip-city'] || '')); } catch { }
      rec.c = Object.assign(JSON.parse(clean(s, 900)), device(ua), { pays: clean(req.headers['x-vercel-ip-country'], 4), ville: clean(city, 40) });
    }
  }
  try { await save(`visites/${day}/${b.s}-${String(n).padStart(4, '0')}-${Math.random().toString(36).slice(2, 6)}.json`, rec); } catch { }
  res.status(204).end();
}
