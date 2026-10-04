// POST /api/lead : demande envoyée depuis le formulaire « Réserver ma place » de la vitrine,
// ou commande juste avant le paiement Stripe (type: 'commande', avec la référence transmise à Stripe).
import { save, ready, clean, id } from './_store.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const b = req.body || {};
  if (b.website) return res.status(200).json({ ok: true }); // pot de miel anti-robots
  const email = clean(b.email, 160);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'email' });
  if (!b.consent) return res.status(400).json({ error: 'consent' });
  const order = b.type === 'commande';
  if (order && !(b.cgv && b.waiver)) return res.status(400).json({ error: 'consent' });
  if (!ready()) return res.status(503).json({ error: 'storage' });
  const lead = {
    at: new Date().toISOString(), email, type: order ? 'commande' : 'demande', ref: clean(b.ref, 40),
    // commande : conditions de vente acceptées et renonciation au délai de rétractation (horodatées par « at »)
    ...(order ? { cgvAcceptees: true, renonciationRetractation: true } : {}),
    name: clean(b.name, 120), phone: clean(b.phone, 40), date: clean(b.date, 20), plan: clean(b.plan, 30),
    message: clean(b.message, 2000),
    choix: { style: clean(b.style, 40), format: clean(b.format, 30), composition: clean(b.plan_url, 80), palette: clean(b.palette, 40), police: clean(b.font, 40), ouverture: clean(b.opening, 40), compte: clean(b.countdown, 40), revelation: clean(b.reveal, 40), ecrans: clean(b.screens, 300), evenements: clean(b.events, 400), prenoms: clean(b.names, 80), dateMariage: clean(b.weddingDate, 20) },
    source: clean(req.headers.referer, 200)
  };
  await save('leads/' + id() + '.json', lead);
  res.status(200).json({ ok: true });
}
