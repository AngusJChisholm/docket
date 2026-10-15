// Weekly price update. Runs on GitHub (see .github/workflows/prices.yml) every Wednesday morning.
// 1. Asks the price feed for every Docket ingredient at Coles, Woolies and Aldi.
// 2. Picks the best matching product per ingredient per store (right product, sensible pack, cheapest per kg/L/each).
// 3. Writes js/prices.js (what the site uses) and data/catalogue.json (every product seen, with price history).
// Usage: APIFY_TOKEN=... node scripts/update-prices.mjs        live run
//        node scripts/update-prices.mjs --fixture file.json    test against saved feed output
//        add --dry to print the result without writing files
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const FIXTURE = args.includes('--fixture') ? args[args.indexOf('--fixture') + 1] : null;
const ACTOR = process.env.PRICE_ACTOR || 'toptock~au-grocery-prices';
const PER_KEYWORD = +(process.env.PER_KEYWORD || 10);
const today = new Date(Date.now() + 11 * 36e5).toISOString().slice(0, 10); // Melbourne date

// ---------- Load Docket's ingredients ----------
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data.js'), 'utf8') + '\n;globalThis.__D={ING};', ctx);
const ING = ctx.__D.ING;
const prevPrices = (() => { const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/prices.js'), 'utf8'), c); return c.window.DOCKET_PRICES || { coles: {}, woolies: {}, aldi: {} }; })();

// What to type into the search box for each ingredient (default: its name without the bracket note)
const SEARCH = {
  castersugar: 'caster sugar 1kg', cocoa: 'cocoa powder', vanilla: 'vanilla extract', bicarb: 'bicarb soda', bakingpowder: 'baking powder',
  oats: 'rolled oats', desiccated: 'desiccated coconut', darkchoc: 'dark cooking chocolate', chocchips: 'dark choc bits', sweetbiscuits: 'marie biscuits',
  creamcheese: 'cream cheese block 250g', banana: 'bananas each', gf_biscuits: 'gluten free plain biscuits',
  beef_mince: 'beef mince 3 star', chk_whole: 'whole chicken', pork_roast: 'pork shoulder roast', lamb_sh: 'lamb shoulder',
  cabbage: 'red cabbage half', cheese: 'tasty cheese grated', slices: 'burger cheese slices', rice: 'jasmine rice 5kg',
  tintom: 'crushed tomatoes 400g', coconut: 'coconut milk 400ml', chickpeas: 'chickpeas 400g', blackbeans: 'black beans 400g',
  corn: 'corn kernels 420g', buns: 'brioche burger buns', wraps: 'wraps 8 pack', tortillas: 'mini tortillas', pita: 'lebanese bread',
  naan: 'garlic naan', gf_buns: 'gluten free burger buns', gf_wraps: 'gluten free wraps', cornflour: 'cornflour maize',
  stockpowder: 'chicken stock powder', lemongrass: 'lemongrass paste', mayo: 'whole egg mayonnaise', ketchup: 'tomato sauce',
  mustard: 'american mustard', whitefish: 'basa fillets', shortribs: 'beef short ribs', scotch: 'scotch fillet steak',
  lambcutlets: 'lamb cutlets', barra: 'barramundi fillets', duck: 'duck breast', prawns: 'raw peeled prawns frozen',
  kimchi: 'kimchi', springonion: 'spring onions', thaibasil: 'thai basil', chilli: 'long red chilli', iceberg: 'iceberg lettuce',
  corncob: 'corn cobs', potato: 'washed potatoes 2kg', onion: 'brown onions 1kg', carrot: 'carrots 1kg'
};
const query = id => SEARCH[id] || ING[id].n.replace(/\s*\([^)]*\)/g, '').trim();

// ---------- Read the feed's products, whatever it calls its fields ----------
const pick = (o, ...ks) => { for (const k of ks) { const v = k.split('.').reduce((a, p) => a == null ? a : a[p], o); if (v != null && v !== '') return v; } return null; };
const num = v => { if (v == null) return null; if (typeof v === 'object') v = pick(v, 'value', 'amount', 'price', 'current'); const n = parseFloat(String(v).replace(/[^0-9.]/g, '')); return isFinite(n) && n > 0 ? n : null; };
const CHAIN = s => { s = String(s || '').toLowerCase(); return /wool/.test(s) ? 'woolies' : /coles/.test(s) ? 'coles' : /aldi/.test(s) ? 'aldi' : null; };
function unitOf(o) {
  const s = pick(o, 'unitPrice', 'unit_price', 'cupString', 'cupPrice', 'pricePerUnit', 'unitPriceString', 'comparePrice');
  if (s && typeof s === 'object') { const p = num(pick(s, 'price', 'value', 'amount')); const m = String(pick(s, 'unit', 'measure', 'per') || '').match(/(\d*)\s*(kg|g|l|ml|ea|each)/i); return p && m ? { p, amt: +(m[1] || 1), u: m[2].toLowerCase() } : null; }
  const m = String(s || '').match(/\$?\s*([\d.]+)\s*(?:\/|per)\s*(\d*)\s*(kg|g|l|ml|ea|each)\b/i);
  return m ? { p: +m[1], amt: +(m[2] || 1), u: m[3].toLowerCase() } : null;
}
function normalise(o) {
  const name = pick(o, 'name', 'title', 'productName', 'displayName', 'product.name');
  const store = CHAIN(pick(o, 'chain', 'store', 'retailer', 'supermarket', 'source', 'shop'));
  const price = num(pick(o, 'price', 'currentPrice', 'priceNow', 'salePrice', 'pricing.now', 'product.price'));
  if (!name || !store || !price) return null;
  const size = pick(o, 'size', 'packageSize', 'packSize', 'unitSize', 'quantity');
  const fullName = size && !String(name).toLowerCase().includes(String(size).toLowerCase()) ? `${name} ${size}` : String(name);
  const was = num(pick(o, 'wasPrice', 'was_price', 'previousPrice', 'pricing.was', 'regularPrice'));
  const special = !!(pick(o, 'onSpecial', 'isOnSpecial', 'special', 'isSpecial', 'halfPrice') || (was && was > price));
  const inStock = pick(o, 'inStock', 'isAvailable', 'available', 'stock');
  return { store, name: fullName.replace(/\s+/g, ' ').trim(), price, unit: unitOf(o), was: was && was > price ? was : null, special,
    out: inStock === false || /out of stock|unavailable/i.test(String(inStock)), keyword: pick(o, 'keyword', 'searchTerm', 'query', 'search', 'input.keyword'), url: pick(o, 'url', 'productUrl', 'link') };
}

// ---------- Matching (same rules as admin/prices.html) ----------
const STOP = new Set(['and', 'the', 'with', 'fresh', 'pack', 'tin', 'jar', 'each', 'bunch', 'free', 'range', 'approx', 'australian', 'coles', 'woolworths', 'aldi', 'rspca', 'approved', 'star', 'half', 'boneless', 'skin', 'fillets', 'rind', 'bought', 'week']);
const WRONG = ['marinated', 'sausage', 'burger patt', 'meatball', 'slow cooked', 'cooked', 'bbq', 'schnitzel', 'stir fry', 'knuckle', 'kangaroo', 'kebab', 'crumbed', 'kiev', 'nugget', 'smoked', 'seasoned', 'portion', 'flavoured', 'dog food', 'cat food', 'ready meal', 'soup', 'snack', 'bulk', 'organic', 'plant based', 'vegan'];
const words = s => s.toLowerCase().replace(/\([^)]*\)/g, ' ').split(/[^a-z]+/).filter(w => w.length > 2 && !STOP.has(w));
function fit(name, id) {
  const it = ING[id]; const pw = new Set(words(name)); const iw = words(it.n); if (!iw.length) return 0;
  let sc = iw.filter(w => pw.has(w) || pw.has(w.replace(/s$/, '')) || pw.has(w + 's')).length / iw.length;
  const ln = name.toLowerCase(), li = it.n.toLowerCase();
  for (const w of WRONG) if (new RegExp('\\b' + w).test(ln) && !li.includes(w)) sc *= .4;
  if (/\b(beef|pork|lamb|chicken|steaks?|salmon|prawns?|veal)\b/i.test(name) && it.a !== 'M' && it.a !== 'Z' && it.a !== 'K') sc *= .3;
  const gfName = /gluten free|\bgf\b/i.test(name);
  if (id.startsWith('gf_') && !gfName) sc *= .3; // GF swaps must say gluten free
  if (!id.startsWith('gf_') && it.a !== 'G' && gfName) sc *= .5; // regular ingredients: skip the pricier GF version
  return sc;
}
function sizeOf(name) {
  const range = /\d+(\.\d+)?\s*(g|kg)\s*-\s*\d/i.test(name);
  const ms = [...name.matchAll(/(\d+(?:\.\d+)?)\s*(kg|g|ml|l)\b/gi)]; const last = ms[ms.length - 1];
  const pack = name.match(/(\d+)\s*(pack|pk)\b/i);
  return { range, amt: last ? +last[1] * (/kg|^l$/i.test(last[2]) ? 1000 : 1) : null, su: last ? last[2].toLowerCase().replace('kg', 'g').replace(/^l$/, 'ml') : null, count: pack ? +pack[1] : null };
}
function toIng(f, id) {
  const it = ING[id]; const sz = sizeOf(f.name);
  if (it.u === 'ea') return { p: f.price, pk: it.pk > 1 ? (sz.count || it.pk) : 1 };
  if (!sz.range && sz.amt && sz.su === it.u) return { p: f.price, pk: sz.amt };
  if (f.unit && !/^ea/.test(f.unit.u)) { const amt = f.unit.amt * (/^(kg|l)$/.test(f.unit.u) ? 1000 : 1); return { p: +(f.unit.p * (1000 / amt)).toFixed(2), pk: 1000, byWeight: true }; }
  return null; // can't tell the pack size, so don't trust it
}
const bestIng = name => { let best = '', score = 0; for (const id of Object.keys(ING)) { const s = fit(name, id); if (s > score) { score = s; best = id; } } return score >= .66 ? best : ''; };

// ---------- Fetch ----------
async function apify() {
  const token = process.env.APIFY_TOKEN; if (!token) throw new Error('APIFY_TOKEN is not set');
  const ids = Object.keys(ING);
  const keywords = [...new Set(ids.map(query))];
  const input = { keywords, chains: ['coles', 'woolworths', 'aldi'], maxResultsPerKeyword: PER_KEYWORD, output: 'products' };
  const base = 'https://api.apify.com/v2';
  const start = await fetch(`${base}/acts/${ACTOR}/runs?token=${token}&waitForFinish=60`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  if (!start.ok) throw new Error(`Feed would not start (${start.status}): ${(await start.text()).slice(0, 300)}`);
  let run = (await start.json()).data;
  for (let i = 0; i < 90 && !['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.status); i++) {
    await new Promise(r => setTimeout(r, 20000));
    run = (await (await fetch(`${base}/actor-runs/${run.id}?token=${token}`)).json()).data;
  }
  if (run.status !== 'SUCCEEDED') throw new Error(`Feed run ended ${run.status}`);
  const items = await (await fetch(`${base}/datasets/${run.defaultDatasetId}/items?token=${token}&clean=true&format=json`)).json();
  fs.mkdirSync(path.join(ROOT, 'data/feed'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'data/feed/latest.json'), JSON.stringify(items.slice(0, 40), null, 1)); // a sample, to check field names
  return items;
}

// ---------- Main ----------
const raw = FIXTURE ? JSON.parse(fs.readFileSync(FIXTURE, 'utf8')) : await apify();
const products = raw.map(normalise).filter(Boolean);
console.log(`Feed returned ${raw.length} rows, ${products.length} usable products.`);
const kwToIds = {}; for (const id of Object.keys(ING)) (kwToIds[query(id).toLowerCase()] ??= []).push(id);

const cand = {}; // store -> id -> [candidates]
for (const f of products) {
  if (f.out) continue;
  const ids = f.keyword && kwToIds[String(f.keyword).toLowerCase()] ? kwToIds[String(f.keyword).toLowerCase()] : [bestIng(f.name)].filter(Boolean);
  for (const id of ids) {
    const sc = fit(f.name, id); if (sc < .66) continue;
    const c = toIng(f, id); if (!c) continue;
    const it = ING[id]; const per = c.p / c.pk; const ratio = per / (it.p / it.pk);
    if (ratio > 2.5 || ratio < .3) continue; // way off: wrong product or a weird pack
    // Prefer packs near the size Docket plans around, so small households aren't sent a 5kg bag
    const sizeOk = c.byWeight || it.u === 'ea' || (c.pk >= it.pk * .4 && c.pk <= it.pk * 2.5);
    (((cand[f.store] ??= {})[id]) ??= []).push({ ...c, per, sizeOk, sc, f });
  }
}

const out = { coles: {}, woolies: {}, aldi: {} }; const moves = []; let set = 0, kept = 0;
for (const store of Object.keys(out)) {
  for (const id of Object.keys(ING)) {
    const list = (cand[store] || {})[id] || [];
    const pool = list.some(x => x.sizeOk) ? list.filter(x => x.sizeOk) : list;
    pool.sort((a, b) => a.per - b.per || b.sc - a.sc);
    const best = pool[0]; const prev = (prevPrices[store] || {})[id];
    if (best) {
      if (prev && !best.f.special) { const jump = best.per / (prev.p / (prev.pk || ING[id].pk)); if (jump > 1.6 || jump < .5) { out[store][id] = prev; kept++; continue; } }
      const e = { p: best.p, pk: best.pk, name: best.f.name, at: today };
      if (best.byWeight) e.wt = 1; // priced per kg at the counter
      // Smaller pack for small households: cheapest outlay among packs well under the main one
      const small = list.filter(x => !x.byWeight && x.pk <= best.pk * .75 && x.per <= best.per * 1.8).sort((a, b) => a.p - b.p)[0];
      if (small && !best.byWeight) e.alt = [small.pk, small.p, small.f.name];
      if (best.f.special) { e.sp = 1; if (best.f.was) e.was = best.f.was; }
      out[store][id] = e; set++;
      if (prev && Math.abs(best.per / (prev.p / (prev.pk || ING[id].pk)) - 1) > .15) moves.push(`${store} ${ING[id].n}: ${(prev.p).toFixed(2)} -> ${best.p.toFixed(2)}`);
    } else if (prev) {
      // nothing found this week: keep last known price for up to 4 weeks
      if (Date.now() - Date.parse(prev.at) < 28 * 864e5) { out[store][id] = prev; kept++; }
    }
  }
}
const total = Object.keys(ING).length * 3;
console.log(`Set ${set} prices, kept ${kept} from earlier weeks, out of ${total}.`);
if (moves.length) console.log('Big moves:\n  ' + moves.join('\n  '));
if (!FIXTURE && set < total * .3) { console.error('Too few matches. The feed may have changed. Leaving the site prices alone.'); process.exit(1); }

if (DRY) { console.log(JSON.stringify(out, null, 1).slice(0, 3000)); process.exit(0); }

fs.writeFileSync(path.join(ROOT, 'js/prices.js'), `// Shelf prices, updated automatically every Wednesday (scripts/update-prices.mjs) and by hand from admin/prices.html.
// Each entry: p = shelf price, pk = pack size (in the ingredient's unit), name = product, at = date, sp = on special this week, was = normal price.
window.DOCKET_PRICES = ${JSON.stringify({ ...out, updated: today }, null, 2)};
`);

// Catalogue: every product seen, with history
const catPath = path.join(ROOT, 'data/catalogue.json');
const CAT = fs.existsSync(catPath) ? JSON.parse(fs.readFileSync(catPath, 'utf8')) : { products: {} };
for (const f of products) {
  const k = f.store + '|' + f.name.toLowerCase(); const prev = CAT.products[k];
  const h = prev ? prev.history.slice() : [];
  if (!h.length || h[h.length - 1].p !== f.price) { if (h.length && h[h.length - 1].at === today) h.pop(); h.push({ at: today, p: f.price }); }
  CAT.products[k] = { store: f.store, name: f.name, price: f.price, unit: f.unit, was: f.was ? { p: f.was } : null, special: f.special, search: f.keyword || '', ingredient: (prev && prev.ingredient) || bestIng(f.name), url: f.url || '', first: prev ? prev.first : today, last: today, history: h.slice(-52) };
}
CAT.updated = today;
fs.writeFileSync(catPath, JSON.stringify(CAT));

// Cache tag so browsers pick up the new prices
for (const file of ['index.html', 'plan.html', 'admin/prices.html']) {
  const p = path.join(ROOT, file); if (!fs.existsSync(p)) continue;
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/(prices\.js\?v=)\d+/g, `$1${today.replace(/-/g, '')}0600`));
}
console.log('Wrote js/prices.js and data/catalogue.json');
