// Essentiel, Page unique et Carte en libre-service : le faire-part composé dans le configurateur est publié dès le paiement,
// sans nous (la Carte, elle, se télécharge en image et en PDF depuis la page Merci, voir carte.js).
// GET  /api/commande                 : {auto} : le paiement en ligne est-il branché (clé Stripe et stockage) ?
// POST /api/commande {email, fiche, config, cgv, waiver} : enregistre la commande, ouvre une session Stripe Checkout -> {url}
// GET  /api/commande?ref=…&k=…       : où en est la commande ; si Stripe dit « payé », elle est publiée -> {status, link, dashboard, edit}
// En local (SCEAU_LOCAL=1 et SCEAU_STRIPE_FAKE=1), le paiement est simulé : on revient directement sur la page Merci.
import { save, readOne, ready, clean, id, newKey, keyHash, same } from './_store.js';
import { sanitize, priceOf } from './_fiche.js';
import { publish, links } from './_publish.js';

const NAMES = { essentiel: 'Essentiel', page: 'Page unique', carte: 'Carte' };
const fake = () => process.env.SCEAU_LOCAL === '1' && process.env.SCEAU_STRIPE_FAKE === '1';
const auto = () => ready() && (!!process.env.STRIPE_SECRET_KEY || fake());
const origin = req => (req.headers['x-forwarded-proto'] || (process.env.SCEAU_LOCAL === '1' ? 'http' : 'https')) + '://' + (req.headers['x-forwarded-host'] || req.headers.host);

async function stripe(path, params) {
  const r = await fetch('https://api.stripe.com/v1/' + path, {
    method: params ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY, ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
    body: params ? new URLSearchParams(params).toString() : undefined });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || 'stripe');
  return j;
}

export default async function handler(req, res) {
  if (req.method === 'GET' && !req.query.ref) return res.status(200).json({ auto: auto() });
  if (!auto()) return res.status(503).json({ error: 'auto' });

  if (req.method === 'POST') {
    const b = req.body || {};
    const email = clean(b.email, 160);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'email' });
    if (!(b.cgv && b.waiver)) return res.status(400).json({ error: 'consent' });
    const plan = NAMES[b.plan] ? b.plan : 'essentiel';
    // options de la page unique : l'ouverture et le bouton Répondre (le prix en dépend, la fiche aussi)
    const options = plan === 'page' ? { opening: !!(b.options && b.options.opening), reply: !!(b.options && b.options.reply) } : undefined;
    let inv;
    try { inv = sanitize(b.fiche, plan, options); } catch (e) { return res.status(400).json({ error: e.message }); }
    // les choix du configurateur, pour que les mariés y reviennent modifier leur faire-part (api/fiche.js)
    const config = JSON.stringify(b.config || {}).length <= 60000 ? b.config || {} : {};
    const ref = 'ess_' + id(), k = newKey();
    const back = `${origin(req)}/merci/?ref=${ref}&k=${k}`;
    // la carte se retélécharge depuis ce lien (envoyé par e-mail après le paiement) : on le garde avec la commande
    await save(`commandes/${ref}.json`, { at: new Date().toISOString(), ref, plan, options, email, k: keyHash(k), inv, config, dl: plan === 'carte' ? back : undefined,
      // conditions de vente acceptées et renonciation au délai de rétractation (horodatées par « at »)
      cgvAcceptees: true, renonciationRetractation: true, source: clean(req.headers.referer, 200) });
    if (fake()) return res.status(200).json({ url: back + '&fake=1' });
    try {
      const s = await stripe('checkout/sessions', {
        mode: 'payment', customer_email: email, client_reference_id: ref, 'metadata[ref]': ref, allow_promotion_codes: 'true', locale: 'fr',
        'line_items[0][quantity]': '1', 'line_items[0][price_data][currency]': 'eur', 'line_items[0][price_data][unit_amount]': String(priceOf(plan, options)),
        'line_items[0][price_data][product_data][name]': `Faire-part Save The Oui · ${NAMES[plan]}${options && options.opening ? ' + ouverture' : ''}${options && options.reply ? ' + réponses' : ''} · ${inv.couple.join(' & ')}`,
        success_url: back + '&session_id={CHECKOUT_SESSION_ID}', cancel_url: `${origin(req)}/creer/?plan=${plan}` });
      const c = await readOne(`commandes/${ref}.json`); c.session = s.id; await save(`commandes/${ref}.json`, c);
      return res.status(200).json({ url: s.url });
    } catch (e) { return res.status(502).json({ error: 'stripe' }); }
  }

  if (req.method === 'GET') {
    const ref = String(req.query.ref || '');
    if (!/^ess_[\w-]{10,80}$/.test(ref)) return res.status(400).json({ error: 'ref' });
    let c = await readOne(`commandes/${ref}.json`);
    if (!c || !same(c.k, keyHash(req.query.k))) return res.status(404).json({ error: 'ref' });
    if (!c.slug && !c.paidAt) {
      let paid = false, payment = null;
      if (fake() && req.query.fake === '1') { paid = true; payment = { fake: true }; }
      else if (c.session) {
        try { const s = await stripe('checkout/sessions/' + encodeURIComponent(c.session)); paid = s.payment_status === 'paid'; payment = { session: s.id, intent: s.payment_intent, amount: s.amount_total }; } catch { paid = false; }
      }
      if (!paid) return res.status(200).json({ status: 'pending' });
      c = await publish(ref, payment);
    }
    const who = c.inv.couple.join(' & ');
    // la carte : pas de lien en ligne, la fiche revient à la page Merci qui dessine l'image et le PDF
    if (c.plan === 'carte') return res.status(200).json({ status: 'paid', plan: 'carte', couple: who, mailed: !!c.mailed, email: c.email, inv: c.inv });
    const L = links(c.slug, origin(req));
    if (c.plan === 'page' && !(c.options && c.options.reply)) delete L.dashboard;
    return res.status(200).json({ status: 'paid', plan: c.plan, slug: c.slug, couple: who, mailed: !!c.mailed, email: c.email, ...L });
  }
  res.status(405).json({ error: 'method' });
}
