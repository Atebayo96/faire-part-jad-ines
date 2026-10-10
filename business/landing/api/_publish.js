// Publication d'une commande payée (Essentiel, Page unique ; la Carte est seulement marquée payée) : la fiche passe de commandes/<ref>.json à fiches/<slug>.json, le faire-part
// est en ligne sur /d/<slug>/ (api/page.js), et les mariés reçoivent leurs liens. Appelée par le webhook Stripe
// (api/stripe.js) et par la page Merci (api/commande.js) : la première qui passe publie, l'autre retrouve le même slug.
import { save, readOne, dashKey } from './_store.js';
import { freeSlug } from './_fiche.js';
import META from './_meta.js';

export const links = (slug, origin) => {
  const o = origin || process.env.SCEAU_SITE_URL || META.site;
  return { link: `${o}/d/${slug}/`, dashboard: `${o}/tableau/#i=${slug}&k=${dashKey(slug)}`, edit: `${o}/creer/?edit=${slug}#k=${dashKey(slug)}` };
};

export async function publish(ref, payment) {
  const c = await readOne(`commandes/${ref}.json`);
  if (!c) throw new Error('commande');
  if (c.slug || c.paidAt) return c;
  // la Carte n'a pas de lien en ligne : elle est payée, et se télécharge (image et PDF) depuis la page Merci (c.dl)
  if (c.plan === 'carte') {
    const done = Object.assign({}, c, { paidAt: new Date().toISOString(), payment: payment || c.payment || null });
    await save(`commandes/${ref}.json`, done);
    done.mailed = await mail(done.email, c.inv.couple.join(' & '), { dl: c.dl });
    if (done.mailed) await save(`commandes/${ref}.json`, done);
    return done;
  }
  const slug = await freeSlug(c.inv.couple, ref);
  const now = new Date().toISOString();
  await save(`fiches/${slug}.json`, { ref, plan: c.plan, options: c.options, email: c.email, at: now, paidAt: now, inv: Object.assign({ slug }, c.inv), config: c.config });
  const done = Object.assign({}, c, { slug, paidAt: now, payment: payment || c.payment || null });
  await save(`commandes/${ref}.json`, done);
  const L = links(slug);
  // page unique sans le bouton Répondre : pas de réponses, donc pas de tableau de bord
  if (c.plan === 'page' && !(c.options && c.options.reply)) delete L.dashboard;
  done.mailed = await mail(done.email, c.inv.couple.join(' & '), L);
  if (done.mailed) await save(`commandes/${ref}.json`, done);
  return done;
}

const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

// e-mail aux mariés (Resend) : sans clé, rien ne part, et la page Merci reste le seul endroit où voir les liens
async function mail(to, couple, L) {
  const key = process.env.RESEND_API_KEY, from = process.env.SCEAU_MAIL_FROM || 'Save The Oui <bonjour@savetheoui.fr>';
  if (!key) return false;
  const a = (href, label) => `<p style="margin:18px 0"><a href="${esc(href)}" style="display:inline-block;background:#111;color:#fff;padding:13px 22px;border-radius:999px;text-decoration:none;font:500 16px/1 Arial,sans-serif">${label}</a></p>`;
  const html = L.dl ? `<div style="font:16px/1.6 Arial,sans-serif;color:#111;max-width:560px">
<p>Bonjour ${esc(couple)},</p>
<p>Votre faire-part est prêt : l'image à envoyer sur WhatsApp et le PDF à imprimer se téléchargent ici, autant de fois que vous voulez :</p>
${a(L.dl, 'Télécharger mon faire-part')}
<p>Une question ? Répondez simplement à cet e-mail.</p><p>Save The Oui</p></div>` : `<div style="font:16px/1.6 Arial,sans-serif;color:#111;max-width:560px">
<p>Bonjour ${esc(couple)},</p>
<p>Votre faire-part est en ligne. Voici votre lien, à envoyer à vos invités sur WhatsApp, par SMS ou par e-mail :</p>
${a(L.link, 'Voir mon faire-part')}<p style="color:#555">${esc(L.link)}</p>
${L.dashboard ? `<p>Les réponses de vos invités arrivent dans votre tableau de bord. Gardez ce lien pour vous : il donne accès aux réponses.</p>
${a(L.dashboard, 'Mon tableau de bord')}` : ''}
<p>Un horaire ou un texte change ? Modifiez votre faire-part quand vous voulez, le lien de vos invités reste le même :</p>
${a(L.edit, 'Modifier mon faire-part')}
<p>Une question ? Répondez simplement à cet e-mail.</p><p>Save The Oui</p></div>`;
  try {
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject: `${L.dl ? 'Votre faire-part est prêt' : 'Votre faire-part est en ligne'} · ${couple}`, html }) });
    return r.ok;
  } catch { return false; }
}
