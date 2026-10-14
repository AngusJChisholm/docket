// Seasons and this week's picks. Shared by the homepage and the planner.
// PEAK = months a fruit or veg is at its best and cheapest in south-east Australia (1 = Jan).
// Anything not listed (onions, potatoes, carrots, garlic, herbs in pots) is steady all year.
window.DOCKET_SEASON = (function () {
  const PEAK = {
    asparagus: [9, 10, 11, 12], broccoli: [5, 6, 7, 8, 9, 10], broccolini: [5, 6, 7, 8, 9, 10, 11],
    capsicum: [12, 1, 2, 3, 4, 5], zucchini: [11, 12, 1, 2, 3, 4], cherrytom: [12, 1, 2, 3, 4],
    cucumber: [11, 12, 1, 2, 3, 4], eggplant: [12, 1, 2, 3, 4], greenbeans: [11, 12, 1, 2, 3, 4],
    corncob: [12, 1, 2, 3], pumpkin: [3, 4, 5, 6, 7, 8], cabbage: [5, 6, 7, 8, 9],
    avocado: [4, 5, 6, 7, 8, 9, 10, 11], lemon: [5, 6, 7, 8, 9, 10], lime: [1, 2, 3, 4, 5, 6],
    apple: [3, 4, 5, 6, 7], swpotato: [3, 4, 5, 6, 7, 8, 9], mushroom: [4, 5, 6, 7, 8],
    snowpeas: [9, 10, 11, 12], peas_fresh: [9, 10, 11, 12], strawberry: [10, 11, 12, 1],
    mango: [11, 12, 1, 2], thaibasil: [12, 1, 2, 3], coriander: [4, 5, 6, 7, 8, 9, 10],
    mint: [10, 11, 12, 1, 2, 3, 4], bokchoy: [5, 6, 7, 8, 9, 10], spinach: [5, 6, 7, 8, 9, 10],
    cos: [9, 10, 11, 12, 1, 2, 3], iceberg: [10, 11, 12, 1, 2, 3], rocket: [9, 10, 11, 4, 5]
  };
  const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  // ?date=2027-01-20 on any page previews another week (handy for testing)
  const now = () => { try { const q = new URLSearchParams(location.search).get('date'); if (q) return new Date(q + 'T12:00'); } catch (e) {} return new Date(); };
  const month = d => (d || now()).getMonth() + 1;
  const status = (id, m) => PEAK[id] ? (PEAK[id].includes(m || month()) ? 1 : -1) : 0;
  // Estimates only: in-season produce a little cheaper, out of season a fair bit dearer. Live prices already know.
  const factor = (id, m) => { const s = status(id, m); return s > 0 ? .9 : s < 0 ? 1.18 : 1; };
  function recipe(r, m) {
    const inn = [], out = [];
    r.i.forEach(([id]) => { const s = status(id, m); if (s > 0) inn.push(id); else if (s < 0) out.push(id); });
    return { inn, out, score: inn.length - out.length * 1.5, isIn: inn.length > 0 && out.length === 0 };
  }
  // The Docket week runs Wednesday to Tuesday, when the specials flip
  function weekStart(d) { const x = new Date(d || now()); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 4) % 7)); return x; }
  const key = d => weekStart(d).toISOString().slice(0, 10);
  const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };
  const isNew = r => r.added && (now() - new Date(r.added + 'T00:00')) < 35 * 864e5;
  const quick = r => r.t <= 30;
  const mainProtein = r => { const m = r.i.find(([id]) => ING[id].a === 'M' || id === 'prawns' || id === 'eggs' || id === 'tofu'); return m ? m[0].replace(/_.*/, '') : 'veg'; };

  // Five dinners for the week: quick, good value and in season, one Premium, one Lighter, three Everyday,
  // all different proteins, with a fresh mix each Wednesday and nothing straight from last week.
  // Weeks are worked out in order from launch, so each week knows exactly what the last two weeks showed
  const EPOCH = new Date('2026-10-14T12:00');
  function picks(cost, opts) {
    opts = opts || {};
    const target = weekStart(opts.date || now());
    const pool = R.filter(r => !r.big && (!opts.allowed || opts.allowed(r)));
    const costs = pool.map(cost).sort((a, b) => a - b); const mid = costs[Math.floor(costs.length / 2)] || 1;
    const hist = [];
    let d = target < EPOCH ? target : EPOCH;
    for (;;) {
      const p = pickWeek(pool, cost, mid, d, hist.slice(-2).flat());
      if (d >= target) return p;
      hist.push(p); d = new Date(d.getTime() + 7 * 864e5);
    }
  }
  function pickWeek(pool, cost, mid, d, last) {
    const wk = key(d); const m = month(d);
    const score = r => {
      const t = r.t <= 25 ? 1.6 : r.t <= 30 ? 1.3 : r.t <= 40 ? .6 : r.t <= 60 ? 0 : -1;
      return (mid - cost(r)) / mid * 5 + t + recipe(r, m).score * .7 + (isNew(r) ? 1.2 : 0) + hash(wk + r.id) * 2.2 - (last.includes(r.id) ? 8 : 0);
    };
    const ranked = pool.map(r => ({ r, s: score(r) })).sort((a, b) => b.s - a.s).map(x => x.r);
    const out = [], prots = new Set(), cats = new Set();
    const take = (want, n) => { for (const r of ranked) { if (n <= 0) break; if ((r.tier || 'everyday') !== want || out.includes(r)) continue; const p = mainProtein(r); if (prots.has(p) || cats.has(r.c + want)) continue; out.push(r); prots.add(p); cats.add(r.c + want); n--; } };
    take('premium', 1); take('lighter', 1); take('everyday', 3);
    for (const r of ranked) { if (out.length >= 5) break; if (!out.includes(r)) out.push(r); }
    // Cheapest first reads well on a menu, but keep Premium last as the treat
    return out.sort((a, b) => (a.tier === 'premium') - (b.tier === 'premium') || cost(a) - cost(b)).map(r => r.id);
  }
  function inSeasonNames(m) {
    const names = Object.keys(PEAK).filter(id => typeof ING !== 'undefined' && ING[id] && PEAK[id].includes(m || month()));
    return names.map(id => ING[id].n.replace(/\s*\([^)]*\)/, '').replace(/^(Baby|Washed|Red|Continental|Cup|Long red|Fresh|Green|Brown) /i, '').toLowerCase());
  }
  const weekLabel = d => weekStart(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  return { PEAK, MONTH, now, month, status, factor, recipe, weekStart, key, picks, isNew, quick, inSeasonNames, weekLabel };
})();
