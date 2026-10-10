// Faire-part commandés en ligne (Essentiel en libre-service) : leur fiche vit dans le stockage (fiches/<slug>.json),
// pas dans business/invites/. Ce module la nettoie (seuls les champs connus du moteur, à leur taille), en tire le résumé
// dont les API ont besoin (comme build-site.py pour les fiches du dépôt), et retrouve un faire-part par son slug.
import { readOne, ready, clean } from './_store.js';
import INVITES from './_invites.js';
import META from './_meta.js';

const pick = (v, list, d) => list.includes(v) ? v : d;
const txt = (v, n) => clean(v, n) || undefined;
const arr = (v, n) => Array.isArray(v) ? v.slice(0, n) : [];
const hex = v => /^#[0-9a-f]{6}$/i.test(String(v || '')) ? String(v) : undefined;
const url = v => { const s = clean(v, 300); return /^https?:\/\/[^\s"'<>]+$/i.test(s) ? s : undefined; };
const DAY = /^\d{4}-\d{2}-\d{2}$/, STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const ICONS = ['hotel', 'car', 'kids', 'dress', 'gift', 'info'];
// sans les undefined : la fiche stockée reste lisible
const tidy = o => JSON.parse(JSON.stringify(o));

/* Ce que l'Essentiel comprend (page Formules) : 2 événements, les lieux déjà peints du thème, une langue.
   Le lieu peint d'après photo, le lien par famille et l'anglais sont en Signature : le configurateur bascule alors
   la formule, et l'API refuse une fiche Essentiel qui les demande. */
export const LIMITS = { essentiel: { events: 2 }, page: { events: 3 }, carte: { events: 3 } };

/* Page unique (59 €) et Carte (29 €), 10 octobre 2026 : tout le faire-part sur une seule feuille (carte.js). La carte est
   cette feuille en image et en PDF, sans lien en ligne. L'ouverture (+10 €) et le bouton Répondre avec le tableau de bord
   (+20 €) sont des options de la page unique : opts dit ce qui a été payé, la fiche ne peut pas en demander davantage. */
export const PAGE_PRICE = { carte: 2900, page: 5900, opening: 1000, reply: 2000 };
export const ONE_PAGE = ['page', 'carte'];
export const priceOf = (plan, opts = {}) => plan === 'carte' ? PAGE_PRICE.carte : plan === 'page' ? PAGE_PRICE.page + (opts.opening ? PAGE_PRICE.opening : 0) + (opts.reply ? PAGE_PRICE.reply : 0) : 9900;

export function sanitize(raw, plan = 'essentiel', opts = {}) {
  const r = raw || {}, th = META.themes[r.theme];
  if (!th || !th.compose) throw new Error('theme');
  const couple = arr(r.couple, 2).map(x => clean(x, 40)).filter(Boolean);
  if (!couple.length) throw new Error('couple');
  const keys = new Set(th.keys);
  const evs = arr(r.events, 6).map((e, i) => {
    const start = String(e && e.start || '');
    if (!STAMP.test(start)) throw new Error('date');
    const ev = { id: 'e' + i, eyebrow: txt(e.eyebrow, 40) || 'Événement ' + (i + 1), title: txt(e.title, 60) || '', start,
      address: txt(e.address, 160), place: txt(e.place, 160) };
    if (e.bg === 'simple') ev.bg = 'simple';
    else if (/^[a-z0-9]{2,20}$/.test(String(e.lieu || '')) && keys.has(e.lieu)) ev.lieu = e.lieu;
    else if ([1, 2, 3, 4].includes(+e.scene)) ev.scene = +e.scene;
    else ev.scene = [2, 3][i % 2];
    return ev;
  });
  if (!evs.length) throw new Error('events');
  const lim = LIMITS[plan];
  if (lim && evs.length > lim.events) throw new Error('plan');
  const first = evs.map(e => e.start).sort()[0];
  const P = r.parents, ST = r.story, DR = r.dress, PR = r.program, FQ = r.faq, GF = r.gifts, R = r.rsvp || {};
  const gmode = GF ? pick(GF.mode, ['liste', 'cagnotte', 'lien'], 'lien') : null;
  const one = ONE_PAGE.includes(plan);
  return tidy({
    format: one ? 'page' : undefined, reply: one ? plan === 'page' && !!opts.reply : undefined,
    paper: one ? pick(r.paper, ['coton', 'lin', 'verge'], 'coton') : undefined,
    theme: r.theme, couple, date: first, tz: 'Europe/Paris', lang: 'fr', kind: pick(r.kind, ['henne', 'sbou3'], undefined),
    opening: one && !(plan === 'page' && opts.opening) ? 'none' : pick(r.opening, ['env', 'cur', 'voile', 'door'], 'env'), palette: hex(r.palette),
    font: pick(r.font, ['script', 'classique', 'moderne', 'deco'], undefined),
    countdown: one ? 'non' : pick(r.countdown, ['debut', 'page', 'fin', 'non'], 'fin'), reveal: one ? null : pick(r.reveal, ['scratch', 'wheel', 'slot'], null),
    intro: r.intro ? { eyebrow: txt(r.intro.eyebrow, 60), text: txt(r.intro.text, 200), dateText: txt(r.intro.dateText, 80) } : undefined,
    parents: P ? { eyebrow: txt(P.eyebrow, 60), names: arr(P.names, 2).map(x => clean(x, 60)).filter(Boolean), text: txt(P.text, 300) } : undefined,
    eventsTitle: typeof r.eventsTitle === 'string' ? clean(r.eventsTitle, 60) : undefined,
    events: evs,
    story: ST ? { title: txt(ST.title, 60), items: arr(ST.items, 8).map(x => ({ when: txt(x && x.when, 20), title: txt(x && x.title, 60), text: txt(x && x.text, 240) })).filter(x => x.when || x.title) } : undefined,
    dress: DR ? { eyebrow: txt(DR.eyebrow, 40), title: txt(DR.title, 60), text: txt(DR.text, 300), colors: arr(DR.colors, 6).map(hex).filter(Boolean) } : undefined,
    infos: arr(r.infos, 8).map(x => ({ icon: pick(x && x.icon, ICONS, 'info'), title: txt(x && x.title, 60) || '', text: txt(x && x.text, 300) || '' })).filter(x => x.title || x.text),
    program: PR ? { eyebrow: txt(PR.eyebrow, 40), title: txt(PR.title, 60), items: arr(PR.items, 12).map(x => ({ time: txt(x && x.time, 10), title: txt(x && x.title, 60), text: txt(x && x.text, 160) })).filter(x => x.time || x.title) } : undefined,
    faq: FQ ? { eyebrow: txt(FQ.eyebrow, 40), items: arr(FQ.items, 10).map(x => ({ q: txt(x && x.q, 120), a: txt(x && x.a, 400) })).filter(x => x.q) } : undefined,
    photos: r.photos && url(r.photos.url) ? { text: txt(r.photos.text, 200), url: url(r.photos.url) } : undefined,
    gifts: GF ? { eyebrow: txt(GF.eyebrow, 40), text: txt(GF.text, 300), mode: gmode,
      items: gmode === 'liste' ? arr(GF.items, 30).map((x, i) => ({ id: 'g' + i, name: txt(x && x.name, 80), price: txt(x && x.price, 10) })).filter(x => x.name) : undefined,
      url: gmode === 'liste' ? undefined : url(GF.url) } : undefined,
    rsvp: { eyebrow: txt(R.eyebrow, 40), title: txt(R.title, 60) || 'Serez-vous des nôtres ?', deadline: DAY.test(R.deadline || '') ? R.deadline : undefined,
      menu: arr(R.menu, 8).map(x => clean(x, 40)).filter(Boolean), question: txt(R.question, 120),
      whatsapp: /^\+?[\d .-]{6,20}$/.test(String(R.whatsapp || '').trim()) ? String(R.whatsapp).trim() : undefined }
  });
}

// heure locale de Paris -> instant UTC (comme to_utc() dans build-site.py)
export function parisToUtc(stamp) {
  const guess = new Date(stamp + ':00Z');
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    .formatToParts(guess).map(x => [x.type, x.value]));
  const shown = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
  return new Date(guess.getTime() - (shown - guess.getTime()));
}

// le résumé d'une fiche, comme build-site.py l'écrit dans _invites.js pour les fiches du dépôt
export function summary(inv) {
  const items = (inv.gifts && inv.gifts.mode === 'liste' && inv.gifts.items) || [];
  return {
    demo: false, online: true, couple: inv.couple.join(' & '), date: parisToUtc(inv.date).toISOString(),
    events: inv.events.map(e => e.id), eventList: inv.events.map(e => ({ id: e.id, label: e.eyebrow || e.title })),
    families: {}, familyLabels: {},
    rsvpMenu: ((inv.rsvp || {}).menu || []).slice(0, 8), rsvpQuestion: (inv.rsvp || {}).question || '',
    gifts: items.map(x => x.id), giftLabels: Object.fromEntries(items.map(x => [x.id, x.name]))
  };
}

// un faire-part, du dépôt (build) ou commandé en ligne (stockage) : son résumé, ou null
export async function getInvite(slug) {
  if (INVITES[slug]) return INVITES[slug];
  if (!/^[a-z0-9-]{2,60}$/.test(String(slug || '')) || !ready()) return null;
  const f = await readOne(`fiches/${slug}.json`);
  return f && f.inv ? summary(f.inv) : null;
}

// l'adresse du faire-part : les prénoms, sans accents ; un chiffre s'ajoute si elle est déjà prise par un autre
export async function freeSlug(couple, ref) {
  const base = couple.join('-').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'faire-part';
  for (let n = 1; n < 200; n++) {
    const s = n === 1 ? base : `${base}-${n}`;
    if (INVITES[s] || s === 'yasmine-karim') continue;
    const f = await readOne(`fiches/${s}.json`);
    if (!f || f.ref === ref) return s;
  }
  throw new Error('slug');
}
