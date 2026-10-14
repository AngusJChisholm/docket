// Builds the Docket PDFs in the browser: one shopping list plus one PDF per recipe.
// Needs jsPDF (loaded on plan.html) and the planner's functions (week, splitLines, kAmt, ...).
const DocketPDF = (function () {
  const C = { ink: [28, 33, 30], muted: [89, 98, 92], green: [31, 107, 71], mint: [207, 235, 216], butter: [255, 229, 138], peach: [255, 217, 203], markup: [169, 54, 23], line: [220, 227, 220] };
  const W = 210, H = 297, M = 16; // A4 in mm, margin
  let logo = null;

  async function loadLogo() {
    if (logo) return logo;
    try {
      const res = await fetch('assets/img/docket-wordmark-green-600.png');
      const blob = await res.blob();
      logo = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
    } catch (e) { logo = null; }
    return logo;
  }

  // jsPDF's built-in fonts only cover Latin-1, so swap the few characters that aren't in it.
  const clean = s => String(s).replace(/[≈]/g, '~').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/…/g, '...');
  const fill = (d, c) => d.setFillColor(c[0], c[1], c[2]);
  const text = (d, c) => d.setTextColor(c[0], c[1], c[2]);
  const draw = (d, c) => d.setDrawColor(c[0], c[1], c[2]);

  function header(d, title, sub) {
    fill(d, C.mint); d.roundedRect(M, M, W - 2 * M, 30, 5, 5, 'F');
    if (logo) d.addImage(logo, 'PNG', M + 7, M + 7, 38, 9.0);
    else { text(d, C.green); d.setFont('helvetica', 'bold'); d.setFontSize(22); d.text('Docket', M + 7, M + 15); }
    text(d, C.ink); d.setFont('helvetica', 'bold'); d.setFontSize(15); d.text(clean(title), W - M - 7, M + 13, { align: 'right' });
    text(d, C.muted); d.setFont('helvetica', 'normal'); d.setFontSize(9); d.text(clean(sub), W - M - 7, M + 20, { align: 'right' });
    return M + 40;
  }
  function footer(d) {
    const n = d.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      d.setPage(i); text(d, C.muted); d.setFont('helvetica', 'normal'); d.setFontSize(8);
      d.text('Docket  ·  Meal kit dinners. Supermarket prices.', M, H - 9);
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

  function shoppingList(w, meta) {
    const { jsPDF } = window.jspdf; const d = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = header(d, 'Shopping list', `${meta.store} · ${meta.people} people${meta.lunch ? ' + lunches' : ''} · ${w.serves} serves · ${weekLabel()}`);
    // Summary
    text(d, C.ink); d.setFont('helvetica', 'bold'); d.setFontSize(11); d.text('This week', M, y + 4);
    d.setFont('helvetica', 'normal'); d.setFontSize(9.5); text(d, C.muted);
    const dl = d.splitTextToSize(clean(meta.dinners.join('  ·  ')), 120); d.text(dl, M, y + 10);
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
    d.text(d.splitTextToSize(clean(`Prices are Docket's estimates and include ${money(STAPLES, 0)} for oil, salt and pepper. Pantry items are counted by what you use. Check prices at the shelf.`), W - 2 * M), M, y);
    footer(d);
    return d;
  }

  function recipe(r, n, gfCount) {
    const { jsPDF } = window.jspdf; const d = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = header(d, r.n, `${r.c} · ${timeLabel(r)} · ${n} serves`);
    text(d, C.ink); d.setFont('helvetica', 'bold'); d.setFontSize(20);
    const tl = d.splitTextToSize(clean(r.n), 135); d.text(tl, M, y + 6);
    ticket(d, W - M, y, money(serveCost(r)), 'per serve');
    y += 6 + tl.length * 8;
    if (r.d) { text(d, C.muted); d.setFont('helvetica', 'normal'); d.setFontSize(10.5); const dl = d.splitTextToSize(clean(r.d), W - 2 * M); d.text(dl, M, y); y += dl.length * 5 + 2; }
    text(d, C.green); d.setFont('helvetica', 'bold'); d.setFontSize(9);
    d.text(clean(`${Math.round(serveProt(r))}g PROTEIN PER SERVE   ·   ${gfType(r) === 'yes' ? 'GLUTEN FREE' : 'GF SWAPS INCLUDED'}`), M, y + 3);
    y += 10;
    // Two columns: ingredients | method
    const colL = M, wL = 62, colR = M + wL + 8, wR = W - M - colR;
    let yl = y, yr = y;
    text(d, C.ink); d.setFont('helvetica', 'bold'); d.setFontSize(12); d.text('Ingredients', colL, yl); d.text('Method', colR, yr);
    yl += 7; yr += 7;
    splitLines(r, n).forEach(([i, a]) => {
      d.setFont('helvetica', 'bold'); d.setFontSize(9.5); text(d, C.ink);
      const amt = clean(kAmt(i, a)); d.text(amt, colL, yl);
      d.setFont('helvetica', 'normal'); text(d, C.muted);
      const nl = d.splitTextToSize(clean(iname(i)), wL); d.text(nl, colL, yl + 4.3);
      yl += 4.3 * nl.length + 5.2;
    });
    d.setFont('helvetica', 'normal'); d.setFontSize(8.5); text(d, C.muted); d.text('Plus oil, salt and pepper.', colL, yl); yl += 6;
    r.m.forEach((s, k) => {
      d.setFont('helvetica', 'normal'); d.setFontSize(10);
      const sl = d.splitTextToSize(clean(s), wR - 9);
      if (yr + sl.length * 4.9 > H - 20) { d.addPage(); yr = M + 6; }
      fill(d, C.butter); d.circle(colR + 3, yr - 1.3, 3, 'F');
      text(d, C.ink); d.setFont('helvetica', 'bold'); d.setFontSize(8.5); d.text(String(k + 1), colR + 3, yr - 0.1, { align: 'center' });
      d.setFont('helvetica', 'normal'); d.setFontSize(10); d.text(sl, colR + 9, yr);
      yr += sl.length * 4.9 + 3.5;
    });
    y = Math.max(yl, d.getNumberOfPages() > 1 ? yr : Math.max(yl, yr)) + 2;
    if (d.getNumberOfPages() > 1) y = yr + 2;
    if (r.l) y = noteBox(d, y, 'Lunch:', r.l, C.mint);
    if (r.g && gfCount > 0) y = noteBox(d, y, `Gluten free (${gfCount}):`, r.g, C.butter);
    const checks = [...new Set(r.i.filter(([i]) => ING[i].ck).map(([i]) => iname(i)))];
    if (checks.length) y = noteBox(d, y, 'Check labels:', checks.join(', '), C.peach);
    footer(d);
    return d;
  }

  const slug = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  async function build(state) {
    await loadLogo();
    const w = week(); const n = spm();
    const kit = state.kits[0]; const kitTotal = kitCost(kit, n, state.sel.length);
    const meta = { store: STORE_NAME[state.store], people: state.people, lunch: state.lunch, dinners: state.sel.map(id => R.find(r => r.id === id).n), saved: kitTotal - w.eaten, kit: kit.n };
    const files = [{ filename: '01-docket-shopping-list.pdf', doc: shoppingList(w, meta) }];
    state.sel.forEach((id, k) => { const r = R.find(x => x.id === id); files.push({ filename: `${String(k + 2).padStart(2, '0')}-${slug(r.n)}.pdf`, doc: recipe(r, n, Math.min(state.gf, state.people)) }); });
    return { files, meta, total: w.total, serves: w.serves };
  }

  const toBase64 = doc => doc.output('datauristring').split(',')[1];
  function download(files) {
    files.forEach((f, i) => setTimeout(() => f.doc.save(f.filename), i * 400));
  }
  return { build, toBase64, download };
})();
