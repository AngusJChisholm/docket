// Homepage: hero docket, collections, Kit Tax calculator, cheapest dinners list and the sign-up form.
(function () {
  const $ = s => document.querySelector(s);
  const CFG = window.DOCKET_CONFIG || {};
  const STAPLES = CFG.staplesPerWeek ?? 15;
  const money = (v, d = 2) => '$' + v.toLocaleString('en-AU', { minimumFractionDigits: d, maximumFractionDigits: d });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const LOGO = document.querySelector('.logo').innerHTML;

  // Cost and protein per serve at Coles, no GF swaps (same maths as the planner).
  const COLES = (window.DOCKET_PRICES || {}).coles || {};
  const SEA = window.DOCKET_SEASON;
  const cp = id => COLES[id] ? { p: COLES[id].p, pk: COLES[id].pk || ING[id].pk } : { p: ING[id].p * (SEA ? SEA.factor(id) : 1), pk: ING[id].pk };
  const serveCost = r => r.i.reduce((s, [id, q]) => { const c = cp(id); return s + q / c.pk * c.p; }, 0);
  const serveProt = r => r.i.reduce((s, [id, q]) => { const it = ING[id]; return s + (it.u === 'ea' ? q * it.pr : q * it.pr / 100); }, 0);
  const AVG = R.reduce((s, r) => s + serveCost(r), 0) / R.length;
  const AVGP = Math.round(R.reduce((s, r) => s + serveProt(r), 0) / R.length);

  function week(people, dinners, lunch) {
    const perMeal = people * (lunch ? 2 : 1);
    const serves = perMeal * dinners;
    const docket = serves * AVG + STAPLES;
    const kits = KITS.filter(k => !k.ready).map(k => ({ n: k.n, v: kitCost(k, perMeal, dinners) }));
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
      ${cheaper.length ? `<p class="kt-note">${cheaper.join(' and ')} ${cheaper.length > 1 ? 'are' : 'is'} cheaper on price alone. Docket dinners average ${AVGP}g protein a serve.</p>` : ''}`;
  }

  // Hero: an example week, set like a menu
  const tierOf = r => r.tier || 'everyday';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hf = KITS[0];
  // Meal kits sell 2- or 4-person boxes, so small households still pay for at least 2 serves a meal
  let HH = 4, LUNCH = true;
  function weekOf(pick, people = HH, lunch = LUNCH) {
    const perMeal = people * (lunch ? 2 : 1), serves = perMeal * pick.length;
    const total = pick.reduce((s, r) => s + serveCost(r) * perMeal, 0) + STAPLES;
    const kit = kitCost(hf, perMeal, pick.length);
    return { total, kit, serves };
  }
  let current = null;
  function renderMenu(pick, animate) {
    const w = weekOf(pick);
    current = pick;
    const isPicks = pick === PICKS;
    if (!$('#mc-body')) {
      $('#menu-card').innerHTML = `<p class="mc-eyebrow" id="mc-title"></p>
        <div class="mc-ctl">
          <label class="mc-slide" for="mc-people"><span>Cooking for <b id="mc-people-v"></b></span>
            <input type="range" id="mc-people" min="1" max="8" step="1" value="${HH}" aria-label="How many people you're cooking for"></label>
          <label class="mc-tick"><input type="checkbox" id="mc-lunch" ${LUNCH ? 'checked' : ''}><span>Cook double for next-day lunches</span></label>
        </div>
        <div id="mc-body"></div>`;
      const sl = $('#mc-people');
      sl.addEventListener('input', () => { HH = +sl.value; renderMenu(current, false); });
      $('#mc-lunch').addEventListener('change', e => { LUNCH = e.target.checked; renderMenu(current, false); });
    }
    $('#mc-title').textContent = isPicks ? "This week's picks" : 'Your shuffled week';
    $('#mc-people-v').textContent = `${HH} ${HH === 1 ? 'person' : 'people'}`;
    $('#mc-people').style.setProperty('--fill', ((HH - 1) / 7 * 100) + '%');
    const dodged = w.kit - w.total;
    $('#mc-body').innerHTML = `<ol class="mc-list${animate ? ' deal' : ''}">${pick.map((r, i) => `<li style="--i:${i}"><span class="mc-day">${days[i]}</span><span class="mc-dish">${esc(r.n)}${tierOf(r) !== 'everyday' ? ` <span class="tier ${tierOf(r) === 'premium' ? 'prem' : 'light'}">${tierOf(r) === 'premium' ? 'Premium' : 'Lighter'}</span>` : ''}</span><span class="mc-lead" aria-hidden="true"></span><span class="mc-pr num">${money(serveCost(r))}</span></li>`).join('')}</ol>
      <div class="mc-foot"><span>Food for the week · ${w.serves} serves</span><b class="num">${money(w.total, 0)}</b></div>
      ${dodged > 0 ? `<div class="mc-dodge"><span>Kit Tax dodged</span><b class="num">${money(dodged, 0)}</b></div>` : ''}
      ${isPicks && SEA ? `<p class="mc-season">Week of ${SEA.weekLabel()}. Quick, good value and built around what's in season: <b>${esc(SEA.inSeasonNames().slice(0, 5).join(', '))}</b>.</p>` : ''}`;
    $('#hero-serve').textContent = money(w.total / w.serves);
    const tk = document.querySelector('.hang .ticket'); if (animate && tk && !reduce) { tk.classList.remove('bump'); void tk.offsetWidth; tk.classList.add('bump'); }
  }
  // A balanced random week: one premium, one lighter, three everyday, under $400 for five
  function randomWeek() {
    const by = t => R.filter(r => tierOf(r) === t && serveProt(r) >= 40);
    const sample = (arr, n) => arr.slice().sort(() => Math.random() - .5).slice(0, n);
    for (let tries = 0; tries < 40; tries++) {
      const pick = sample([...sample(by('premium'), 1), ...sample(by('lighter'), 1), ...sample(by('everyday'), 3)], 5);
      if (weekOf(pick, 5).total < 400) return pick;
    }
    return sample(by('everyday'), 5);
  }
  const fixed = ['chook', 'misosalmon', 'butter', 'poke', 'carnitas'].map(id => R.find(r => r.id === id)).filter(Boolean);
  const PICKS = SEA ? SEA.picks(serveCost, { allowed: r => serveProt(r) >= 40 }).map(id => R.find(r => r.id === id)) : fixed;
  const start = PICKS;
  renderMenu(start, false);
  $('#shuffle').onclick = () => renderMenu(randomWeek(), true);

  // Collections
  const COLS = [
    { k: 'everyday', t: 'Everyday', d: 'Butter chicken, tacos, fried rice. The ones you end up cooking on repeat.' },
    { k: 'premium', t: 'Premium', d: 'Scotch fillet, lamb cutlets, miso salmon. Still well under meal kit prices.' },
    { k: 'lighter', t: 'Lighter', d: 'Lean protein and a lot of veg. Nothing fried or creamy.' }];
  $('#col-grid').innerHTML = COLS.map(c => {
    const rs = R.filter(r => tierOf(r) === c.k); const costs = rs.map(serveCost);
    const eg = rs.slice().sort((a, b) => serveCost(b) - serveCost(a)).slice(0, 3).map(r => esc(r.n));
    const ci = ((window.DOCKET_IMG || {}).collections || {})[c.k];
    return `<a class="col-card col-${c.k}${ci ? ' has-img' : ''}" href="plan.html#${c.k}">${ci ? `<span class="col-img"><img src="assets/img/food/${ci}-640.jpg" alt="" loading="lazy"></span>` : ''}<h3>${c.t}</h3><p>${c.d}</p>
      <ul>${eg.map(n => `<li>${n}</li>`).join('')}</ul><span class="col-from">${rs.length} dinners, from <b class="num">${money(Math.min(...costs))}</b> a serve</span></a>`;
  }).join('');

  // Calculator
  const C = { people: 5, dinners: 5, lunch: true };
  function renderCalc() {
    $('#c-people').textContent = C.people; $('#c-din').textContent = C.dinners;
    $('#c-people-dn').disabled = C.people <= 1; $('#c-people-up').disabled = C.people >= 8;
    $('#c-din-dn').disabled = C.dinners <= 1; $('#c-din-up').disabled = C.dinners >= 7;
    const w = week(C.people, C.dinners, C.lunch);
    $('#calc-docket').innerHTML = docketHTML(w, `${C.people} ${C.people === 1 ? 'person' : 'people'} · ${C.dinners} dinners${C.lunch ? ' + lunches' : ''}`);
    const saved = w.kits[0].v - w.docket;
    $('#c-year').textContent = saved > 0 ? money(saved * 52, 0) + ' a year' : '$0';
    $('#c-year-sub').textContent = saved > 0 ? `That's ${money(saved, 0)} a week compared with ${w.kits[0].n}.` : '';
  }
  const bump = (k, d, lo, hi) => () => { C[k] = Math.max(lo, Math.min(hi, C[k] + d)); renderCalc(); };
  $('#c-people-dn').onclick = bump('people', -1, 1, 10); $('#c-people-up').onclick = bump('people', 1, 1, 8);
  $('#c-din-dn').onclick = bump('dinners', -1, 1, 7); $('#c-din-up').onclick = bump('dinners', 1, 1, 7);
  $('#c-lunch').onchange = e => { C.lunch = e.target.checked; renderCalc(); };
  renderCalc();

  // Cheap wins: the six cheapest dinners with 40g+ protein
  const wins = R.filter(r => serveProt(r) >= 40 && !r.tier).sort((a, b) => serveCost(a) - serveCost(b)).slice(0, 6);
  const time = r => r.t >= 120 ? `${+(r.t / 60).toFixed(1)} hr (${r.h} min hands-on)` : `${r.t} min`;
  $('#dinner-cards').innerHTML = wins.map(r => `<li>
      <div class="w-name"><h3>${esc(r.n)}</h3><p>${esc(r.c)}, ${time(r)}. ${Math.round(serveProt(r))}g protein. ${r.i.some(([id]) => GFSWAP[id]) ? 'GF with a swap.' : 'Gluten free.'}</p></div>
      <span class="w-lead" aria-hidden="true"></span><b class="w-pr num">${money(serveCost(r))}</b>
    </li>`).join('');

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
