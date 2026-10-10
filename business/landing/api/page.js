// GET /d/<slug>/ d'un faire-part commandé en ligne (vercel.json : réécrit vers /api/page?s=<slug> quand aucun fichier
// du build ne correspond). Même page que celles de build-site.py (PAGE), la fiche venant du stockage (fiches/<slug>.json).
import { readOne, ready } from './_store.js';
import META from './_meta.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MONTHS = 'janvier février mars avril mai juin juillet août septembre octobre novembre décembre'.split(' ');
const dateText = inv => (inv.intro && inv.intro.dateText) || (([y, m, d]) => `${+d} ${MONTHS[+m - 1]} ${y}`)(inv.date.slice(0, 10).split('-'));

function notFound(res) {
  res.statusCode = 404; res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Faire-part introuvable</title><meta name="robots" content="noindex"><link rel="icon" href="/favicon.svg" type="image/svg+xml"></head><body style="font:17px/1.6 -apple-system,Arial,sans-serif;max-width:520px;margin:0 auto;padding:60px 16px;color:#111;background:#fff"><h1 style="font-weight:500">Ce faire-part est introuvable.</h1><p>Vérifiez le lien reçu, ou demandez-le à nouveau aux mariés.</p><p><a href="/" style="color:#111">Save The Oui</a></p></body></html>');
}

export default async function handler(req, res) {
  const slug = String(req.query.s || '');
  if (!/^[a-z0-9-]{2,60}$/.test(slug) || !ready()) return notFound(res);
  const f = await readOne(`fiches/${slug}.json`);
  const th = f && f.inv && META.themes[f.inv.theme];
  if (!th) return notFound(res);
  const inv = Object.assign({}, f.inv, { slug, demo: false, calques: th.calques, anim: th.anim, trans: th.trans, doormen: false });
  const couple = inv.couple.join(' & '), title = `${couple} · ${dateText(inv)}`, desc = 'Vous êtes invités. Ouvrez notre faire-part.';
  const site = process.env.SCEAU_SITE_URL || META.site, data = JSON.stringify(inv).replace(/</g, '\\u003c');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=300');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.end(`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(site)}/img/og/${esc(inv.theme)}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${esc(site)}/d/${slug}/">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#111111">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/polices/polices.css">
<link rel="preload" as="image" href="/img/hd/${esc(inv.theme)}-1.webp">
<link rel="stylesheet" href="/invite.css">
<link rel="stylesheet" href="/reveal.css">
<link rel="stylesheet" href="/carte.css">
</head>
<body>
<noscript><p style="padding:24px;font-family:sans-serif">${esc(title)}. Activez JavaScript pour ouvrir le faire-part.</p></noscript>
<script>window.INVITE=${data};</script>
<script src="/themes.js"></script>
<script src="/reveal.js"></script>
<script src="/carte.js"></script>
<script src="/invite.js"></script>
</body>
</html>
`);
}
