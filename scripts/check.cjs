// Quality gate: run before publishing any recipe or pricing change.  node scripts/check.cjs
// Fails (exit 1) on anything that would put a wrong number or a broken recipe in front of a customer.
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '..'); const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const mk = () => new Proxy(function () {}, { get: (t, k) => k === 'addEventListener' ? () => {} : k === Symbol.toPrimitive ? () => '' : mk(), set: () => true, apply: () => mk() });
global.document = { querySelector: () => mk(), querySelectorAll: () => [], createElement: () => mk(), body: mk() };
global.location = { hash: '', pathname: '/', search: '', href: 'https://angusjchisholm.github.io/docket/plan.html' }; global.localStorage = { getItem: () => null, setItem() {} };
class J { constructor() { this.n = 0; this.internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } }; } text(t) { if (/NaN|undefined/.test(String(t))) throw new Error('PDF text: ' + t); } splitTextToSize(t) { return [String(t)]; } getTextWidth(t) { return String(t).length * 2; } addPage() { this.n++; } getNumberOfPages() { return this.n + 1; } output() { return ''; } }
['setFont', 'setFontSize', 'setTextColor', 'setFillColor', 'setDrawColor', 'setLineWidth', 'rect', 'roundedRect', 'line', 'circle', 'save', 'setLineDashPattern', 'setPage'].forEach(m => J.prototype[m] = function () {});
global.window = { addEventListener() {}, DOCKET_CONFIG: { staplesPerWeek: 10 }, jspdf: { jsPDF: J } };
const fails = []; const warns = []; const fail = m => fails.push(m); const warn = m => warns.push(m);
global.fetch = async u => { const m = String(u).match(/content\/recipes\/([^.?]+)\.json/); const f = m && path.join(ROOT, 'content/recipes', decodeURIComponent(m[1]) + '.json'); return f && fs.existsSync(f) ? { ok: true, json: async () => JSON.parse(fs.readFileSync(f, 'utf8')) } : { ok: false, status: 404 }; };
eval(rd('js/data.js') + rd('js/prices.js') + rd('js/season.js') + rd('js/recipes.js') + rd('js/planner.js') + rd('js/pdf.js') + `
(async () => {
  // 1. Recipe shape (public menu in js/data.js, method in content/recipes/<id>.json)
  const ids = new Set();
  for (const pub of R) {
    if (pub.m || pub.l || pub.g) fail(pub.id + ' has method/lunch/GF text in js/data.js: it belongs in content/recipes/' + pub.id + '.json');
    const cf = path.join(ROOT, 'content/recipes', pub.id + '.json');
    if (!fs.existsSync(cf)) { fail(pub.id + ' missing content/recipes/' + pub.id + '.json'); continue; }
    const r = { ...pub, ...JSON.parse(fs.readFileSync(cf, 'utf8')) };
    if (ids.has(r.id)) fail('duplicate id ' + r.id); ids.add(r.id);
    for (const k of ['id', 'n', 'c', 't', 'd', 'i', 'm', 'l', 'g']) if (r[k] == null || r[k] === '') fail(r.id + ' missing ' + k);
    if (r.tier && !['premium', 'lighter'].includes(r.tier)) fail(r.id + ' bad tier ' + r.tier);
    if (r.m && (r.m.length < 5 || r.m.length > 8)) fail(r.id + ' needs 5 to 8 method steps (has ' + r.m.length + ')');
    if (r.t >= 120 && !r.h) fail(r.id + ' slow cook needs h (hands-on minutes)');
    for (const [i, q] of r.i || []) { if (!ING[i]) fail(r.id + ' unknown ingredient ' + i); if (!(q > 0)) fail(r.id + ' bad amount for ' + i); }
    if (r.added && !/^\\d{4}-\\d{2}-\\d{2}$/.test(r.added)) fail(r.id + ' added must be YYYY-MM-DD');
    const p = serveProt(r); if (p < 35 && !/veg|chickpea|curry/i.test(r.n)) warn(r.id + ' only ' + Math.round(p) + 'g protein');
    const steps = (r.m || []).map(x => typeof x === 'string' ? { h: '', s: x } : x);
    steps.forEach((st, k) => {
      if (!st || typeof st.s !== 'string' || !st.s) fail(r.id + ' step ' + (k + 1) + ' has no text');
      for (const [, id] of String(st.s).matchAll(/\\{(\\w+)(?:\\*[\\d.]+)?\\}/g)) if (!(r.i || []).some(([i]) => i === id)) fail(r.id + ' step ' + (k + 1) + ' marker {' + id + '} is not one of its ingredients');
    });
    const text = [r.n, r.d, r.l, r.g, ...steps.map(st => st.h + ' ' + st.s)].join(' ');
    if (/—|–/.test(text)) fail(r.id + ' has an em/en dash');
    if (/\\b(elevate|unlock|seamless|journey|foodie|hack|delve)\\b/i.test(text)) fail(r.id + ' uses banned wording');
  }
  for (const [a, b] of Object.entries(GFSWAP)) if (!ING[a] || !ING[b]) fail('GFSWAP ' + a + ' -> ' + b + ' unknown');
  // 2. Every recipe at 1 to 8 people, with and without lunch, at every store
  for (const store of ['coles', 'woolies', 'aldi']) for (const r of R) for (let p = 1; p <= 8; p++) for (const lunch of [false, true]) {
    Object.assign(S, { store, people: p, gf: Math.min(2, p), lunch, sel: [r.id], dinners: 1 });
    const w = week(); const n = spm();
    if (!isFinite(w.total) || !isFinite(w.eaten)) fail(r.id + ' NaN total');
    if (p > 1 && w.eaten / w.serves > 25) fail(r.id + ' over $25 a serve at ' + p + ' people');
    for (const x of w.items) {
      if (!isFinite(x.cost) || x.cost < 0) fail(r.id + ' bad cost ' + x.id);
      if (!x.pan && !x.label) fail('no pack label ' + x.id);
      if (x.bought !== undefined && x.bought + 1e-6 < x.amt) fail('buys less than needed ' + x.id);
    }
    for (const [i, a] of splitLines(r, n)) { const k = kAmt(i, a); if (/NaN|undefined/.test(k)) fail(r.id + ' odd amount ' + i + ' ' + k); }
  }
  // 3. Random weeks: budget and Kit Tax
  let over = 0, beats = 0; const N = 2000;
  for (let t = 0; t < N; t++) {
    Object.assign(S, { people: 1 + (t % 8), lunch: t % 3 !== 0, gf: t % 4 === 0 ? 2 : 0, dinners: 3 + (t % 5), store: ['coles', 'woolies', 'aldi'][t % 3] });
    S.gf = Math.min(S.gf, S.people);
    S.sel = R.slice().sort(() => Math.random() - .5).slice(0, S.dinners).map(r => r.id);
    const w = week(); if (w.total > autoBudget()) over++; if (kitCost(KITS[0], spm(), S.sel.length) > w.eaten) beats++;
  }
  if (over / N > .3) fail('suggested budget too low: ' + Math.round(over / N * 100) + '% of random weeks go over');
  if (beats / N < .95) fail('Docket only beats HelloFresh in ' + Math.round(beats / N * 100) + '% of weeks');
  // 4. Angus's flat: 5 people, 2 GF, lunches, 4 dinners, under $400
  Object.assign(S, { people: 5, gf: 2, lunch: true, dinners: 4, sel: ['butter', 'tuscan', 'carnitas', 'friedrice'].filter(id => R.some(r => r.id === id)), store: 'coles' });
  const flat = week(); if (flat.total > 400) fail('flat week costs $' + flat.total.toFixed(0));
  // 5. Weekly picks: five dinners, no repeats from last week
  const pk = weekPicks(); if (pk.length < 5) fail('weekly picks only found ' + pk.length);
  const lastWk = window.DOCKET_SEASON.picks(serveCostColes, { date: new Date(Date.now() - 7 * 864e5), allowed: r => serveProt(r) >= 40 });
  if (pk.some(id => lastWk.includes(id))) warn('a pick repeats from last week');
  // 6. PDFs for the newest five dinners, locked and unlocked
  Object.assign(S, { people: 3, gf: 1, sel: R.slice(-5).map(r => r.id), dinners: 5 });
  let out = await DocketPDF.build(S, 'split'); if (out.files.length !== 6) fail('PDF build (locked) made ' + out.files.length + ' files');
  out = await DocketPDF.build(S, 'one'); if (out.files.length !== 1 || out.files[0].doc.getNumberOfPages() < 6) fail('one-PDF build (locked) wrong: ' + out.files.length + ' files');
  await window.DocketRecipes.load(S.sel);
  out = await DocketPDF.build(S, 'split'); if (out.files.length !== 6) fail('PDF build made ' + out.files.length + ' files');
  out = await DocketPDF.build(S, 'one'); if (out.files.length !== 1 || out.files[0].doc.getNumberOfPages() < 6) fail('one-PDF build wrong: ' + out.files.length + ' files');
  // 7. Locked recipes stay locked: no method content in the public files
  if (rd('js/data.js').includes("m:['")) fail('method text found in js/data.js');
  const orphans = fs.readdirSync(path.join(ROOT, 'content/recipes')).filter(f => !R.some(r => r.id + '.json' === f));
  if (orphans.length) warn('content files with no recipe: ' + orphans.join(', '));
  console.log('Recipes: ' + R.length + ' (' + R.filter(r => r.tier === 'premium').length + ' premium, ' + R.filter(r => r.tier === 'lighter').length + ' lighter, ' + R.filter(r => r.t <= 30).length + ' quick)');
  console.log('Random weeks over budget: ' + Math.round(over / N * 100) + '%. Beat HelloFresh: ' + Math.round(beats / N * 100) + '%. Flat week: $' + flat.total.toFixed(0));
  console.log("This week's picks: " + pk.map(id => R.find(r => r.id === id).n).join(', '));
  warns.forEach(w => console.log('warn: ' + w));
  if (fails.length) { console.log('\\nFAILED (' + fails.length + '):'); [...new Set(fails)].slice(0, 40).forEach(f => console.log('  ' + f)); process.exit(1); }
  console.log('All checks passed.');
})().catch(e => { console.log('FAILED: ' + e.message); process.exit(1); });
`);
