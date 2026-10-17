// Builds the Riversdale Fresh PDFs in the browser: one shopping list plus one PDF per recipe.
// Needs jsPDF (loaded on plan.html) and the planner's functions (week, splitLines, kAmt, ...).
const DocketPDF = window.DocketPDF = (function () {
  const C = { ink: [28, 33, 30], muted: [89, 98, 92], green: [31, 107, 71], mint: [207, 235, 216], butter: [255, 229, 138], peach: [255, 217, 203], markup: [169, 54, 23], line: [220, 227, 220] };
  const W = 210, H = 297, M = 16; // A4 in mm, margin
  let logo = null;

  async function loadLogo() {
    if (logo) return logo;
    try {
      return null; // text wordmark until there's a Riversdale Fresh logo image
    } catch (e) { logo = null; }
    return logo;
  }

  // jsPDF's built-in fonts only cover Latin-1, so swap the few characters that aren't in it.
  const clean = s => String(s).replace(/[≈]/g, '~').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...');
  const fill = (d, c) => d.setFillColor(c[0], c[1], c[2]);
  const text = (d, c) => d.setTextColor(c[0], c[1], c[2]);
  const draw = (d, c) => d.setDrawColor(c[0], c[1], c[2]);

  // Width of a string as jsPDF draws it: letter by letter (no kerning), with the real Helvetica width for
  // the fraction glyphs, which jsPDF's own table gets wrong.
  const FRW = { '¼': .834, '½': .834, '¾': .834 };
  function textW(d, str, size) { let w = 0; for (const ch of str) w += FRW[ch] ? FRW[ch] * size * 25.4 / 72 : d.getTextWidth(ch); return w; }
  // Word-wraps text that has bold runs marked \u0001...\u0002 into lines of {t, b} pieces.
  function richLines(d, str, width, size) {
    const words = []; let bold = false;
    String(str).split(/(\u0001|\u0002)/).forEach(part => {
      if (part === '\u0001') { bold = true; return; } if (part === '\u0002') { bold = false; return; }
      (bold ? part.split(/(\s+$)/) : part.split(/(\s+)/)).forEach(w => { if (w && !/^\s+$/.test(w)) words.push({ t: clean(w), b: bold }); else if (w && words.length) words[words.length - 1].sp = true; });
    });
    const lines = [[]]; let x = 0;
    d.setFontSize(size); d.setFont('helvetica', 'normal'); const space = textW(d, ' ', size);
    words.forEach(w => {
      d.setFont('helvetica', w.b ? 'bold' : 'normal'); const ww = textW(d, w.t, size);
      if (x > 0 && x + ww > width) { lines.push([]); x = 0; }
      lines[lines.length - 1].push({ t: w.t, b: w.b, x }); x += ww + (w.sp ? space : 0);
    });
    return lines;
  }
  function drawRich(d, lines, x0, y, lh) {
    lines.forEach((ln, i) => ln.forEach(p => { d.setFont('helvetica', p.b ? 'bold' : 'normal'); d.text(p.t, x0 + p.x, y + i * lh); }));
  }

  function header(d, title, sub) {
    fill(d, C.mint); d.roundedRect(M, M, W - 2 * M, 30, 5, 5, 'F');
    if (logo) d.addImage(logo, 'PNG', M + 7, M + 7, 38, 9.0);
    else { text(d, C.green); d.setFont('helvetica', 'bold'); d.setFontSize(18); d.text('Riversdale Fresh', M + 7, M + 15); }
    text(d, C.ink); d.setFont('helvetica', 'bold'); d.setFontSize(15); d.text(clean(title), W - M - 7, M + 13, { align: 'right' });
    text(d, C.muted); d.setFont('helvetica', 'normal'); d.setFontSize(9); d.text(clean(sub), W - M - 7, M + 20, { align: 'right' });
    return M + 40;
  }
  function footer(d) {
    const n = d.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      d.setPage(i); text(d, C.muted); d.setFont('helvetica', 'normal'); d.setFontSize(8);
      const who = window.DocketRecipes && window.DocketRecipes.member();
      d.text(clean(who ? `Riversdale Fresh  ·  Prepared for ${who}. Please don't share.` : 'Riversdale Fresh  ·  Meal kit dinners. Supermarket prices.'), M, H - 9);
      d.text(`${i} / ${n}`, W - M, H - 9, { align: 'right' });
    }
  }
  function ensure(d, y, need) { if (y + need > H - 18) { d.addPage(); return M + 6; } return y; }
  function ticket(d, x, y, big, small) {
    d.setFont('helvetica', 'bold'); d.setFontSize(15);
    const w = Math.max(d.getTextWidth(big), 22) + 16;
    fill(d, C.butter); d.roundedRect(x - w, y, w, 15, 3.5, 3.5, 'F');
    d.setFillColor(255, 255, 255); d.circle(x - w + 4.2, y + 7.5, 1.3, 'F');
    text(d, C.ink); d.text(big, x - 3.5, y + 7.3, { align: 'right' });
    d.setFont('helvetica', 'bold'); d.setFontSize(6.5); d.text(small.toUpperCase(), x - 3.5, y + 12, { align: 'right' });
  }
  function noteBox(d, y, label, body, colour) {
    d.setFont('helvetica', 'normal'); d.setFontSize(9.5);
    const lines = d.splitTextToSize(clean(body), W - 2 * M - 12 - d.getTextWidth(label + '  '));
    const h = Math.max(10, lines.length * 4.6 + 6);
    y = ensure(d, y, h + 3);
    fill(d, colour); d.roundedRect(M, y, W - 2 * M, h, 3, 3, 'F');
    text(d, C.ink); d.setFont('helvetica', 'bold'); d.text(label, M + 5, y + 6.2);
    d.setFont('helvetica', 'normal'); d.text(lines, M + 6 + d.getTextWidth(label + '  '), y + 6.2);
    return y + h + 4;
  }

  function weekLabel() {
    const now = new Date();
    return now.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function shoppingList(w, meta, noFooter) {
    const { jsPDF } = window.jspdf; const d = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = header(d, 'Shopping list', `${meta.store} · ${meta.people} people${meta.lunch ? ' + lunches' : ''} · ${w.serves} serves · ${weekLabel()}`);
    // Summary
    text(d, C.ink); d.setFont('helvetica', 'bold'); d.setFontSize(11); d.text('This week', M, y + 4);
    d.setFont('helvetica', 'normal'); d.setFontSize(9.5); text(d, C.muted);
    const dl = d.splitTextToSize(clean(meta.dinners.join('  ·  ') + (meta.treats && meta.treats.length ? '  ·  Treats: ' + meta.treats.join(', ') : '')), 120); d.text(dl, M, y + 10);
    ticket(d, W - M, y - 1, money(w.total, 0), 'estimated shop');
    y += 12 + dl.length * 4.5;
    if (meta.saved > 0) { y = noteBox(d, y, 'Kit Tax dodged:', `${money(meta.saved)} this week vs ${meta.kit}. That's ${money(meta.saved * 52, 0)} a year.`, C.mint); }
    y += 2;
    const by = {}; w.items.forEach(x => { (by[ING[x.id].a] ??= []).push(x); });
    ['M', 'F', 'D', 'Z', 'P', 'B', 'G', 'K'].filter(a => by[a]).forEach(a => {
      y = ensure(d, y, 18);
      fill(d, a === 'K' ? C.peach : C.mint); d.roundedRect(M, y, W - 2 * M, 8, 4, 4, 'F');
      text(d, a === 'K' ? C.markup : C.green); d.setFont('helvetica', 'bold'); d.setFontSize(8.5); d.text(clean(AISLE[a]).toUpperCase(), M + 4, y + 5.4);
      y += 11;
      by[a].sort((p, q) => ING[p.id].n.localeCompare(ING[q.id].n)).forEach(x => {
        y = ensure(d, y, 9);
        const it = ING[x.id];
        draw(d, C.muted); d.setLineWidth(0.3); d.roundedRect(M + 1, y - 3.3, 3.8, 3.8, 0.8, 0.8, 'S');
        text(d, C.ink); d.setFont('helvetica', 'bold'); d.setFontSize(10); d.text(clean(it.n), M + 8, y);
        const detail = x.pan ? `you'll use ${kAmt(x.id, x.amt)} · if you're out: ${packLabel(x.id, x.pk)}` : `${fmtAmt(x.id, x.amt)} needed · ${x.label}`;
        const extra = (x.fb ? ' · not at Aldi, priced at Coles' : '') + (it.ck ? ' · check label for GF' : '');
        text(d, C.muted); d.setFont('helvetica', 'normal'); d.setFontSize(8.5); d.text(clean(detail + extra), M + 8, y + 4.2);
        text(d, C.ink); d.setFont('helvetica', 'bold'); d.setFontSize(10); d.text((x.pan ? '~' : '') + money(x.cost), W - M, y, { align: 'right' });
        draw(d, C.line); d.setLineDashPattern([1, 1], 0); d.line(M + 8, y + 6.6, W - M, y + 6.6); d.setLineDashPattern([], 0);
        y += 10;
      });
      y += 3;
    });
    y = ensure(d, y, 14);
    text(d, C.muted); d.setFont('helvetica', 'normal'); d.setFontSize(8.5);
    d.text(d.splitTextToSize(clean(`Prices are Riversdale Fresh's estimates and include ${money(STAPLES, 0)} for oil, salt and pepper. Pantry items are counted by what you use. Check prices at the shelf.`), W - 2 * M), M, y);
    if (!noFooter) footer(d);
    return d;
  }

  // One recipe on one A4 page. Lays out at full size, and if it runs long, steps the type down until it fits.
  function recipe(r, n, gfCount) {
    const c = window.DocketRecipes ? window.DocketRecipes.peek(r.id) : r; // null when the method is locked
    let d = null, size = 1;
    for (let k = 1; k >= 0.7; k = +(k - 0.05).toFixed(2)) {
      const last = k - 0.05 < 0.7;
      const out = recipePage(r, n, gfCount, c, k, last);
      d = out.d; size = k; if (out.fits) break;
    }
    footer(d);
    return { d, size };
  }
  // Draws one recipe at text scale k, on a new document or (with target) on a new page of target.
  function recipePage(r, n, gfCount, c, k, last, target) {
    const tr = isTreat(r); if (tr) n = 1;
    const { jsPDF } = window.jspdf; const d = target || new jsPDF({ unit: 'mm', format: 'a4' });
    if (target) d.addPage();
    const p0 = d.getNumberOfPages();
    const lh = pt => pt * 0.42; // line height in mm for a font size
    const bottom = H - 16;
    // Top strip: logo, dinner details, a rule
    if (logo) d.addImage(logo, 'PNG', M, M - 1, 27, 6.4);
    else { text(d, C.green); d.setFont('helvetica', 'bold'); d.setFontSize(13); d.text('Riversdale Fresh', M, M + 4.5); }
    text(d, C.muted); d.setFont('helvetica', 'normal'); d.setFontSize(9);
    d.text(clean(tr ? `Sweet treat. ${r.c}, ${timeLabel(r)}. Makes ${r.mk} ${r.mu}.` : `${r.c}, ${timeLabel(r)}. Makes ${n} serves.`), W - M, M + 4, { align: 'right' });
    draw(d, C.line); d.setLineWidth(0.3); d.line(M, M + 9, W - M, M + 9);
    let y = M + 19;
    // Title, blurb and price tag
    if (tr) ticket(d, W - M, M + 13, money(batchCost(r)), 'a batch'); else ticket(d, W - M, M + 13, money(serveCost(r)), 'per serve');
    text(d, C.ink); d.setFont('helvetica', 'bold'); d.setFontSize(19 * k);
    const tl = d.splitTextToSize(clean(r.n), 128); d.text(tl, M, y); y += (tl.length - 1) * lh(19 * k) + 3;
    if (r.d) { text(d, C.muted); d.setFont('helvetica', 'normal'); d.setFontSize(10 * k); const dl = d.splitTextToSize(clean(r.d), 128); d.text(dl, M, y + 3); y += dl.length * lh(10 * k) + 3; }
    text(d, C.green); d.setFont('helvetica', 'bold'); d.setFontSize(9 * k);
    d.text(clean(tr ? (gfCount > 0 && gfType(r) !== 'yes' ? 'Made gluten free so everyone can share.' : gfType(r) === 'yes' ? 'Gluten free.' : 'Gluten free swap in the notes.') : `${Math.round(serveProt(r))}g protein a serve. ${gfType(r) === 'yes' ? 'Gluten free.' : 'Gluten free swaps included.'}`), M, y + 3);
    y = Math.max(y + 11, M + 32);
    // Two columns: ingredients | method
    const colL = M, wL = 56, colR = M + wL + 9, wR = W - M - colR, amtW = 21;
    let yl = y, yr = y;
    text(d, C.ink); d.setFont('helvetica', 'bold'); d.setFontSize(11.5 * k); d.text('Ingredients', colL, yl); d.text('Method', colR, yr);
    yl += 6.5 * k; yr += 6.5 * k;
    const fs = 9 * k;
    linesFor(r, n).forEach(([i, a]) => {
      d.setFontSize(fs);
      if (c) {
        text(d, C.ink); d.setFont('helvetica', 'bold');
        const al = d.splitTextToSize(clean(kAmt(i, a, tr)), amtW - 2); d.text(al, colL, yl);
        d.setFont('helvetica', 'normal');
        const nl = d.splitTextToSize(clean(iname(i)), wL - amtW); d.text(nl, colL + amtW, yl);
        yl += Math.max(al.length, nl.length) * lh(fs) + 1.6 * k;
      } else {
        text(d, C.ink); d.setFont('helvetica', 'normal');
        const nl = d.splitTextToSize(clean(iname(i)), wL); d.text(nl, colL, yl); yl += nl.length * lh(fs) + 1.6 * k;
      }
    });
    d.setFont('helvetica', 'normal'); d.setFontSize(8.5 * k); text(d, C.muted); d.text(tr ? 'Plus a pinch of salt.' : 'Plus oil, salt and pepper.', colL, yl + 1); yl += 6;
    if (!c) {
      d.setFont('helvetica', 'normal'); d.setFontSize(10); text(d, C.ink);
      const ll = d.splitTextToSize(clean(`The full method, amounts, ${tr ? 'keeping' : 'lunch'} tip and gluten free notes for this ${tr ? 'treat' : 'dinner'} are for Riversdale Fresh members. Get every recipe free while we're in beta at ${SITE}plan.html`), wR - 4);
      fill(d, C.mint); d.roundedRect(colR - 2, yr - 5, wR + 2, ll.length * 4.9 + 8, 3, 3, 'F'); d.text(ll, colR + 2, yr + 0.5); yr += ll.length * 4.9 + 8;
    }
    const ms = 9.6 * k, hs = 10.5 * k;
    (c ? c.m : []).forEach((raw, idx) => {
      const st = stepOf(raw);
      const body = richLines(d, fillStep(r, st.s, n, x => '\u0001' + x + '\u0002'), wR - 7, ms);
      const need = (st.h ? lh(hs) + 1.5 : 0) + body.length * lh(ms) + 3.5 * k;
      if (last && yr + need > bottom - 4) { d.addPage(); yr = M + 6; }
      text(d, C.green); d.setFont('helvetica', 'bold'); d.setFontSize(hs);
      d.text(String(idx + 1), colR, yr);
      if (st.h) { d.text(clean(st.h), colR + 7, yr); yr += lh(hs) + 1.5; }
      text(d, C.ink); d.setFontSize(ms); drawRich(d, body, colR + 7, yr, lh(ms));
      yr += body.length * lh(ms) + 3.5 * k;
    });
    y = d.getNumberOfPages() > p0 ? yr + 2 : Math.max(yl, yr) + 2;
    // Notes along the bottom
    const notes = [];
    if (c && c.l) notes.push(['Lunch:', c.l, C.mint]);
    if (c && c.k) notes.push(['Keeps:', c.k, C.mint]);
    if (c && c.g && gfCount > 0) notes.push([`Gluten free (${gfCount}):`, c.g, C.butter]);
    const checks = [...new Set(r.i.filter(([i]) => ING[i].ck).map(([i]) => iname(i)))];
    if (checks.length) notes.push(['Check labels:', checks.join(', '), C.peach]);
    notes.forEach(([label, body, col]) => {
      const ns = 9 * k; d.setFontSize(ns); d.setFont('helvetica', 'bold'); const lw = d.getTextWidth(label + '  ');
      d.setFont('helvetica', 'normal'); const lines = d.splitTextToSize(clean(body), W - 2 * M - 10 - lw);
      const h = lines.length * lh(ns) + 5;
      if (last && y + h > bottom) { d.addPage(); y = M + 6; }
      fill(d, col); d.roundedRect(M, y, W - 2 * M, h, 2.5, 2.5, 'F');
      text(d, C.ink); d.setFont('helvetica', 'bold'); d.text(label, M + 4, y + 3 + lh(ns) * 0.75);
      d.setFont('helvetica', 'normal'); d.text(lines, M + 4 + lw, y + 3 + lh(ns) * 0.75);
      y += h + 2.5;
    });
    return { d, fits: d.getNumberOfPages() === p0 && y <= bottom };
  }

  const slug = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // mode 'one': a single PDF (shopping list, then one page per recipe). 'split': a file each.
  async function build(state, mode = 'one') {
    await loadLogo();
    const w = week(); const n = spm(); const gf = Math.min(state.gf, state.people);
    const kit = KITS[0]; const kitTotal = kitCost(kit, n, state.sel.length);
    const meta = { store: STORE_NAME[state.store], people: state.people, lunch: state.lunch, dinners: state.sel.map(id => R.find(r => r.id === id).n), treats: (state.treats || []).map(id => byId(id).n), saved: kitTotal - w.eaten, kit: kit.n };
    const rs = [...state.sel, ...(state.treats || [])].map(id => byId(id));
    let files;
    if (mode === 'split') {
      files = [{ filename: '01-riversdale-fresh-shopping-list.pdf', doc: shoppingList(w, meta) }];
      rs.forEach((r, k) => files.push({ filename: `${String(k + 2).padStart(2, '0')}-${slug(r.n)}.pdf`, doc: recipe(r, n, gf).d }));
    } else {
      // Work out each recipe's text size on its own first, so it still fits its page in the combined file.
      const doc = shoppingList(w, meta, true);
      rs.forEach(r => {
        const c = window.DocketRecipes ? window.DocketRecipes.peek(r.id) : r;
        recipePage(r, n, gf, c, recipe(r, n, gf).size, true, doc);
      });
      footer(doc);
      files = [{ filename: `riversdale-fresh-week-${slug(weekLabel())}.pdf`, doc }];
    }
    return { files, meta, total: w.total, serves: w.serves };
  }

  const toBase64 = doc => doc.output('datauristring').split(',')[1];
  function download(files) {
    files.forEach((f, i) => setTimeout(() => f.doc.save(f.filename), i * 400));
  }
  return { build, toBase64, download };
})();
