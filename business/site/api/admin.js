// Tableau de bord de l'admin (/admin/). Accès : Authorization: Bearer <SCEAU_SECRET ou ADMIN_KEY>.
// GET  /api/admin?days=30 : demandes, commandes (avec leur montant), faire-part en ligne et leur vie (réponses, ouvertures,
//      cadeaux), et ce que disent Stripe (paiements, remboursements, solde) et Umami (visites) quand ils sont branchés.
// POST /api/admin {op:'lead', path, status, note}   : suivi d'une demande (nouveau, en cours, gagné, perdu) et une note.
//      {op:'test', ref, test}                       : une commande de test sort des chiffres (elle reste dans la liste).
//      {op:'remail', ref}                           : renvoie aux mariés l'e-mail avec leurs liens.
import { readAll, readOne, save, ready, dashKey, isAdmin, clean } from './_store.js';
import { links, mail } from './_publish.js';
import { priceOf, summary } from './_fiche.js';
import INVITES from './_invites.js';

const STATUS = ['nouveau', 'en cours', 'gagné', 'perdu'];
const REF = /^ess_[\w-]{10,80}$/;

async function stripe(path) {
  const r = await fetch('https://api.stripe.com/v1/' + path, { headers: { Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY } });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || 'stripe');
  return j;
}

// Stripe : tout ce qui a été encaissé, y compris Signature et Couture (liens de paiement, hors de nos commandes)
async function stripeData() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  const [s, c, b] = await Promise.allSettled([
    stripe('checkout/sessions?limit=100&status=complete'), stripe('charges?limit=100'), stripe('balance')]);
  if (s.status === 'rejected') return { error: s.reason.message };
  const sessions = s.value.data.map(x => ({
    id: x.id, at: new Date(x.created * 1000).toISOString(), amount: x.amount_total || 0, currency: x.currency,
    email: (x.customer_details && x.customer_details.email) || x.customer_email || '', name: (x.customer_details && x.customer_details.name) || '',
    ref: x.client_reference_id || (x.metadata || {}).ref || '', link: !!x.payment_link, paid: x.payment_status }));
  const refunds = c.status === 'fulfilled' ? c.value.data.filter(x => x.amount_refunded > 0)
    .map(x => ({ at: new Date(x.created * 1000).toISOString(), amount: x.amount_refunded, email: (x.billing_details || {}).email || x.receipt_email || '' })) : [];
  const sum = a => (a || []).filter(x => x.currency === 'eur').reduce((n, x) => n + x.amount, 0);
  const balance = b.status === 'fulfilled' ? { available: sum(b.value.available), pending: sum(b.value.pending) } : null;
  return { live: process.env.STRIPE_SECRET_KEY.startsWith('sk_live'), sessions, refunds, balance };
}

// Umami : visites, pages, provenances, et les étapes du tunnel (événements envoyés par track() dans vitrine.js)
async function umamiData(days) {
  const key = process.env.UMAMI_API_KEY, site = process.env.UMAMI_WEBSITE_ID;
  if (!key || !site) return null;
  const base = (process.env.UMAMI_API_URL || 'https://api.umami.is/v1') + '/websites/' + encodeURIComponent(site);
  const endAt = Date.now(), startAt = endAt - days * 864e5, q = `startAt=${startAt}&endAt=${endAt}`;
  const get = async p => { const r = await fetch(base + p, { headers: { 'x-umami-api-key': key, Accept: 'application/json' } }); if (!r.ok) throw new Error('umami ' + r.status); return r.json(); };
  const metric = async type => { try { return await get(`/metrics?${q}&type=${type}&limit=10`); } catch { return []; } };
  const n = v => v && typeof v === 'object' ? +v.value || 0 : +v || 0;
  try {
    const [st, pv, pages, refs, countries, devices, events] = await Promise.all([
      get('/stats?' + q), get(`/pageviews?${q}&unit=day&timezone=Europe/Paris`),
      metric('path').then(r => r.length ? r : metric('url')), metric('referrer'), metric('country'), metric('device'), metric('event')]);
    const day = x => String(x).slice(0, 10);
    return { visitors: n(st.visitors), visits: n(st.visits), pageviews: n(st.pageviews), bounces: n(st.bounces), totaltime: n(st.totaltime),
      series: (pv.sessions || pv.pageviews || []).map(x => ({ d: day(x.x), n: x.y })),
      pages, refs, countries, devices, events };
  } catch (e) { return { error: e.message }; }
}

// les réponses d'un faire-part, comptées comme le tableau de bord des mariés (la dernière réponse d'un même nom)
function rsvpStats(rows) {
  const last = new Map(), distinct = [];
  for (const r of rows.sort((a, b) => a.at < b.at ? -1 : 1)) { if (r.distinct) distinct.push(r); else last.set(String(r.name || '').toLowerCase().replace(/\s+/g, ' ').trim(), r); }
  const kept = [...last.values(), ...distinct];
  const yes = kept.filter(r => Object.values(r.events || {}).some(Boolean));
  return { answers: kept.length, yes: yes.length, no: kept.length - yes.length, guests: yes.reduce((n, r) => n + (r.guests || 1), 0),
    last: kept.reduce((m, r) => r.at > m ? r.at : m, '') };
}

const by = (rows, i) => { const m = {}; for (const r of rows) { const k = r.pathname.split('/')[i]; (m[k] = m[k] || []).push(r); } return m; };

export default async function handler(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'key' });

  if (req.method === 'POST') {
    const b = req.body || {};
    if (!ready()) return res.status(503).json({ error: 'storage' });
    if (b.op === 'lead') {
      const p = String(b.path || '');
      if (!/^leads\/[\w-]{10,90}\.json$/.test(p)) return res.status(400).json({ error: 'path' });
      const l = await readOne(p);
      if (!l) return res.status(404).json({ error: 'lead' });
      if (STATUS.includes(b.status)) l.status = b.status;
      if (b.note != null) l.note = clean(b.note, 1000);
      l.updated = new Date().toISOString();
      await save(p, l);
      return res.status(200).json({ ok: true });
    }
    const ref = String(b.ref || '');
    if (!REF.test(ref)) return res.status(400).json({ error: 'ref' });
    const c = await readOne(`commandes/${ref}.json`);
    if (!c) return res.status(404).json({ error: 'ref' });
    if (b.op === 'test') { c.test = !!b.test; await save(`commandes/${ref}.json`, c); return res.status(200).json({ ok: true }); }
    if (b.op === 'remail') {
      if (!c.paidAt) return res.status(400).json({ error: 'unpaid' });
      let L;
      if (c.plan === 'carte') L = { dl: c.dl };
      else { L = links(c.slug); if (c.plan === 'page' && !(c.options && c.options.reply)) delete L.dashboard; }
      const ok = await mail(c.email, c.inv.couple.join(' & '), L);
      if (!ok) return res.status(502).json({ error: process.env.RESEND_API_KEY ? 'mail' : 'resend' });
      c.mailed = true; c.remailedAt = new Date().toISOString(); await save(`commandes/${ref}.json`, c);
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: 'op' });
  }

  const days = Math.max(1, Math.min(365, parseInt(req.query.days, 10) || 30));
  const store = ready();
  const [leadRows, cmdRows, ficheRows, rsvpRows, seenRows, giftRows, st, um] = await Promise.all([
    store ? readAll('leads/') : [], store ? readAll('commandes/') : [], store ? readAll('fiches/') : [],
    store ? readAll('rsvp/') : [], store ? readAll('seen/') : [], store ? readAll('gifts/') : [],
    stripeData().catch(e => ({ error: e.message })), umamiData(days)]);

  const leads = leadRows.sort((a, b) => a.at < b.at ? 1 : -1).map(({ pathname, ...l }) => Object.assign(l, { path: pathname, status: l.status || 'nouveau' }));

  const commandes = cmdRows.sort((a, b) => a.at < b.at ? 1 : -1).map(({ k, inv, config, pathname, ...c }) => {
    const price = priceOf(c.plan, c.options || {});
    const amount = c.payment && typeof c.payment.amount === 'number' ? c.payment.amount : price;
    return Object.assign(c, {
      couple: inv && inv.couple.join(' & '), date: inv && inv.date, theme: inv && inv.theme, events: inv && inv.events ? inv.events.length : 0,
      paid: !!(c.slug || c.paidAt), price, amount, test: !!c.test || (!!(c.slug || c.paidAt) && amount === 0) || !!(c.payment && c.payment.fake) },
      c.slug ? links(c.slug, '') : {});
  });

  // les faire-part : ceux du dépôt (démos, premiers clients) et ceux commandés en ligne
  const rs = by(rsvpRows, 1), se = by(seenRows, 1), gi = by(giftRows, 1);
  const all = Object.entries(INVITES).map(([slug, v]) => ({ slug, ...v }));
  // un faire-part dont la commande est marquée « test » sort de la liste des clients
  const tests = new Set(commandes.filter(c => c.test).map(c => c.ref));
  for (const f of ficheRows) if (f.inv && f.inv.slug && !INVITES[f.inv.slug]) all.push({ slug: f.inv.slug, ...summary(f.inv), plan: f.plan, theme: f.inv.theme, paidAt: f.paidAt, email: f.email, test: tests.has(f.ref) });
  const invites = all.map(v => ({
    slug: v.slug, couple: v.couple, demo: !!v.demo, test: !!v.test, online: !!v.online, date: v.date, plan: v.plan, theme: v.theme, email: v.email,
    link: `/d/${v.slug}/`, dashboard: `/tableau/#i=${v.slug}&k=${dashKey(v.slug)}`,
    families: Object.keys(v.familyLabels || v.families || {}).length, opened: (se[v.slug] || []).length,
    opens: (se[v.slug] || []).reduce((n, s) => n + (s.n || 0), 0),
    gifts: (v.gifts || []).length, giftsTaken: (gi[v.slug] || []).length, ...rsvpStats(rs[v.slug] || [])
  }));

  res.status(200).json({ storage: store, days, now: new Date().toISOString(), leads, commandes, invites, stripe: st, umami: um,
    setup: { stripe: !!process.env.STRIPE_SECRET_KEY, webhook: !!process.env.STRIPE_WEBHOOK_SECRET, resend: !!process.env.RESEND_API_KEY,
      umami: !!(process.env.UMAMI_API_KEY && process.env.UMAMI_WEBSITE_ID), adminKey: !!process.env.ADMIN_KEY } });
}
