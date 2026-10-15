// ---------- State ----------
const S={people:2,gf:0,dinners:4,lunch:true,budget:120,budgetAuto:true,minProt:40,store:'coles',skip:{pork:false,seafood:false,red:false},sel:['butter','tuscan','carnitas','friedrice'],sort:'cost',col:'all',done:{}};
const STAPLES=(window.DOCKET_CONFIG||{}).staplesPerWeek??15;
let fresh=true;try{const s=JSON.parse(localStorage.getItem('docket-state')||'null');if(s)fresh=false;if(s&&typeof s==='object'){Object.assign(S,s,{skip:{...S.skip,...(s.skip||{})}});if(s.budgetAuto===undefined)S.budgetAuto=false}}catch(e){}
delete S.kits;S.sel=S.sel.filter(id=>R.some(r=>r.id===id));
S.people=Math.min(8,Math.max(1,S.people));S.gf=Math.min(S.gf,S.people);
if(['all','picks','quick','everyday','premium','lighter'].includes(location.hash.slice(1)))S.col=location.hash.slice(1);
function save(){try{localStorage.setItem('docket-state',JSON.stringify(S))}catch(e){}}

// ---------- Pricing ----------
const SEA=window.DOCKET_SEASON||{factor:()=>1,recipe:()=>({isIn:false,inn:[]}),isNew:()=>false,picks:()=>[]};
function hash(s){let h=7;for(const ch of s)h=(h*31+ch.charCodeAt(0))%1000;return h/1000}
// Real prices you've checked (js/prices.js) win; otherwise Woolies and Aldi are estimated from Coles.
const PRICES=window.DOCKET_PRICES||{coles:{},woolies:{},aldi:{}};
function price(id,store=S.store){
  const it=ING[id];const real=(PRICES[store]||{})[id];
  if(real)return{p:real.p,pk:real.pk||it.pk,fb:false,real:true,at:real.at,wt:!!real.wt,sp:!!real.sp,was:real.was,alt:real.alt};
  const c=(PRICES.coles||{})[id];const base=c?{p:c.p,pk:c.pk||it.pk}:{p:+(it.p*SEA.factor(id)).toFixed(2),pk:it.pk};
  if(store==='coles')return{...base,fb:false};
  if(store==='woolies')return{p:+(base.p*(0.95+hash(id)*0.11)).toFixed(2),pk:base.pk,fb:false};
  if(it.noAldi)return{...base,fb:true};
  return{p:+(base.p*(0.79+hash(id+'a')*0.09)).toFixed(2),pk:base.pk,fb:false};
}
// Meal kits sell boxes for 2 or 4 people, so small households still pay for at least 2 serves a meal
// A realistic starting budget: small households carry some fixed costs (whole packs, jars) that larger ones spread out
// Tested against 4,000 random weeks: covers about 4 in 5 weeks at every household size
// When live prices land, scale by how this week's shelf prices compare with the estimates the formula was tuned on
function estPrice(id,store){const it=ING[id];if(store==='woolies')return it.p*(0.95+hash(id)*0.11);if(store==='aldi'&&!it.noAldi)return it.p*(0.79+hash(id+'a')*0.09);return it.p}
const IDX={};
function priceIndex(store=S.store){if(IDX[store])return IDX[store];let est=0,cur=0;R.forEach(r=>r.i.forEach(([id,q])=>{const pr=price(id,store);est+=q/ING[id].pk*estPrice(id,store);cur+=q/pr.pk*pr.p}));return IDX[store]=Math.min(1.35,Math.max(.8,Math.round(cur/est*100)/100))}
function autoBudget(){const serves=S.people*(S.lunch?2:1)*S.dinners;return Math.ceil((70+serves*7.5*priceIndex()+(S.people===1?25:0))/10)*10}
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
function inCol(r,picks){return S.col==='all'||(S.col==='picks'?(picks||weekPicks()).includes(r.id):S.col==='quick'?r.t<=30:tierOf(r)===S.col)}
function weekPicks(){return SEA.picks(serveCostColes,{allowed:r=>allowed(r)&&serveProt(r)>=S.minProt})}
function serveCostColes(r){return r.i.reduce((s,[id,a])=>{const pr=price(id,'coles');return s+a/pr.pk*pr.p},0)}
function allowed(r){const t=tags(r);return!Object.keys(S.skip).some(k=>S.skip[k]&&t.has(k))}

function week(){
  const agg={};const n=spm();
  S.sel.forEach(sid=>{const r=R.find(x=>x.id===sid);if(!r)return;splitLines(r,n).forEach(([id,a])=>{agg[id]=(agg[id]||0)+a})});
  const items=Object.entries(agg).map(([id,amt])=>{
    const it=ING[id];const pr=price(id);
    const base={id,amt,pk:pr.pk,real:!!pr.real,at:pr.at,pan:!!it.pan,pack:pr.p,fb:pr.fb,sp:!!pr.sp};
    if(it.pan)return{...base,packs:1,cost:amt/pr.pk*pr.p,label:'',left:0};
    if(it.wt&&(!pr.real||pr.wt)){const buy=it.u==='ea'?Math.ceil(amt):Math.max(50,Math.ceil(amt/50)*50);return{...base,packs:1,cost:buy/pr.pk*pr.p,label:`about ${fmtAmt(id,buy)}`,left:buy-amt,bought:buy}}
    // Cheapest mix of the big pack and (if there is one) a smaller pack
    let best=null;const alt=pr.alt?{pk:pr.alt[0],p:pr.alt[1]}:!pr.real&&it.alt?{pk:it.alt[0],p:pr.p*(it.alt[1]/it.p)}:null;
    const maxBig=Math.max(1,Math.ceil(amt/pr.pk-1e-6));
    for(let nb=0;nb<=maxBig;nb++){
      const rest=Math.max(0,amt-nb*pr.pk);let ns=0;
      if(rest>1e-6){if(!alt)continue;ns=Math.ceil(rest/alt.pk-1e-6)}
      if(nb===0&&ns===0)continue;
      const cost=nb*pr.p+(alt?ns*alt.p:0);const bought=nb*pr.pk+(alt?ns*alt.pk:0);
      if(!best||cost<best.cost-1e-6||(Math.abs(cost-best.cost)<1e-6&&bought<best.bought))best={nb,ns,cost,bought};
    }
    const parts=[];if(best.nb)parts.push(`${best.nb} × ${packLabel(id,pr.pk)}`);if(best.ns)parts.push(`${best.ns} × ${packLabel(id,alt.pk)}`);
    return{...base,packs:best.nb+best.ns,cost:best.cost,label:parts.join(' + '),left:best.bought-amt,bought:best.bought};
  });
  const shop=items.reduce((s,x)=>s+x.cost,0);
  const eaten=items.reduce((s,x)=>s+(x.pan||!x.bought?x.cost:x.cost*Math.min(1,x.amt/x.bought)),0)+(S.sel.length?STAPLES:0);
  const serves=S.sel.length*n;
  const prot=S.sel.length?S.sel.reduce((s,id)=>s+serveProt(R.find(r=>r.id===id)),0)/S.sel.length:0;
  return{items,shop,eaten,total:shop+(S.sel.length?STAPLES:0),serves,prot};
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
const plural=w=>/(tato|mato|lli|ch|sh)$/.test(w)?w+'es':w+'s';
function kAmt(id,a){const it=ING[id];
  if(it.cl){const v=Math.max(1,Math.round(a*it.cl));return`${v} clove${v>1?'s':''}`}
  if(it.ea&&it.u==='g'){const n=a/it.ea[0];return`${half(n)} ${n>1?plural(it.ea[1]):it.ea[1]} (${fmtAmt(id,a)})`}
  if(it.pl==='tin'||it.pl==='can')return`${half(a/it.pk)} tin${a/it.pk>1?'s':''}`;
  if(it.whole){const v=Math.max(1,Math.ceil(a-1e-6));return String(v)}
  if(it.ea&&it.u==='ea'){const v=a<1?Math.max(.25,Math.round(a*4)/4):Math.ceil(a*2)/2;const w=it.ea[1];return /bunch$/.test(w)?`${frac(v)} bunch${v>1?'es':''}`:frac(v)}
  if(it.u==='ml')return spoons(a);
  if(it.tsp){const t=a/it.tsp;return t>=3?`${half(t/3)} tbsp`:`${half(t)} tsp`}
  if(it.tbsp){const t=a/it.tbsp;return t>6?fmtAmt(id,a):`${half(t)} tbsp`}
  if(it.cup&&a/it.cup>=.25){const c=a/it.cup;return`${frac(c)} cup${Math.round(c*4)/4>1?'s':''} (${fmtAmt(id,a)})`}
  return fmtAmt(id,a)}
const iname=id=>ING[id].n.replace(/\s*\([^)]*\)$/,'');
// Method steps: a plain string, or {h: heading, s: text}. Text can hold {id} or {id*0.5} markers,
// filled with that ingredient's amount for the household, e.g. "{lime}" -> "2 limes".
const stepOf=s=>typeof s==='string'?{h:'',s}:s;
function ingPhrase(id,a,adj){const it=ING[id];const amt=kAmt(id,a);const pre=adj?adj+' ':'';
  if(it.cl){const v=Math.max(1,Math.round(a*it.cl));return`${v} ${pre}garlic clove${v>1?'s':''}`}
  if(it.ea&&it.u==='g')return adj?amt.replace(/^(\S+) /,`$1 ${adj} `):amt;
  if(it.u==='ea'&&it.ea&&it.ea[1]!=='bunch'){const w=it.ea[1];const many=a/it.ea[0]>1.0001;return`${amt} ${pre}${many?plural(w):w}`}
  return`${amt} ${pre}${iname(id).replace(/,.*$/,'').replace(/^\w+/,w=>/^(Greek|Thai|American|Chinese|Korean|Lebanese|Turkish|Japanese|Italian|Dijon)$/.test(w)?w:w.toLowerCase())}`}
// A describing word right before a marker ("crushed {garlic}") moves inside the amount: "4 crushed garlic cloves".
const ADJ='(?:finely |roughly |thinly )?(?:crushed|grated|sliced|diced|chopped|torn|softened|shredded)';
function fillStep(r,txt,n,wrap=x=>x){return String(txt).replace(new RegExp(`(?:\\b(${ADJ}) )?\\{(\\w+)(?:\\*([\\d.]+))?\\}`,'g'),(m,adj,id,f)=>{const q=(r.i.find(x=>x[0]===id)||[])[1];if(q==null||!ING[id])return m;return wrap(ingPhrase(id,q*n*(f?+f:1),adj))})}
// [{h, s}] with amounts filled in for n serves (s as plain text)
function methodSteps(r,c,n){return(c&&c.m||[]).map(x=>{const st=stepOf(x);return{h:st.h||'',s:fillStep(r,st.s,n)}})}
function packLabel(id,pk){const it=ING[id];pk=pk||it.pk;if(it.pl&&pk===it.pk)return it.pl;if(it.u==='g')return pk>=1000?(+(pk/1000).toFixed(2))+'kg':pk+'g';if(it.u==='ml')return pk>=1000?(+(pk/1000).toFixed(2))+'L':pk+'ml';return pk>1?pk+' pack':'each'}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const timeLabel=r=>r.t>=120?`${+(r.t/60).toFixed(1)} hr · ${r.h} min hands-on`:`${r.t} min`;

// ---------- Render ----------
function renderControls(){
  $('#people-v').textContent=S.people;$('#gf-v').textContent=Math.min(S.gf,S.people);$('#din-v').textContent=S.dinners;
  $('#people-dn').disabled=S.people<=1;$('#people-up').disabled=S.people>=8;
  $('#gf-dn').disabled=S.gf<=0;$('#gf-up').disabled=S.gf>=S.people;
  $('#din-dn').disabled=S.dinners<=1;$('#din-up').disabled=S.dinners>=7;
  if(S.budgetAuto)S.budget=autoBudget();$('#budget').value=S.budget;$('#budget-hint').hidden=!S.budgetAuto;$('#budget-reset').hidden=S.budgetAuto;$('#lunch').checked=S.lunch;$('#prot').value=S.minProt;$('#prot-v').textContent=S.minProt+'g';
  document.querySelectorAll('#store button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s===S.store));
  document.querySelectorAll('#skips .chip').forEach(b=>b.setAttribute('aria-pressed',!!S.skip[b.dataset.k]));
  $('#sort').value=S.sort;
}
const tierOf=r=>r.tier||'everyday';
const IMG=(window.DOCKET_IMG||{}).recipes||{};
const imgOf=(r,w)=>IMG[r.id]?`assets/img/food/${IMG[r.id]}-${w}.jpg`:'';
const COL_NOTE={picks:'',quick:'On the table in 30 minutes or less. Weeknight gold.',all:'',everyday:'Our staples: big flavour, big serves, best value.',premium:'Restaurant-style nights at home. Better cuts, a few more steps, still well under meal-kit prices.',lighter:'Lean protein, loads of veg, nothing fried or creamy. Still properly filling.'};
function renderCards(){
  const full=S.sel.length>=S.dinners;
  document.querySelectorAll('#cols button').forEach(b=>b.setAttribute('aria-selected',b.dataset.c===S.col));
  $('#col-note').textContent=COL_NOTE[S.col]||'';
  const PICKS=weekPicks();
  if(S.col==='picks')$('#col-note').textContent=`Quick, good value and in season for the week of ${SEA.weekLabel()}. Refreshed every Wednesday.`;
  let list=R.filter(allowed).filter(r=>inCol(r,PICKS)||S.sel.includes(r.id));
  const low=list.filter(r=>serveProt(r)<S.minProt&&!S.sel.includes(r.id));
  list=list.filter(r=>serveProt(r)>=S.minProt||S.sel.includes(r.id));
  const key={cost:r=>serveCost(r),prot:r=>-serveProt(r),time:r=>r.t}[S.sort];
  list.sort((a,b)=>key(a)-key(b));
  $('#cards').innerHTML=list.map(r=>{
    const sel=S.sel.includes(r.id);const p=serveProt(r);const g=gfType(r);
    return`<article class="card tier-${tierOf(r)}${sel?' sel':''}${!sel&&full?' off':''}">
      ${imgOf(r,640)?`<div class="card-img"><img src="${imgOf(r,640)}" alt="${esc(r.n)}" loading="lazy" width="640" height="480"></div>`:''}
      <div class="card-top"><div><div class="card-eyebrow">${tierOf(r)==='premium'?'<span class="tier prem">Premium</span>':tierOf(r)==='lighter'?'<span class="tier light">Lighter</span>':''}${esc(r.c)}</div><h3>${esc(r.n)}</h3><div class="meta">${timeLabel(r)}</div></div>
      <div class="ticket num"><b>${money(serveCost(r))}</b><small>per serve</small></div></div>
      ${r.d?`<p class="blurb">${esc(r.d)}</p>`:''}
      <div class="badges"><span class="badge p num">${Math.round(p)}g protein</span><span class="badge">${g==='yes'?'Gluten free':'GF swap'}</span>${SEA.isNew(r)?'<span class="badge new">New</span>':''}${PICKS.includes(r.id)&&S.col!=='picks'?'<span class="badge pick">This week</span>':''}${!RS.canSee(r.id,PICKS)?'<span class="badge lock">Members</span>':''}${SEA.recipe(r).isIn?'<span class="badge season">In season</span>':''}${r.t<=30?'<span class="badge quick">Quick</span>':''}${r.big&&spm()<4?'<span class="badge big">Best for 4+ serves</span>':''}</div>
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
  $('#st-serve').textContent=w.serves?money(w.eaten/w.serves):'$0';
  const carry=w.total-w.eaten;$('#carry').innerHTML=S.sel.length&&carry>2?`Food you'll eat this week: <b>${money(w.eaten,0)}</b>. The other ${money(carry,0)} stays in the fridge and pantry for next week.`:'';
  $('#st-prot').textContent=Math.round(w.prot)+'g';
  $('#st-picked').textContent=`${S.sel.length}/${S.dinners}`;
  $('#picked').innerHTML=S.sel.map(id=>{const r=R.find(x=>x.id===id);return`<li class="pk-${tierOf(r)}"><span>${esc(r.n)}</span><span class="num">${money(serveCost(r))}</span></li>`}).join('');
  // Kit tax
  const n=spm();const rows=KITS.map(k=>({n:kitLabel(k),v:kitCost(k,n,S.sel.length),ready:!!k.ready}));
  $('#bars').innerHTML=[`<div class="ln us"><span>Docket (food eaten)</span><span>${money(w.eaten)}</span></div>`,...rows.map(x=>`<div class="ln kit${x.ready?' ready':''}"><span>${esc(x.n)}</span><span>${money(x.v)}</span></div>`)].join('');
  const hf=rows[0];
  if(!S.sel.length){$('#dodged').innerHTML='';$('#kt-save').textContent='Pick some dinners to see what the kits would charge.';}
  else{
    const s=hf.v-w.eaten;
    const cheaper=rows.filter(r=>r.v<w.eaten);
    $('#dodged').innerHTML=s>0?`<div class="dodged"><span>KIT TAX DODGED</span><b class="num">${money(s)}</b></div>`:`<div class="dodged"><span>${esc(hf.n)} is cheaper</span><b class="num">${money(-s)}</b></div>`;
    let txt=s>0?`vs ${esc(hf.n)}. That's ${money(s*52,0)} a year.`:'';
    if(cheaper.length)txt+=` ${cheaper.map(c=>esc(c.n)).join(' and ')} ${cheaper.length>1?'are':'is'} cheaper on price alone this week. Docket dinners average ${Math.round(w.prot)}g protein a serve.`;
    else{const lo=rows.reduce((a,b)=>b.v<a.v?b:a);if(lo!==hf&&lo.v>w.eaten)txt+=` Even the cheapest, ${esc(lo.n)}, costs ${money(lo.v-w.eaten,0)} more.`}
    $('#kt-save').innerHTML=txt.trim();
  }
}
function renderKitCfg(){
  const n=spm();const box=k=>{if(k.ready)return'single serves';const sz=Object.keys(k.t).map(Number);return sz.join(', ')+'-person boxes'};
  $('#kitgrid').innerHTML=KITS.map(k=>`<div class="kitsrc"><b>${esc(kitLabel(k))}</b> <span>${k.ready?money(k.ps)+' a meal':box(k)+', '+money(k.del)+' delivery'}</span><small>${esc(k.src)}</small></div>`).join('');
}
function renderList(w){
  const by={};w.items.forEach(x=>{(by[ING[x.id].a]??=[]).push(x)});
  const order=['M','F','D','Z','P','B','G','K'];
  if(!w.items.length){$('#aisles').innerHTML='<p class="hint">Pick a dinner and your list builds itself here, merged and sorted by aisle.</p>';$('#list-meta').textContent='';return}
  $('#aisles').innerHTML=order.filter(a=>by[a]).map(a=>`<div class="aisle"><h3>${AISLE[a]}</h3>${by[a].sort((x,y)=>ING[x.id].n.localeCompare(ING[y.id].n)).map(x=>{
    const it=ING[x.id];const k='i-'+x.id;const done=!!S.done[x.id];
    const detail=x.pan?`you'll use ${kAmt(x.id,x.amt)} · if you're out: ${packLabel(x.id,x.pk)} ${money(x.pack)}`:`${fmtAmt(x.id,x.amt)} needed · ${x.label}${x.left>0&&ING[x.id].u!=='ea'&&x.left/x.bought>.15?` · <span class="left">${fmtAmt(x.id,x.left)} left over</span>`:''}`;
    return`<label class="item${done?' done':''}" for="${k}"><input type="checkbox" id="${k}" data-id="${x.id}" ${done?'checked':''}><span class="what">${esc(it.n)}<small>${detail}${x.fb?' · <span class="flag">Not at Aldi, priced at Coles</span>':''}${it.ck?' · check label for GF':''}${x.sp?' · <span class="ok">on special</span>':x.real?' · <span class="ok">price checked</span>':''}</small></span><span class="c num">${x.pan?'≈':''}${money(x.cost)}</span></label>`}).join('')}</div>`).join('');
  $('#list-meta').textContent=`${w.items.length} items · ${money(w.shop)} + ${money(STAPLES,0)} staples`;
  const buyable=w.items.filter(x=>!x.pan);const checked=buyable.filter(x=>x.real).length;
  const upd=PRICES.updated?new Date(PRICES.updated+'T12:00').toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'}):'';const sp=buyable.filter(x=>x.sp).length;
  $('#price-note').textContent=checked?`${checked===buyable.length?'Every price':`${checked} of ${buyable.length} prices`} on this list ${checked===1?'is':'are'} ${STORE_NAME[S.store]}'s shelf price${upd?`, updated ${upd}`:' this week'}.${sp?` ${sp} on special.`:''}${checked<buyable.length?' The rest are Docket estimates.':''}`:`Prices are Docket's estimates for ${STORE_NAME[S.store]}, so expect the shelf to be within a few dollars either way.`;
}
function useItUp(w){
  const left={};w.items.forEach(x=>{if(!x.pan&&x.left>0&&x.bought)left[x.id]=x.left});
  if(!Object.keys(left).length||!S.sel.length)return null;
  const n=spm();let best=null;
  R.filter(r=>!S.sel.includes(r.id)&&allowed(r)&&serveProt(r)>=S.minProt).forEach(r=>{
    let save=0;const used=[];
    splitLines(r,n).forEach(([id,a])=>{if(left[id]){const u=Math.min(a,left[id]);const pr=price(id);save+=u/pr.pk*pr.p;if(u/a>.3)used.push(iname(id).toLowerCase())}});
    if(used.length&&(!best||save>best.save))best={r,save,used:[...new Set(used)]};
  });
  return best&&best.save>=3?best:null;
}
function renderUse(w){
  const b=useItUp(w);const el=$('#useitup');if(!b){el.hidden=true;return}
  const room=S.sel.length<S.dinners;
  el.hidden=false;el.innerHTML=`<span class="eyebrow">Use it up</span><p><b>${esc(b.r.n)}</b> uses up your leftover ${esc(b.used.slice(0,3).join(', '))}, about ${money(b.save,0)} of food you've already bought.</p>${room?`<button class="btn" data-id="${b.r.id}" id="use-add">Add it</button>`:`<p class="hint">Your week's full. Swap a dinner out to fit it in.</p>`}`;
  const btn=$('#use-add');if(btn)btn.onclick=()=>{if(S.sel.length<S.dinners){S.sel.push(btn.dataset.id);render()}};
}
function render(){renderControls();renderCards();const w=week();renderWeek(w);renderList(w);renderUse(w);save();RS.load(S.sel.filter(canSee))}

// ---------- Recipe dialog ----------
function openRecipe(id){
  const r=R.find(x=>x.id===id);const n=spm();const lines=splitLines(r,n);const g=gfType(r);
  const checks=[...new Set(r.i.filter(([i])=>ING[i].ck).map(([i])=>ING[i].n))];
  $('#dlg-in').innerHTML=`${imgOf(r,1200)?`<div class="dlg-img"><img src="${imgOf(r,1200)}" alt="${esc(r.n)}"></div>`:''}<div class="dlg-head"><div><span class="eyebrow">${esc(r.c)} · ${timeLabel(r)}</span><h2>${esc(r.n)}</h2></div><button class="x" id="dlg-x" aria-label="Close">×</button></div>
   ${r.d?`<p class="lead-sm">${esc(r.d)}</p>`:''}
   <div class="badges" style="margin-top:10px"><span class="badge p num">${Math.round(serveProt(r))}g protein/serve</span><span class="badge num">${money(serveCost(r))}/serve at ${STORE_NAME[S.store]}</span><span class="badge">${g==='yes'?'Gluten free':'GF swap'}</span></div>
   <div class="dlg-cols"><div>${canSee(id)?`<h3>For ${n} serves</h3><ul class="ing">${lines.map(([i,a])=>`<li><span>${esc(iname(i))}</span><b class="num">${kAmt(i,a)}</b></li>`).join('')}</ul><p class="hint" style="margin-top:8px">Plus oil, salt and pepper.</p>`:`<h3>What's in it</h3><ul class="ing names">${lines.map(([i])=>`<li><span>${esc(iname(i))}</span></li>`).join('')}</ul><p class="hint" style="margin-top:8px">Amounts for your ${n} serves unlock with the method.</p>`}</div>
   <div id="dlg-method">${canSee(id)?'<h3>Method</h3><p class="hint">Loading the method...</p>':lockedHTML()}</div></div>
   <div id="dlg-notes"></div>
   ${checks.length?`<div class="gfnote" style="background:var(--peach)">Check the label on: ${esc(checks.join(', '))}.</div>`:''}`;
  const d=$('#dlg');if(!d.open)d.showModal();$('#dlg-x').onclick=()=>d.close();
  if(canSee(id))RS.get(id).then(c=>{if(!$('#dlg').open||!$('#dlg-method'))return;$('#dlg-method').innerHTML=methodHTML(c);$('#dlg-notes').innerHTML=notesHTML(c)}).catch(()=>{$('#dlg-method').innerHTML='<h3>Method</h3><p class="hint">Couldn\'t load the method. Check your connection and try again.</p>'});
  else{const f=$('#unlock-form');f.onsubmit=async e=>{e.preventDefault();const v=$('#unlock-email').value.trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){$('#unlock-msg').textContent='Enter an email address like you@example.com.';return}await RS.unlock(v,'recipe');try{localStorage.setItem('docket-email',v)}catch(err){}if(!$('#email').value)$('#email').value=v;render();openRecipe(id)}}
}
const RS=window.DocketRecipes;
const SITE=location.href.split(/[?#]/)[0].replace(/plan\.html$/,'');
function canSee(id){return RS.canSee(id,weekPicks())}
const methodHTML=c=>{const r=R.find(x=>x.id===c.id);const n=spm();return`<h3>Method</h3><ol class="steps">${c.m.map(x=>{const st=stepOf(x);return`<li>${st.h?`<b class="st-h">${esc(st.h)}</b> `:''}${fillStep(r,esc(st.s),n,a=>`<b>${esc(a)}</b>`)}</li>`}).join('')}</ol>`};
const notesHTML=c=>`${c.l?`<div class="gfnote"><b>Lunch:</b> ${esc(c.l)}</div>`:''}${c.g&&S.gf>0?`<div class="gfnote"><b>Gluten free (${Math.min(S.gf,S.people)}):</b> ${esc(c.g)}</div>`:''}`;
function lockedHTML(){return`<div class="locked"><h3>Method</h3><div class="ghost" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
  <div class="unlock"><span class="eyebrow">Members' recipe</span><p><b>Get the full method, lunch tip and gluten free notes for every Docket dinner.</b> Free while we're in beta. This week's picks are open to everyone.</p>
  <form id="unlock-form" class="unlock-form"><input type="email" id="unlock-email" placeholder="you@example.com" autocomplete="email" required aria-label="Your email"><button class="btn" type="submit">Unlock recipes</button></form><p class="hint" id="unlock-msg"></p></div></div>`}
$('#dlg').addEventListener('click',e=>{if(e.target.id==='dlg')e.target.close()});

// ---------- Plain text plan ----------
function planText(){
  const w=week();const n=spm();
  let t=`DOCKET · Your week at ${STORE_NAME[S.store]}\n${S.people} people${S.lunch?' + lunches':''} · ${S.sel.length} dinners · ${w.serves} serves\nEstimated shop: ${money(w.total)} (${money(w.total/Math.max(1,w.serves))} per serve)\n\nSHOPPING LIST\n`;
  const by={};w.items.forEach(x=>{(by[ING[x.id].a]??=[]).push(x)});
  ['M','F','D','Z','P','B','G','K'].filter(a=>by[a]).forEach(a=>{t+=`\n${AISLE[a].toUpperCase()}\n`;by[a].forEach(x=>{t+=x.pan?`[ ] ${ING[x.id].n} (check pantry, using ${kAmt(x.id,x.amt)})\n`:`[ ] ${ING[x.id].n}: ${x.label} (${money(x.cost)})\n`})});
  t+=`\nRECIPES\n`;
  S.sel.forEach(id=>{const r=R.find(x=>x.id===id);const ok=!!RS.peek(id);t+=`\n${r.n.toUpperCase()} (${timeLabel(r)})\n`;splitLines(r,n).forEach(([i,a])=>{t+=ok?`- ${kAmt(i,a)} ${iname(i)}\n`:`- ${iname(i)}\n`});const c=RS.peek(id);if(c){methodSteps(r,c,n).forEach((st,k)=>{t+=`${k+1}. ${st.h?st.h+'. ':''}${st.s}\n`});if(c.l)t+=`Lunch: ${c.l}\n`;if(c.g&&S.gf>0)t+=`Gluten free: ${c.g}\n`}else t+=`Full method: unlock it free at ${SITE}plan.html\n`});
  return t;
}

// ---------- Events ----------
const step=(k,d,min,max)=>()=>{S[k]=Math.max(min,Math.min(max,S[k]+d));if(k==='people')S.gf=Math.min(S.gf,S.people);if(k==='dinners'&&S.sel.length>S.dinners)S.sel=S.sel.slice(0,S.dinners);render()};
$('#people-dn').onclick=step('people',-1,1,10);$('#people-up').onclick=step('people',1,1,8);
$('#gf-dn').onclick=step('gf',-1,0,8);$('#gf-up').onclick=()=>{if(S.gf<S.people){S.gf++;render()}};
$('#din-dn').onclick=step('dinners',-1,1,7);$('#din-up').onclick=step('dinners',1,1,7);
$('#budget-reset').onclick=()=>{S.budgetAuto=true;render()};
$('#budget').addEventListener('input',e=>{S.budgetAuto=false;$('#budget-hint').hidden=true;$('#budget-reset').hidden=false;S.budget=Math.max(0,+e.target.value||0);const w=week();renderWeek(w);save()});
$('#lunch').onchange=e=>{S.lunch=e.target.checked;render()};
$('#prot').addEventListener('input',e=>{S.minProt=+e.target.value;render()});
$('#store').addEventListener('click',e=>{const b=e.target.closest('button');if(b){S.store=b.dataset.s;render()}});
$('#skips').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;S.skip[b.dataset.k]=!S.skip[b.dataset.k];S.sel=S.sel.filter(id=>allowed(R.find(r=>r.id===id)));render()});
$('#sort').onchange=e=>{S.sort=e.target.value;render()};
$('#cols').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;S.col=b.dataset.c;try{history.replaceState(null,'',S.col==='all'?location.pathname:'#'+S.col)}catch(err){}render()});
$('#cards').addEventListener('click',e=>{
  const v=e.target.closest('.view');if(v){openRecipe(v.dataset.id);return}
  const p=e.target.closest('.pick');if(!p)return;const id=p.dataset.id;
  if(S.sel.includes(id))S.sel=S.sel.filter(x=>x!==id);else if(S.sel.length<S.dinners)S.sel.push(id);render();
});
$('#fill').onclick=()=>{
  const pool=R.filter(r=>allowed(r)&&serveProt(r)>=S.minProt&&!S.sel.includes(r.id)&&inCol(r)&&!(r.big&&spm()<4)).sort((a,b)=>serveCost(a)-serveCost(b));
  const cats=new Set(S.sel.map(id=>R.find(r=>r.id===id).c));
  for(const r of pool){if(S.sel.length>=S.dinners)break;if(!cats.has(r.c)){S.sel.push(r.id);cats.add(r.c)}}
  for(const r of pool){if(S.sel.length>=S.dinners)break;if(!S.sel.includes(r.id))S.sel.push(r.id)}
  render();
};
$('#clear').onclick=()=>{S.sel=[];render()};
$('#aisles').addEventListener('change',e=>{const id=e.target.dataset.id;if(!id)return;S.done[id]=e.target.checked;e.target.closest('.item').classList.toggle('done',e.target.checked);save()});
function copyText(t,okMsg){
  const done=()=>{$('#msg').textContent=okMsg};
  try{navigator.clipboard.writeText(t).then(done,()=>fallback(t))}catch(e){fallback(t)}
  function fallback(t){const ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();$('#msg').textContent=ok?okMsg:'Copy was blocked here. Select the list above and copy it manually.'}
}
$('#copy').onclick=async()=>{if(!S.sel.length){$('#msg').textContent='Pick at least one dinner first.';return}if(S.sel.some(id=>canSee(id)&&!RS.peek(id)))await RS.load(S.sel.filter(canSee));copyText(planText(),'Plan copied: shopping list plus every recipe. Paste it into an email or the group chat.')};
async function makePdfs(){
  if(!window.jspdf||!window.DocketPDF){$('#msg').textContent='The PDF maker is still loading. Give it a second and try again.';return null}
  $('#msg').textContent='Building your PDFs...';
  await RS.load(S.sel.filter(canSee));
  return DocketPDF.build(S);
}
$('#send').onclick=async()=>{
  const v=$('#email').value.trim();
  if(!S.sel.length){$('#msg').textContent='Pick at least one dinner first.';return}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){$('#msg').textContent='Enter an email address like you@example.com.';return}
  try{localStorage.setItem('docket-email',v)}catch(e){}
  if(!RS.unlocked()&&RS.mode()==='email'){await RS.unlock(v,'send-plan');render()}
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
  ['M','F','D','Z','P','B','G','K'].filter(a=>by[a]).forEach(a=>{t+=`\n${AISLE[a].toUpperCase()}\n`;by[a].forEach(x=>{t+=`[ ] ${ING[x.id].n}: ${x.label||'check pantry'}\n`})});
  t+=`\nDINNERS: ${S.sel.map(id=>R.find(r=>r.id===id).n).join(', ')}`;
  return t;
}
if(navigator.share){$('#share').hidden=false;$('#share').onclick=async()=>{if(!S.sel.length){$('#msg').textContent='Pick at least one dinner first.';return}try{await navigator.share({title:'Our Docket for the week',text:planText()})}catch(e){}}}
function fillPrint(){
  const n=spm();
  $('#print-recipes').innerHTML='<h2>Recipes</h2>'+S.sel.map(id=>{const r=R.find(x=>x.id===id);const c=RS.peek(id);return`<article><h3>${esc(r.n)} · ${timeLabel(r)} · ${n} serves</h3><ul>${splitLines(r,n).map(([i,a])=>`<li>${c?kAmt(i,a)+' ':''}${esc(iname(i))}</li>`).join('')}</ul>${c?`<ol>${methodSteps(r,c,n).map(st=>`<li>${st.h?`<b>${esc(st.h)}.</b> `:''}${esc(st.s)}</li>`).join('')}</ol>`:`<p>Full method: unlock it free at ${esc(SITE)}plan.html</p>`}</article>`}).join('');
}
window.addEventListener('beforeprint',fillPrint);
$('#print').onclick=()=>{if(!S.sel.length){$('#msg').textContent='Pick at least one dinner first.';return}fillPrint();window.print()};
try{const e=localStorage.getItem('docket-email');if(e)$('#email').value=e}catch(e){}
// First visit: start on this week's picks
if(fresh&&window.DOCKET_SEASON){if(S.col==='all'&&!location.hash)S.col='picks';S.sel=weekPicks().slice(0,S.dinners)}
renderKitCfg();render();
