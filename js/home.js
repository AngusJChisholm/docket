// Homepage: hero docket, Kit Tax calculator, cheap-wins cards and the sign-up form.
(function () {
  const $ = s => document.querySelector(s);
  const CFG = window.DOCKET_CONFIG || {};
  const STAPLES = CFG.staplesPerWeek ?? 15;
  const money = (v, d = 2) => '$' + v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const LOGO = document.querySelector('.logo').innerHTML;

  // Cost and protein per serve at Coles, no GF swaps (same maths as the planner).
  const serveCost = r => r.i.reduce((s, [id, q]) => s + q / ING[id].pk * ING[id].p, 0);
  const serveProt = r => r.i.reduce((s, [id, q]) => { const it = ING[id]; return s + (it.u === 'ea' ? q * it.pr : q * it.pr / 100); }, 0);
  const AVG = R.reduce((s, r) => s + serveCost(r), 0) / R.length;

  function week(people, dinners, lunch) {
    const perMeal = people * (lunch ? 2 : 1);
    const serves = perMeal * dinners;
    const docket = serves * AVG + STAPLES;
    const kits = KITS_DEFAULT.map(k => ({ n: k.n, v: serves * k.ps + k.del * Math.ceil(perMeal / k.max) }));
    return { serves, docket, kits, perMeal };
  }

  function docketHTML(w, label) {
    const hf = w.kits[0];
    const saved = hf.v - w.docket;
    const cheaper = w.kits.filter(k => k.v < w.docket).map(k => esc(k.n));
    return `<p class="dk-brand" aria-hidden="true">${LOGO}</p>
      <p class="dk-meta">${label} · ${w.serves} serves · Coles</p>
      <hr class="rule">
      <p class="kt-head">THE KIT TAX · SAME SERVES</p>
      <div class="lines">
        <div class="ln us"><span>Docket (est.)</span><span>${money(w.docket)}</span></div>
        ${w.kits.map(k => `<div class="ln kit"><span>${esc(k.n)}</span><span>${money(k.v)}</span></div>`).join('')}
      </div>
      ${saved > 0 ? `<div class="dodged"><span>KIT TAX DODGED</span><b class="num">${money(saved)}</b></div>
      <p class="kt-save num">vs ${esc(hf.n)}. That's ${money(saved * 52, 0)} a year.</p>` : ''}
      ${cheaper.length ? `<p class="kt-note">${cheaper.join(', ')} is cheaper on price alone, with smaller serves and less protein.</p>` : ''}`;
  }

  // Hero: the share house week
  const heroW = week(5, 5, true);
  $('#hero-docket').innerHTML = docketHTML(heroW, '5 people · 5 dinners + lunches');
  $('#hero-serve').textContent = money(heroW.docket / heroW.serves);

  // Calculator
  const C = { people: 5, dinners: 5, lunch: true };
  function renderCalc() {
    $('#c-people').textContent = C.people; $('#c-din').textContent = C.dinners;
    $('#c-people-dn').disabled = C.people <= 1; $('#c-people-up').disabled = C.people >= 10;
    $('#c-din-dn').disabled = C.dinners <= 1; $('#c-din-up').disabled = C.dinners >= 7;
    const w = week(C.people, C.dinners, C.lunch);
    $('#calc-docket').innerHTML = docketHTML(w, `${C.people} ${C.people === 1 ? 'person' : 'people'} · ${C.dinners} dinners${C.lunch ? ' + lunches' : ''}`);
    const saved = w.kits[0].v - w.docket;
    $('#c-year').textContent = saved > 0 ? money(saved * 52, 0) + ' a year' : '$0';
    $('#c-year-sub').textContent = saved > 0 ? `That's ${money(saved, 0)} a week compared with ${w.kits[0].n}.` : '';
  }
  const bump = (k, d, lo, hi) => () => { C[k] = Math.max(lo, Math.min(hi, C[k] + d)); renderCalc(); };
  $('#c-people-dn').onclick = bump('people', -1, 1, 10); $('#c-people-up').onclick = bump('people', 1, 1, 10);
  $('#c-din-dn').onclick = bump('dinners', -1, 1, 7); $('#c-din-up').onclick = bump('dinners', 1, 1, 7);
  $('#c-lunch').onchange = e => { C.lunch = e.target.checked; renderCalc(); };
  renderCalc();

  // Cheap wins: the six cheapest dinners with 40g+ protein
  const wins = R.filter(r => serveProt(r) >= 40).sort((a, b) => serveCost(a) - serveCost(b)).slice(0, 6);
  const time = r => r.t >= 120 ? `${+(r.t / 60).toFixed(1)} hr · ${r.h} min hands-on` : `${r.t} min`;
  $('#dinner-cards').innerHTML = wins.map(r => `<article class="card">
      <div class="card-top"><div><h3>${esc(r.n)}</h3><div class="meta">${esc(r.c)} · ${time(r)}</div></div>
      <div class="ticket num"><b>${money(serveCost(r))}</b><small>per serve</small></div></div>
      <div class="badges"><span class="badge p num">${Math.round(serveProt(r))}g protein</span><span class="badge">${r.i.some(([id]) => GFSWAP[id]) ? 'GF swap' : 'Gluten free'}</span></div>
    </article>`).join('');

  // Sign-up form
  $('#join-form').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = $('#join-msg'); const email = $('#join-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Pop in an email address like you@example.com.'; return; }
    if (!CFG.waitlistEndpoint) { msg.textContent = "Sign-ups open in a few days. Check back soon!"; return; }
    msg.textContent = 'Signing you up...';
    try {
      const res = await fetch(CFG.waitlistEndpoint, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'docket-home' }) });
      if (!res.ok) throw new Error(res.status);
      msg.textContent = "You're in. First docket lands Wednesday."; e.target.reset();
    } catch (err) { msg.textContent = "That didn't go through. Try again in a minute."; }
  });
})();
