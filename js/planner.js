// ---------- State ----------
const S={people:5,gf:2,dinners:5,lunch:true,budget:400,minProt:40,store:'coles',skip:{pork:false,seafood:false,red:false},sel:['chook','butter','carnitas','chorizo','friedrice'],sort:'cost',kits:KITS_DEFAULT.map(k=>({...k})),done:{}};
const STAPLES=(window.DOCKET_CONFIG||{}).staplesPerWeek??15;
try{const s=JSON.parse(localStorage.getItem('docket-state')||'null');if(s&&typeof s==='object')Object.assign(S,s,{skip:{...S.skip,...(s.skip||{})}});}catch(e){}
S.sel=S.sel.filter(id=>R.some(r=>r.id===id));
function save(){try{localStorage.setItem('docket-state',JSON.stringify(S))}catch(e){}}

// ---------- Pricing ----------
function hash(s){let h=7;for(const ch of s)h=(h*31+ch.charCodeAt(0))%1000;return h/1000}
// Real prices you've checked (js/prices.js) win; otherwise Woolies and Aldi are estimated from Coles.
const PRICES=window.DOCKET_PRICES||{coles:{},woolies:{},aldi:{}};
function price(id,store=S.store){
  const it=ING[id];const real=(PRICES[store]||{})[id];
  if(real)return{p:real.p,pk:real.pk||it.pk,fb:false,real:true,at:real.at};
  const c=(PRICES.coles||{})[id];const base=c?{p:c.p,pk:c.pk||it.pk}:{p:it.p,pk:it.pk};
  if(store==='coles')return{...base,fb:false};
  if(store==='woolies')return{p:+(base.p*(0.95+hash(id)*0.11)).toFixed(2),pk:base.pk,fb:false};
  if(it.noAldi)return{...base,fb:true};
  return{p:+(base.p*(0.79+hash(id+'a')*0.09)).toFixed(2),pk:base.pk,fb:false};
}
const STORE_NAME={coles:'Coles',woolies:'Woolies',aldi:'Aldi'};
const spm=()=>S.people*(S.lunch?2:1);
const gfShare=()=>S.people?Math.min(S.gf,S.people)/S.people:0;

function splitLines(r,serves){ // returns [[id,amount]] with GF swaps split
  const out=[];const share=gfShare();
  for(const[id,q]of r.i){
    const tot=q*serves;
    if(GFSWAP[id]&&share>0){out.push([id,tot*(1-share)]);out.push([GFSWAP[id],tot*share]);}
    else out.push([id,tot]);
  }
  return out.filter(x=>x[1]>1e-9);
}
function serveCost(r){return splitLines(r,1).reduce((s,[id,a])=>{const pr=price(id);return s+a/pr.pk*pr.p},0)}
function serveProt(r){return r.i.reduce((s,[id,q])=>{const it=ING[id];return s+(it.u==='ea'?q*it.pr:q*it.pr/100)},0)}
function tags(r){const t=new Set();r.i.forEach(([id])=>{if(ING[id].t)t.add(ING[id].t)});return t}
function gfType(r){return r.i.some(([id])=>GFSWAP[id])?'swap':'yes'}
function allowed(r){const t=tags(r);return!Object.keys(S.skip).some(k=>S.skip[k]&&t.has(k))}

function week(){
  const agg={};const n=spm();
  S.sel.forEach(sid=>{const r=R.find(x=>x.id===sid);if(!r)return;splitLines(r,n).forEach(([id,a])=>{agg[id]=(agg[id]||0)+a})});
  const items=Object.entries(agg).map(([id,amt])=>{const it=ING[id];const pr=price(id);const packs=Math.max(1,Math.ceil(amt/pr.pk-1e-6));return{id,amt,packs,pk:pr.pk,real:!!pr.real,at:pr.at,pan:!!it.pan,pack:pr.p,cost:it.pan?amt/pr.pk*pr.p:packs*pr.p,fb:pr.fb}});
  const shop=items.reduce((s,x)=>s+x.cost,0);
  const serves=S.sel.length*n;
  const prot=S.sel.length?S.sel.reduce((s,id)=>s+serveProt(R.find(r=>r.id===id)),0)/S.sel.length:0;
  return{items,shop,total:shop+(S.sel.length?STAPLES:0),serves,prot};
}

// ---------- Formatting ----------
const $=s=>document.querySelector(s);
const money=(v,d=2)=>'$'+v.toLocaleString('en-AU',{minimumFractionDigits:d,maximumFractionDigits:d});
function fmtAmt(id,a){const u=ING[id].u;
  if(u==='g')return a>=1000?(+(a/1000).toFixed(2))+'kg':Math.ceil(a/10)*10+'g';
  if(u==='ml')return a>=1000?(+(a/1000).toFixed(2))+'L':Math.ceil(a/10)*10+'ml';
  const v=Math.ceil(a*2)/2;return(ING[id].pl==='bunch'?v+(v===1?' bunch':' bunches'):v+'');}
const FR={0:'',0.25:'¼',0.5:'½',0.75:'¾'};
function frac(v){const q=Math.round(v*4)/4||0.25;const w=Math.floor(q),f=+(q-w).toFixed(2);return (w?w:'')+(FR[f]??'')||'¼'}
function half(v){const q=Math.max(.5,Math.ceil(v*2)/2);const w=Math.floor(q);return (w?w:'')+(q-w?'½':'')}
function spoons(ml){if(ml>=60)return`${frac(ml/250)} cup${ml>=375?'s':''}`;if(ml>=12)return`${half(ml/15)} tbsp`;return`${half(ml/5)} tsp`}
function kAmt(id,a){const it=ING[id];
  if(it.cl)return`${Math.max(1,Math.round(a*it.cl))} cloves`;
  if(it.ea&&it.u==='g'){const n=a/it.ea[0];return`${half(n)} ${it.ea[1]}${n>1?'s':''} (${fmtAmt(id,a)})`}
  if(it.pl==='tin'||it.pl==='can')return`${half(a/it.pk)} tin${a/it.pk>1?'s':''}`;
  if(it.ea&&it.u==='ea'){const v=a<1?Math.max(.25,Math.round(a*4)/4):Math.ceil(a*2)/2;const w=it.ea[1];return /bunch$/.test(w)?`${frac(v)} bunch${v>1?'es':''}`:frac(v)}
  if(it.u==='ml')return spoons(a);
  if(it.tsp){const t=a/it.tsp;return t>=3?`${half(t/3)} tbsp`:`${half(t)} tsp`}
  if(it.tbsp){const t=a/it.tbsp;return t>6?fmtAmt(id,a):`${half(t)} tbsp`}
  if(it.cup&&a/it.cup>=.25){const c=a/it.cup;return`${frac(c)} cup${c>1.1?'s':''} (${fmtAmt(id,a)})`}
  return fmtAmt(id,a)}
const iname=id=>ING[id].n.replace(/\s*\([^)]*\)$/,'');
function packLabel(id,pk){const it=ING[id];pk=pk||it.pk;if(it.pl&&pk===it.pk)return it.pl;if(it.u==='g')return pk>=1000?(+(pk/1000).toFixed(2))+'kg':pk+'g';if(it.u==='ml')return pk>=1000?(+(pk/1000).toFixed(2))+'L':pk+'ml';return pk>1?pk+' pack':'each'}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const timeLabel=r=>r.t>=120?`${+(r.t/60).toFixed(1)} hr · ${r.h} min hands-on`:`${r.t} min`;

// ---------- Render ----------
function renderControls(){
  $('#people-v').textContent=S.people;$('#gf-v').textContent=Math.min(S.gf,S.people);$('#din-v').textContent=S.dinners;
  $('#people-dn').disabled=S.people<=1;$('#people-up').disabled=S.people>=10;
  $('#gf-dn').disabled=S.gf<=0;$('#gf-up').disabled=S.gf>=S.people;
  $('#din-dn').disabled=S.dinners<=1;$('#din-up').disabled=S.dinners>=7;
  $('#budget').value=S.budget;$('#lunch').checked=S.lunch;$('#prot').value=S.minProt;$('#prot-v').textContent=S.minProt+'g';
  document.querySelectorAll('#store button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===S.store));
  document.querySelectorAll('#skips .chip').forEach(b=>b.setAttribute('aria-pressed',!!S.skip[b.dataset.k]));
  $('#sort').value=S.sort;
}
function renderCards(){
  const full=S.sel.length>=S.dinners;
  let list=R.filter(allowed);
  const low=list.filter(r=>serveProt(r)<S.minProt&&!S.sel.includes(r.id));
  list=list.filter(r=>serveProt(r)>=S.minProt||S.sel.includes(r.id));
  const key={cost:r=>serveCost(r),prot:r=>-serveProt(r),time:r=>r.t}[S.sort];
  list.sort((a,b)=>key(a)-key(b));
  $('#cards').innerHTML=list.map(r=>{
    const sel=S.sel.includes(r.id);const p=serveProt(r);const g=gfType(r);
    return`<article class="card${sel?' sel':''}${!sel&&full?' off':''}">
      <div class="card-top"><div><h3>${esc(r.n)}</h3><div class="meta">${esc(r.c)} · ${timeLabel(r)}</div></div>
      <div class="ticket num"><b>${money(serveCost(r))}</b><small>per serve</small></div></div>
      ${r.d?`<p class="blurb">${esc(r.d)}</p>`:''}
      <div class="badges"><span class="badge p num">${Math.round(p)}g protein</span><span class="badge">${g==='yes'?'Gluten free':'GF swap'}</span></div>
      <div class="card-actions"><button class="btn ghost view" data-id="${r.id}">Recipe</button>
      <button class="btn ghost pick" data-id="${r.id}" ${!sel&&full?'disabled':''} aria-pressed="${sel}">${sel?'✓ Picked':'Add'}</button></div></article>`}).join('');
  const blocked=R.length-R.filter(allowed).length;
  const notes=[];
  if(low.length)notes.push(`${low.length} dinner${low.length>1?'s':''} under ${S.minProt}g protein per serve hidden.`);
  if(blocked)notes.push(`${blocked} left out by your filters.`);
  $('#hidden-note').textContent=notes.join(' ');
  $('#fill').disabled=full;
}
function renderWeek(w){
  $('#store-name').textContent=STORE_NAME[S.store];
  $('#total').textContent=money(w.total,0);
  $('#serves-line').textContent=`${w.serves} serves`;
  const pct=S.budget>0?w.total/S.budget:0;
  $('#meter').classList.toggle('over',pct>1);$('#meter i').style.width=Math.min(100,pct*100)+'%';
  const diff=S.budget-w.total;
  $('#budget-line').innerHTML=diff>=0?`<b>${money(diff,0)}</b> under your ${money(S.budget,0)} budget`:`<b class="over">${money(-diff,0)} over</b> your ${money(S.budget,0)} budget`;
  $('#st-serve').textContent=w.serves?money(w.total/w.serves):'$0';
  $('#st-prot').textContent=Math.round(w.prot)+'g';
  $('#st-picked').textContent=`${S.sel.length}/${S.dinners}`;
  $('#picked').innerHTML=S.sel.map(id=>{const r=R.find(x=>x.id===id);return`<li><span>${esc(r.n)}</span><span class="num">${money(serveCost(r))}</span></li>`}).join('');
  // Kit tax
  const n=spm();const rows=S.kits.map(k=>({n:k.n,v:w.serves*k.ps+(S.sel.length?k.del*Math.ceil(n/k.max):0)}));
  $('#bars').innerHTML=[`<div class="ln us"><span>Docket</span><span>${money(w.total)}</span></div>`,...rows.map(x=>`<div class="ln kit"><span>${esc(x.n)}</span><span>${money(x.v)}</span></div>`)].join('');
  const hf=rows[0];
  if(!S.sel.length){$('#dodged').innerHTML='';$('#kt-save').textContent='Pick some dinners to see what the kits would charge.';}
  else{
    const s=hf.v-w.total;
    const cheaper=rows.filter(r=>r.v<w.total);
    $('#dodged').innerHTML=s>0?`<div class="dodged"><span>KIT TAX DODGED</span><b class="num">${money(s)}</b></div>`:`<div class="dodged"><span>${esc(hf.n)} is cheaper</span><b class="num">${money(-s)}</b></div>`;
    let txt=s>0?`vs ${esc(hf.n)}. That's ${money(s*52,0)} a year.`:'';
    if(cheaper.length)txt+=` ${cheaper.map(c=>esc(c.n)).join(', ')} is cheaper on price alone this week, with smaller serves and less protein.`;
    $('#kt-save').innerHTML=txt.trim();
  }
}
function renderKitCfg(){
  $('#kitgrid').innerHTML=`<span class="h">Kit</span><span class="h">$/serve</span><span class="h">Delivery</span>`+S.kits.map((k,i)=>`<span>${esc(k.n)}</span><input type="number" step="0.01" min="0" id="kps-${i}" data-i="${i}" data-f="ps" value="${k.ps}" aria-label="${esc(k.n)} price per serve"><input type="number" step="0.01" min="0" id="kdel-${i}" data-i="${i}" data-f="del" value="${k.del}" aria-label="${esc(k.n)} delivery fee">`).join('');
}
function renderList(w){
  const by={};w.items.forEach(x=>{(by[ING[x.id].a]??=[]).push(x)});
  const order=['M','F','D','Z','P','B','G','K'];
  if(!w.items.length){$('#aisles').innerHTML='<p class="hint">Pick a dinner and your list builds itself here, merged and sorted by aisle.</p>';$('#list-meta').textContent='';return}
  $('#aisles').innerHTML=order.filter(a=>by[a]).map(a=>`<div class="aisle"><h3>${AISLE[a]}</h3>${by[a].sort((x,y)=>ING[x.id].n.localeCompare(ING[y.id].n)).map(x=>{
    const it=ING[x.id];const k='i-'+x.id;const done=!!S.done[x.id];
    const detail=x.pan?`you'll use ${kAmt(x.id,x.amt)} · if you're out: ${packLabel(x.id,x.pk)} ${money(x.pack)}`:`${fmtAmt(x.id,x.amt)} needed · ${x.packs} × ${packLabel(x.id,x.pk)}`;
    return`<label class="item${done?' done':''}" for="${k}"><input type="checkbox" id="${k}" data-id="${x.id}" ${done?'checked':''}><span class="what">${esc(it.n)}<small>${detail}${x.fb?' · <span class="flag">Not at Aldi, priced at Coles</span>':''}${it.ck?' · check label for GF':''}${x.real?' · <span class="ok">price checked</span>':''}</small></span><span class="c num">${x.pan?'≈':''}${money(x.cost)}</span></label>`}).join('')}</div>`).join('');
  $('#list-meta').textContent=`${w.items.length} items · ${money(w.shop)} + ${money(STAPLES,0)} staples`;
}
function render(){renderControls();renderCards();const w=week();renderWeek(w);renderList(w);save()}

// ---------- Recipe dialog ----------
function openRecipe(id){
  const r=R.find(x=>x.id===id);const n=spm();const lines=splitLines(r,n);const g=gfType(r);
  const checks=[...new Set(r.i.filter(([i])=>ING[i].ck).map(([i])=>ING[i].n))];
  $('#dlg-in').innerHTML=`<div class="dlg-head"><div><span class="eyebrow">${esc(r.c)} · ${timeLabel(r)}</span><h2>${esc(r.n)}</h2></div><button class="x" id="dlg-x" aria-label="Close">×</button></div>
   ${r.d?`<p class="lead-sm">${esc(r.d)}</p>`:''}
   <div class="badges" style="margin-top:10px"><span class="badge p num">${Math.round(serveProt(r))}g protein/serve</span><span class="badge num">${money(serveCost(r))}/serve at ${STORE_NAME[S.store]}</span><span class="badge">${g==='yes'?'Gluten free':'GF swap'}</span></div>
   <div class="dlg-cols"><div><h3>For ${n} serves</h3><ul class="ing">${lines.map(([i,a])=>`<li><span>${esc(iname(i))}</span><b class="num">${kAmt(i,a)}</b></li>`).join('')}</ul><p class="hint" style="margin-top:8px">Plus oil, salt and pepper.</p></div>
   <div><h3>Method</h3><ol class="steps">${r.m.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div></div>
   ${r.l?`<div class="gfnote"><b>Lunch:</b> ${esc(r.l)}</div>`:''}
   ${r.g&&S.gf>0?`<div class="gfnote"><b>Gluten free (${Math.min(S.gf,S.people)}):</b> ${esc(r.g)}</div>`:''}
   ${checks.length?`<div class="gfnote" style="background:var(--peach)">Check the label on: ${esc(checks.join(', '))}.</div>`:''}`;
  const d=$('#dlg');d.showModal();$('#dlg-x').onclick=()=>d.close();
}
$('#dlg').addEventListener('click',e=>{if(e.target.id==='dlg')e.target.close()});

// ---------- Plain text plan ----------
function planText(){
  const w=week();const n=spm();
  let t=`DOCKET · Your week at ${STORE_NAME[S.store]}\n${S.people} people${S.lunch?' + lunches':''} · ${S.sel.length} dinners · ${w.serves} serves\nEstimated shop: ${money(w.total)} (${money(w.total/Math.max(1,w.serves))} per serve)\n\nSHOPPING LIST\n`;
  const by={};w.items.forEach(x=>{(by[ING[x.id].a]??=[]).push(x)});
  ['M','F','D','Z','P','B','G','K'].filter(a=>by[a]).forEach(a=>{t+=`\n${AISLE[a].toUpperCase()}\n`;by[a].forEach(x=>{t+=x.pan?`[ ] ${ING[x.id].n} (check pantry, using ${kAmt(x.id,x.amt)})\n`:`[ ] ${ING[x.id].n}: ${x.packs} x ${packLabel(x.id,x.pk)} (${money(x.cost)})\n`})});
  t+=`\nRECIPES\n`;
  S.sel.forEach(id=>{const r=R.find(x=>x.id===id);t+=`\n${r.n.toUpperCase()} (${timeLabel(r)})\n`;splitLines(r,n).forEach(([i,a])=>{t+=`- ${kAmt(i,a)} ${iname(i)}\n`});r.m.forEach((s,k)=>{t+=`${k+1}. ${s}\n`});if(r.l)t+=`Lunch: ${r.l}\n`;if(r.g&&S.gf>0)t+=`Gluten free: ${r.g}\n`});
  return t;
}

// ---------- Events ----------
const step=(k,d,min,max)=>()=>{S[k]=Math.max(min,Math.min(max,S[k]+d));if(k==='people')S.gf=Math.min(S.gf,S.people);if(k==='dinners'&&S.sel.length>S.dinners)S.sel=S.sel.slice(0,S.dinners);render()};
$('#people-dn').onclick=step('people',-1,1,10);$('#people-up').onclick=step('people',1,1,10);
$('#gf-dn').onclick=step('gf',-1,0,10);$('#gf-up').onclick=()=>{if(S.gf<S.people){S.gf++;render()}};
$('#din-dn').onclick=step('dinners',-1,1,7);$('#din-up').onclick=step('dinners',1,1,7);
$('#budget').addEventListener('input',e=>{S.budget=Math.max(0,+e.target.value||0);const w=week();renderWeek(w);save()});
$('#lunch').onchange=e=>{S.lunch=e.target.checked;render()};
$('#prot').addEventListener('input',e=>{S.minProt=+e.target.value;render()});
$('#store').addEventListener('click',e=>{const b=e.target.closest('button');if(b){S.store=b.dataset.s;render()}});
$('#skips').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;S.skip[b.dataset.k]=!S.skip[b.dataset.k];S.sel=S.sel.filter(id=>allowed(R.find(r=>r.id===id)));render()});
$('#sort').onchange=e=>{S.sort=e.target.value;render()};
$('#cards').addEventListener('click',e=>{
  const v=e.target.closest('.view');if(v){openRecipe(v.dataset.id);return}
  const p=e.target.closest('.pick');if(!p)return;const id=p.dataset.id;
  if(S.sel.includes(id))S.sel=S.sel.filter(x=>x!==id);else if(S.sel.length<S.dinners)S.sel.push(id);render();
});
$('#fill').onclick=()=>{
  const pool=R.filter(r=>allowed(r)&&serveProt(r)>=S.minProt&&!S.sel.includes(r.id)).sort((a,b)=>serveCost(a)-serveCost(b));
  const cats=new Set(S.sel.map(id=>R.find(r=>r.id===id).c));
  for(const r of pool){if(S.sel.length>=S.dinners)break;if(!cats.has(r.c)){S.sel.push(r.id);cats.add(r.c)}}
  for(const r of pool){if(S.sel.length>=S.dinners)break;if(!S.sel.includes(r.id))S.sel.push(r.id)}
  render();
};
$('#clear').onclick=()=>{S.sel=[];render()};
$('#kitgrid').addEventListener('input',e=>{const i=e.target.dataset.i;if(i==null)return;S.kits[i][e.target.dataset.f]=Math.max(0,+e.target.value||0);renderWeek(week());save()});
$('#aisles').addEventListener('change',e=>{const id=e.target.dataset.id;if(!id)return;S.done[id]=e.target.checked;e.target.closest('.item').classList.toggle('done',e.target.checked);save()});
function copyText(t,okMsg){
  const done=()=>{$('#msg').textContent=okMsg};
  try{navigator.clipboard.writeText(t).then(done,()=>fallback(t))}catch(e){fallback(t)}
  function fallback(t){const ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();$('#msg').textContent=ok?okMsg:'Copy was blocked here. Select the list above and copy it manually.'}
}
$('#copy').onclick=()=>{if(!S.sel.length){$('#msg').textContent='Pick at least one dinner first.';return}copyText(planText(),'Plan copied: shopping list plus every recipe. Paste it into an email or the group chat.')};
async function makePdfs(){
  if(!window.jspdf||!window.DocketPDF){$('#msg').textContent='The PDF maker is still loading. Give it a second and try again.';return null}
  $('#msg').textContent='Building your PDFs...';
  return DocketPDF.build(S);
}
$('#send').onclick=async()=>{
  const v=$('#email').value.trim();
  if(!S.sel.length){$('#msg').textContent='Pick at least one dinner first.';return}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){$('#msg').textContent='Enter an email address like you@example.com.';return}
  try{localStorage.setItem('docket-email',v)}catch(e){}
  const btn=$('#send');btn.disabled=true;
  try{
    const out=await makePdfs();if(!out)return;
    const endpoint=(window.DOCKET_CONFIG||{}).emailEndpoint;
    if(!endpoint){DocketPDF.download(out.files);$('#msg').textContent='Email sending switches on soon, so your PDFs have downloaded instead.';return}
    $('#msg').textContent='Sending your Docket...';
    const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      to:v,store:out.meta.store,people:S.people,serves:out.serves,total:Math.round(out.total*100)/100,
      saved:Math.round(out.meta.saved*100)/100,kit:out.meta.kit,dinners:out.meta.dinners,
      attachments:out.files.map(f=>({filename:f.filename,content:DocketPDF.toBase64(f.doc)}))})});
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(data.error||res.status);
    $('#msg').textContent=`Sent. Check ${v} for your shopping list and ${out.files.length-1} recipe${out.files.length>2?'s':''}.`;
  }catch(e){$('#msg').textContent=`That didn't send (${e.message}). Try again, or tap "Download PDFs".`}
  finally{btn.disabled=false}
};
$('#pdfs').onclick=async()=>{if(!S.sel.length){$('#msg').textContent='Pick at least one dinner first.';return}const out=await makePdfs();if(!out)return;DocketPDF.download(out.files);$('#msg').textContent=`Downloading ${out.files.length} PDFs.`};
function listText(){
  const w=week();
  let t=`DOCKET · ${STORE_NAME[S.store]} · est. ${money(w.total)}\n`;
  const by={};w.items.forEach(x=>{(by[ING[x.id].a]??=[]).push(x)});
  ['M','F','D','Z','P','B','G','K'].filter(a=>by[a]).forEach(a=>{t+=`\n${AISLE[a].toUpperCase()}\n`;by[a].forEach(x=>{t+=`[ ] ${ING[x.id].n}: ${x.packs} x ${packLabel(x.id,x.pk)}\n`})});
  t+=`\nDINNERS: ${S.sel.map(id=>R.find(r=>r.id===id).n).join(', ')}`;
  return t;
}
if(navigator.share){$('#share').hidden=false;$('#share').onclick=async()=>{if(!S.sel.length){$('#msg').textContent='Pick at least one dinner first.';return}try{await navigator.share({title:'Our Docket for the week',text:planText()})}catch(e){}}}
function fillPrint(){
  const n=spm();
  $('#print-recipes').innerHTML='<h2>Recipes</h2>'+S.sel.map(id=>{const r=R.find(x=>x.id===id);return`<article><h3>${esc(r.n)} · ${timeLabel(r)} · ${n} serves</h3><ul>${splitLines(r,n).map(([i,a])=>`<li>${kAmt(i,a)} ${esc(iname(i))}</li>`).join('')}</ul><ol>${r.m.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></article>`}).join('');
}
window.addEventListener('beforeprint',fillPrint);
$('#print').onclick=()=>{if(!S.sel.length){$('#msg').textContent='Pick at least one dinner first.';return}fillPrint();window.print()};
try{const e=localStorage.getItem('docket-email');if(e)$('#email').value=e}catch(e){}
renderKitCfg();render();
