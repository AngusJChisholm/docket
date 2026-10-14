// Homepage: hero docket, Kit Tax calculator, cheap-wins cards and the sign-up form.
(function () {
  const $ = s => document.querySelector(s);
  const CFG = window.DOCKET_CONFIG || {};
  const STAPLES = CFG.staplesPerWeek ?? 15;
  const money = (v, d = 2) => '$' + v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const LOGO = document.querySelector('.logo').innerHTML;

  // Cost and protein per serve at Coles, no GF swaps (same maths as the planner).
  const COLES = (window.DOCKET_PRICES || {}).coles || {};
  const cp = id => COLES[id] ? { p: COLES[id].p, pk: COLES[id].pk || ING[id].pk } : { p: ING[id].p, pk: ING[id].pk };
  const serveCost = r => r.i.reduce((s, [id, q]) => { const c = cp(id); return s + q / c.pk * c.p; }, 0);
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

  // Hero: an example week, set like a menu
  const tierOf = r => r.tier || 'everyday';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hf = KITS_DEFAULT[0];
  function weekOf(pick) {
    const serves = 10 * pick.length;
    const total = pick.reduce((s, r) => s + serveCost(r) * 10, 0) + STAPLES;
    const kit = serves * hf.ps + hf.del * Math.ceil(10 / hf.max);
    return { total, kit, serves };
  }
  function renderMenu(pick, animate) {
    const w = weekOf(pick);
    $('#menu-card').innerHTML = `<p class="mc-eyebrow">This week's menu</p><p class="mc-sub">5 people · dinners + next-day lunches</p>
      <ol class="mc-list${animate ? ' deal' : ''}">${pick.map((r, i) => `<li style="--i:${i}"><span class="mc-day">${days[i]}</span><span class="mc-dish">${esc(r.n)}${tierOf(r) !== 'everyday' ? ` <span class="tier ${tierOf(r) === 'premium' ? 'prem' : 'light'}">${tierOf(r) === 'premium' ? 'Premium' : 'Lighter'}</span>` : ''}</span><span class="mc-lead" aria-hidden="true"></span><span class="mc-pr num">${money(serveCost(r))}</span></li>`).join('')}</ol>
      <div class="mc-foot"><span>Estimated shop</span><b class="num">${money(w.total, 0)}</b></div>
      <div class="mc-dodge"><span>Kit Tax dodged</span><b class="num">${money(w.kit - w.total, 0)}</b></div>`;
    $('#hero-serve').textContent = money(w.total / w.serves);
    const tk = document.querySelector('.hang .ticket'); if (animate && tk && !reduce) { tk.classList.remove('bump'); void tk.offsetWidth; tk.classList.add('bump'); }
  }
  // A balanced random week: one premium, one lighter, three everyday, under $400 for five
  function randomWeek() {
    const by = t => R.filter(r => tierOf(r) === t && serveProt(r) >= 40);
    const sample = (arr, n) => arr.slice().sort(() => Math.random() - .5).slice(0, n);
    for (let tries = 0; tries < 40; tries++) {
      const pick = sample([...sample(by('premium'), 1), ...sample(by('lighter'), 1), ...sample(by('everyday'), 3)], 5);
      if (weekOf(pick).total < 400) return pick;
    }
    return sample(by('everyday'), 5);
  }
  const start = ['chook', 'misosalmon', 'butter', 'poke', 'carnitas'].map(id => R.find(r => r.id === id)).filter(Boolean);
  renderMenu(start, false);
  $('#shuffle').onclick = () => renderMenu(randomWeek(), true);

  // Ribbon of dinners
  const pill = r => `<span class="rb-pill rb-${tierOf(r)}">${esc(r.n)}</span>`;
  const half = Math.ceil(R.length / 2);
  const rowA = R.slice(0, half), rowB = R.slice(half);
  $('#ribbon-a').innerHTML = `<div class="rb-track">${rowA.map(pill).join('')}${rowA.map(pill).join('')}</div>`;
  $('#ribbon-b').innerHTML = `<div class="rb-track">${rowB.map(pill).join('')}${rowB.map(pill).join('')}</div>`;

  // Numbers band
  const flat = weekOf(start);
  const N = { 'n-dinners': R.length, 'n-cheap': Math.min(...R.map(serveCost)), 'n-prot': Math.round(R.reduce((s, r) => s + serveProt(r), 0) / R.length), 'n-year': Math.round((flat.kit - flat.total) * 52) };
  const fmtN = (el, v) => { const dp = el.dataset.dp != null ? +el.dataset.dp : (el.dataset.money ? 2 : 0); el.textContent = el.dataset.money ? money(v, dp) : Math.round(v).toLocaleString('en-AU') + (el.dataset.suffix || ''); };
  Object.entries(N).forEach(([id, v]) => { const el = document.getElementById(id); el.dataset.to = v; fmtN(el, v); });
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; io.unobserve(e.target);
      const el = e.target, to = +el.dataset.to, t0 = performance.now(), dur = 1100;
      const step = t => { const k = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - k, 3); fmtN(el, to * ease); if (k < 1) requestAnimationFrame(step); else fmtN(el, to); };
      requestAnimationFrame(step);
    }), { threshold: .6 });
    document.querySelectorAll('.count').forEach(el => io.observe(el));
  }

  // Collections
  const COLS = [
    { k: 'everyday', t: 'Everyday', d: 'The staples. Big flavour, big serves, best value.' },
    { k: 'premium', t: 'Premium', d: 'Restaurant nights at home: scotch fillet, lamb cutlets, miso salmon.' },
    { k: 'lighter', t: 'Lighter', d: 'Lean protein and loads of veg. Nothing fried or creamy.' }];
  $('#col-grid').innerHTML = COLS.map(c => {
    const rs = R.filter(r => tierOf(r) === c.k); const costs = rs.map(serveCost);
    const eg = rs.slice().sort((a, b) => serveCost(b) - serveCost(a)).slice(0, 3).map(r => esc(r.n));
    const ci = ((window.DOCKET_IMG || {}).collections || {})[c.k];
    return `<a class="col-card col-${c.k}${ci ? ' has-img' : ''}" href="plan.html#${c.k}">${ci ? `<span class="col-img"><img src="assets/img/food/${ci}-640.jpg" alt="" loading="lazy"></span>` : ''}<span class="col-count">${rs.length} dinners</span><h3>${c.t}</h3><p>${c.d}</p>
      <ul>${eg.map(n => `<li>${n}</li>`).join('')}</ul><span class="col-from">From <b class="num">${money(Math.min(...costs))}</b> a serve</span></a>`;
  }).join('');

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
  const wins = R.filter(r => serveProt(r) >= 40 && !r.tier).sort((a, b) => serveCost(a) - serveCost(b)).slice(0, 6);
  const time = r => r.t >= 120 ? `${+(r.t / 60).toFixed(1)} hr · ${r.h} min hands-on` : `${r.t} min`;
  $('#dinner-cards').innerHTML = wins.map(r => `<article class="card">
      <div class="card-top"><div><h3>${esc(r.n)}</h3><div class="meta">${esc(r.c)} · ${time(r)}</div></div>
      <div class="ticket num"><b>${money(serveCost(r))}</b><small>per serve</small></div></div>
      ${r.d ? `<p class="blurb">${esc(r.d)}</p>` : ''}
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
