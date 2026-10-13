// TEMPORAIRE (recette du 13 octobre 2026, aperçu seulement) : diagnostic Stripe avec la clé du site. À supprimer après.
import { readOne, save, keyHash, same } from './_store.js';
const TOKEN = '7UO5-RSUQnfYkcfLLuKFkKKZ';
async function stripe(path, params) {
  const r = await fetch('https://api.stripe.com/v1/' + path, { method: params ? 'POST' : 'GET',
    headers: { Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY, ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
    body: params ? new URLSearchParams(params).toString() : undefined });
  return { status: r.status, body: await r.json() };
}
export default async function handler(req, res) {
  if (!same(req.headers['x-diag'], TOKEN)) return res.status(404).end();
  const b = req.body || {};
  if (b.action === 'promo') return res.status(200).json(await stripe('promotion_codes?code=' + encodeURIComponent(b.code || 'TESTOUI')));
  if (b.action === 'account') { const a = await stripe('account'); return res.status(200).json({ status: a.status, id: a.body.id, name: a.body.settings && a.body.settings.dashboard && a.body.settings.dashboard.display_name, error: a.body.error }); }
  if (b.action === 'coupon') return res.status(200).json(await stripe('coupons/' + encodeURIComponent(b.id)));
  if (b.action === 'last') { const l = await stripe('checkout/sessions?limit=5'); return res.status(200).json({ status: l.status, error: l.body.error, data: (l.body.data || []).map(s => ({ id: s.id, ref: s.metadata && s.metadata.ref, status: s.status, payment_status: s.payment_status, amount_total: s.amount_total, success_url: s.success_url, created: s.created })) }); }
  if (b.action === 'session') {
    // sans ref : on reprend la dernière session de paiement (sa success_url porte ref et k)
    if (!b.ref) { const l = await stripe('checkout/sessions?limit=5'); const s0 = (l.body.data || []).find(s => s.metadata && s.metadata.ref); if (!s0) return res.status(404).json({ error: 'last' });
      const m = /ref=([^&]+)&k=([^&]+)/.exec(s0.success_url || ''); if (!m) return res.status(404).json({ error: 'url' }); b.ref = m[1]; b.k = m[2]; }
    const c = await readOne(`commandes/${b.ref}.json`);
    if (!c || !same(c.k, keyHash(b.k))) return res.status(404).json({ error: 'ref' });
    const back = `https://savetheoui.fr/merci/?ref=${b.ref}&k=${b.k}`;
    const s = await stripe('checkout/sessions', { mode: 'payment', customer_email: c.email, client_reference_id: b.ref, 'metadata[ref]': b.ref, locale: 'fr',
      ...(b.promo ? { 'discounts[0][promotion_code]': b.promo } : b.coupon ? { 'discounts[0][coupon]': b.coupon } : { allow_promotion_codes: 'true' }), 'line_items[0][quantity]': '1', 'line_items[0][price_data][currency]': 'eur', 'line_items[0][price_data][unit_amount]': '7900',
      'line_items[0][price_data][product_data][name]': 'Faire-part Save The Oui · Page unique + réponses · Test & Recette (recette)',
      success_url: back + '&session_id={CHECKOUT_SESSION_ID}', cancel_url: 'https://savetheoui.fr/creer/?plan=page' });
    if (s.status === 200) { c.session = s.body.id; await save(`commandes/${b.ref}.json`, c); }
    return res.status(200).json({ status: s.status, url: s.body.url, error: s.body.error, amount_total: s.body.amount_total, ref: b.ref, k: b.k });
  }
  res.status(400).json({ error: 'action' });
}
