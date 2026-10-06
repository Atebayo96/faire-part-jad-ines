// POST /api/stripe : webhook Stripe (événement checkout.session.completed). Publie la commande Essentiel payée, même si
// les mariés ont fermé la page avant de revenir sur la page Merci. La signature (en-tête Stripe-Signature, secret
// STRIPE_WEBHOOK_SECRET) est vérifiée sur le corps brut de la requête.
import { createHmac } from 'node:crypto';
import { same } from './_store.js';
import { publish } from './_publish.js';

async function rawBody(req) {
  const parts = []; for await (const c of req) parts.push(typeof c === 'string' ? Buffer.from(c) : c);
  return Buffer.concat(parts).toString('utf8');
}

export function verify(raw, header, secret, now = Date.now()) {
  const h = Object.fromEntries(String(header || '').split(',').map(x => x.split('=')).filter(x => x.length === 2).map(([k, v]) => [k.trim(), v]));
  const sigs = String(header || '').split(',').filter(x => x.startsWith('v1=')).map(x => x.slice(3));
  if (!h.t || !sigs.length || Math.abs(now / 1000 - +h.t) > 300) return false;
  const want = createHmac('sha256', secret).update(`${h.t}.${raw}`).digest('hex');
  return sigs.some(s => same(s, want));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ error: 'secret' });
  const raw = await rawBody(req);
  if (!verify(raw, req.headers['stripe-signature'], secret)) return res.status(400).json({ error: 'signature' });
  const ev = JSON.parse(raw), s = ev.data && ev.data.object;
  if (ev.type !== 'checkout.session.completed' || !s || s.payment_status !== 'paid') return res.status(200).json({ ignored: true });
  const ref = s.client_reference_id || (s.metadata || {}).ref || '';
  // les commandes Signature passent par les liens de paiement (paiement.js) : leur référence ne commence pas par ess_
  if (!/^ess_[\w-]{10,80}$/.test(ref)) return res.status(200).json({ ignored: true });
  try { const c = await publish(ref, { session: s.id, intent: s.payment_intent, amount: s.amount_total }); return res.status(200).json({ ok: true, slug: c.slug }); }
  catch (e) { return res.status(500).json({ error: e.message }); }
}
