/* The calculator's numbers: programs, example inputs and the 12-month model.
   Shared by the page (index.html) and the email Worker (worker/), so an emailed report
   always shows exactly what the calculator showed. No DOM here.
   s = {period: 1|2, ltn: {...inputs}, camp: {...inputs}} */
export const MONTHS = 12;
export const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MON_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const PROGRAMS = {
  ltn: {name:'Intro program', who:'players', session:'session',
    fields:[
      {g:'p', key:'sessions', label:'Sessions per year', min:1, max:12, step:1},
      {g:'p', key:'spots', label:'Spots per session (all class times)', min:0, max:400, step:5},
      {g:'p', key:'full', label:'How full sessions get', min:0, max:100, step:5, suf:'%'},
      {g:'p', key:'price', cap:2500, label:'Price', min:0, max:1000, step:1, pre:'$'},
      {g:'p', key:'friend', label:'Paying players who bring a free friend', min:0, max:100, step:5, suf:'%'},
      {g:'g', key:'goal', label:'New players goal for the year', min:1, max:3000, step:5},
      {g:'g', key:'avgPrice', cap:2500, label:'What each new player pays for the program', min:0, max:1000, step:1, pre:'$'},
      {g:'c', key:'setup', cap:25000, label:'One-time setup', min:0, max:10000, step:50, pre:'$'},
      {g:'c', key:'ads', cap:25000, label:'Digital ads per session', min:0, max:10000, step:50, pre:'$', hint:'Runs 6 weeks pre-session. Billed by Meta or Google.'},
      {g:'c', key:'listDay', cap:500, label:'Digital ads between sessions, per day', min:0, max:100, step:1, pre:'$', row:true, hint:'Builds your first-to-know list for the next session'},
      {g:'c', key:'fee', cap:5000, label:'SignUpEngine monthly service', min:0, max:3000, step:25, pre:'$', wide:true, hint:'Platform, ad optimization, registration monitoring, page updates and eblasts'},
      {g:'s', key:'lvl2', label:'Player percentage enrolling in Phase II', min:0, max:100, step:5, suf:'%', row:true, hint:'For example, Learn Tennis Now II'},
      {g:'s', key:'lvl2Price', cap:5000, label:'Phase II program price', min:0, max:1000, step:1, pre:'$', row:true},
      {g:'s', key:'keep', label:'Player percentage enrolling in regular programming', min:0, max:100, step:5, suf:'%', row:true, hint:'Of the players in Phase II'},
      {g:'s', key:'spend', cap:15000, label:'What they spend', min:0, max:12000, step:50, pre:'$'},
      {g:'s', key:'renew', label:'Your retention estimate for regular programming', min:0, max:100, step:5, suf:'%', row:true, hint:'Regular programming players who renew at their one-year mark'}
    ]},
  camp: {name:'Camps', who:'campers', session:'camp week',
    fields:[
      {g:'x', key:'lastCampers', label:'Campers last year', min:0, max:5000, step:5},
      {g:'x', key:'lastRev', cap:3000000, label:'Camp revenue last year', min:0, max:3000000, step:1000, pre:'$'},
      {g:'x', key:'growNow', label:'Camper growth this year with SignUpEngine', min:0, max:100, step:5, suf:'%', row:true},
      {g:'p', key:'sessions', label:'Camp weeks per year', min:1, max:14, step:1},
      {g:'p', key:'wpc', label:'Average weeks per camper', min:1, max:14, step:0.1},
      {g:'e', key:'early', label:'Sign up in January (early bird)', min:0, max:80, step:5, suf:'%', row:true},
      {g:'t', key:'fspots', min:0, max:400, step:1}, {g:'t', key:'ffull', min:0, max:100, step:5}, {g:'t', key:'fprice', cap:5000, min:0, max:3000, step:5},
      {g:'t', key:'hspots', min:0, max:400, step:1}, {g:'t', key:'hfull', min:0, max:100, step:5}, {g:'t', key:'hprice', cap:5000, min:0, max:3000, step:5},
      {g:'c', key:'setup', cap:25000, label:'One-time setup', min:0, max:10000, step:50, pre:'$'},
      {g:'c', key:'ads', cap:50000, label:'Digital ads for the season', min:0, max:20000, step:50, pre:'$', hint:'Billed by Meta or Google.'},
      {g:'c', key:'fee', cap:5000, label:'SignUpEngine monthly service', min:0, max:3000, step:25, pre:'$', wide:true, hint:'Platform, ad optimization, registration monitoring, page updates and eblasts'},
      {g:'n', key:'grow', label:'Camp growth next season', min:0, max:50, step:1, suf:'%', row:true},
      {g:'n', key:'back', label:'Campers who come back next year', min:0, max:100, step:5, suf:'%', row:true},
      {g:'s', key:'keep', label:'Campers who join a year-round program', min:0, max:100, step:5, suf:'%', row:true},
      {g:'s', key:'renew', label:'Your retention estimate for year-round programs', min:0, max:100, step:5, suf:'%', row:true, hint:'Of the kids who join, how many stay in year-round programs the following year'},
      {g:'s', key:'spend', cap:20000, label:'What they spend', min:0, max:12000, step:50, pre:'$'}
    ]}
};
export const DEFAULTS = {
  ltn:  {sessions:4,  spots:80, full:80, price:59,  friend:50, setup:795, fee:600, ads:900,  lvl2:50, lvl2Price:80, keep:40, renew:70, spend:1000, spendMode:'year',
          mode:'goal', goal:150, avgPrice:59, start:0, listDay:5},
  camp: {sessions:10, wpc:1.7, fspots:40, ffull:85, fprice:585, hspots:24, hfull:70, hprice:350, early:40, grow:5, back:40, setup:1000, fee:795, ads:3000, keep:10, renew:70, spend:2400, spendMode:'year',
          mode:'new', lastCampers:80, lastRev:128000, growNow:25}
};
export const $ = n => (n<0?'−$':'$') + Math.round(Math.abs(n)).toLocaleString('en-US');
export const int = n => Math.round(n).toLocaleString('en-US');
// a dollar amount someone typed: cents shown only when they entered cents
export const $p = n => Math.abs(n*100 - Math.round(n)*100) < 0.5 ? $(n) : (n<0?'−$':'$') + Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
export const kfmt = n => n>=1000 ? '$'+(n/1000).toFixed(n>=10000?0:1).replace(/\.0$/,'')+'k' : '$'+Math.round(n);

/* Year one. Program revenue and costs are averaged across the 12 months;
   players who stay add to each month after their session. */
/* Camps follow a calendar year: launch in January, registration and ads through August,
   camp from mid-June, year-round families from September, planning next season in Nov-Dec. */
export const REG_MONTHS = 8;   // January through August
// typical shape of registrations after January: steady through spring, tapering into the summer
const REG_CURVE = [12,12,13,14,12,8,4];   // Feb..Aug
export function regProfile(early){
  const e = Math.min(80, Math.max(0, early))/100, tot = REG_CURVE.reduce((a,b)=>a+b,0);
  return [e, ...REG_CURVE.map(w=>(1-e)*w/tot), 0,0,0,0];
}
export function calcCamp(v, period){
  const p2 = period===2, existing = v.mode==='existing';
  let fWk=0, hWk=0, fRegs=0, hRegs=0, weeks=0, sF=0, sH=0, thisPlayers, players, regRev, totalRev, per=0, added=0;
  if(existing){
    // a camp they already run: only growth over last summer counts toward the return
    // with no campers last summer there is no revenue per camper to grow from
    per = v.lastCampers>0 ? v.lastRev/v.lastCampers : 0;
    thisPlayers = Math.round(v.lastCampers*(1+v.growNow/100));
    players = p2 ? Math.round(thisPlayers*(1+v.grow/100)) : thisPlayers;
    added = players - v.lastCampers; regRev = added*per; totalRev = v.lastRev + regRev;
  } else {
    fWk = Math.round(v.fspots*v.ffull/100); hWk = Math.round(v.hspots*v.hfull/100);
    fRegs = fWk*v.sessions; hRegs = hWk*v.sessions; weeks = fRegs+hRegs;
    thisPlayers = Math.round(weeks/Math.max(1, v.wpc));          // this season's campers
    // next season grows by the growth rate; returning families fill part of it
    const g = p2 ? v.grow/100 : 0;
    sF = p2 ? Math.round(fRegs*(1+g)) : fRegs; sH = p2 ? Math.round(hRegs*(1+g)) : hRegs;
    players = p2 ? Math.round((sF+sH)/Math.max(1, v.wpc)) : thisPlayers;
    regRev = sF*v.fprice + sH*v.hprice; totalRev = regRev;
  }
  const returning = p2 ? Math.min(players, Math.round(thisPlayers*v.back/100)) : 0, newCampers = players-returning;
  const adsSeason = p2 ? v.ads*newCampers/Math.max(1,thisPlayers) : v.ads;   // ads only need to find new campers
  const setup = p2 ? 0 : v.setup, feeYear = v.fee*MONTHS;
  const cost = setup + feeYear + adsSeason;
  // kids who join year-round programs; for an existing camp, only from the campers SignUpEngine added
  const y1Stayers = (existing ? Math.max(0, thisPlayers - v.lastCampers) : thisPlayers)*v.keep/100;
  const carry = p2 ? y1Stayers*v.renew/100 : 0;                // still enrolled a year later
  const joinNew = existing ? (p2 ? Math.max(0, players - thisPlayers)*v.keep/100 : y1Stayers)
    : (p2 ? newCampers : players)*v.keep/100;                  // new year-round families from this summer
  const spendMo = v.spendMode==='month' ? v.spend : v.spend/12;
  let cumP = 0;
  const prof = regProfile(v.early);
  const mo = Array.from({length:MONTHS}, (_,i)=>{
    const reg = prof[i];
    cumP += players*reg;
    const stayers = carry + (i>=8 ? joinNew : 0);
    return {players:cumP, campRev: regRev*reg, campTotal: totalRev*reg, stayers, stay:stayers*spendMo,
      inn: regRev*reg + stayers*spendMo,
      cost: v.fee + adsSeason*reg + (i===0?setup:0), fee: v.fee, ads: adsSeason*reg, setup: i===0?setup:0};
  });
  const stayYear = mo.reduce((a,x)=>a+x.stay,0);
  const bands = [
    {a:-0.5, b:4.5, label:'Registration opens'},
    {a:4.5, b:7.5, label:'Camp + registration'},
    {a:7.5, b:9.5, label:'Year-round'},
    {a:9.5, b:11.5, label:'Plan ahead'}
  ];
  return {key:'camp', v, camp:true, existing, per, added, totalRev, lastRev:v.lastRev, lastCampers:v.lastCampers, campInfo:{fWk, hWk, fRegs, hRegs, weeks}, season:{fRegs:sF, hRegs:sH, weeks:sF+sH}, thisPlayers, marks:[], bands, period, setup, carry, y1Stayers,
    perSession:fWk+hWk, players, paid:players, free:0, regRev, adsYear:adsSeason, adsSeason, feeYear, cost,
    avgCost:(feeYear+adsSeason)/MONTHS, mo, stayYear, totalIn:regRev+stayYear,
    stayersEnd: mo[MONTHS-1].stayers, stayEnd: mo[MONTHS-1].stay, returning, newCampers, joinNew};
}
export function calc(s, key){
  if(key==='camp') return calcCamp(s.camp, s.period);
  const v = s[key], camp = false;
  let perSession, players, paid, free, regRev, campInfo = null;
  if(camp){
    // camper-weeks for each option, then actual kids = camper-weeks / average weeks per camper
    const fWk = Math.round(v.fspots*v.ffull/100), hWk = Math.round(v.hspots*v.hfull/100);
    const fRegs = fWk*v.sessions, hRegs = hWk*v.sessions, weeks = fRegs+hRegs;
    perSession = fWk+hWk;
    players = Math.round(weeks/Math.max(1, v.wpc));
    paid = players; free = 0;
    regRev = fRegs*v.fprice + hRegs*v.hprice;
    campInfo = {fWk, hWk, fRegs, hRegs, weeks};
  } else if(v.mode==='goal'){
    // working backward from a player goal: spread the goal across the sessions
    players = Math.max(0, Math.round(v.goal)); perSession = players/Math.max(1, v.sessions);
    paid = players; free = 0;
    regRev = players*v.avgPrice;
  } else {
    perSession = Math.round(v.spots*v.full/100);   // whole players per session
    players = perSession*v.sessions;
    const bring = v.friend/100;              // share of paying players who bring one free friend
    const share = bring/(1+bring);           // share of all players who came free
    paid = Math.round(players*(1-share)); free = players-paid;   // whole players
    regRev = paid*v.price;
  }
  // digital ads by month: each session's budget runs over the 45 days before it starts,
  // and between campaigns ads drop to a small daily amount to build the first-to-know list.
  // The first session's campaign happens before the window, so it is counted in month 1.
  const D = 365/MONTHS, RAMP = 45, adsMo = Array(MONTHS).fill(0), covered = Array(MONTHS).fill(0);
  let preAds = 0;
  for(let i=0;i<v.sessions;i++){
    const b = Math.floor(MONTHS*i/v.sessions)*D, a = b - RAMP;
    // the first session's campaign runs before the 12 months: in the first 12 months it is part of the pre-launch
    if(a < 0){ const amt = v.ads*Math.min(RAMP, -a)/RAMP; if(s.period===1) preAds += amt; else adsMo[0] += amt; }
    for(let k=0;k<MONTHS;k++){ const ov = Math.max(0, Math.min(b,(k+1)*D) - Math.max(a,k*D));
      if(ov>0){ adsMo[k] += v.ads*ov/RAMP; covered[k] += ov; } }
  }
  const listMo = adsMo.map((_,k)=> (v.listDay||0)*Math.max(0, D - covered[k]));
  // which month each session's ads land in most, for the chart's hover notes
  const campaigns = Array.from({length:v.sessions},(_,i)=>{ const m = Math.floor(MONTHS*i/v.sessions), b = m*D, a = b-RAMP;
    let peak = 0, best = -1; for(let k=0;k<MONTHS;k++){ const ov = Math.max(0, Math.min(b,(k+1)*D)-Math.max(a,k*D)); if(ov>best){ best = ov; peak = k; } }
    return {m, peak: a<0 ? 0 : peak}; });
  const campaignAds = v.ads*v.sessions, listYear = listMo.reduce((a,b)=>a+b,0);
  listMo.forEach((x,k)=> adsMo[k] += x);
  const adsYear = campaignAds + listYear;
  // first 12 months: about 6 weeks of pre-launch (setup, the first month's fee and the first session's ads) come first
  const feeYear = v.fee*(MONTHS + (s.period===1 ? 1 : 0));
  const period = s.period, setup = period===1 ? v.setup : 0;
  const cost = setup + feeYear + adsYear;
  const lvl2Players = camp ? 0 : players*v.lvl2/100, lvl2Rev = lvl2Players*(v.lvl2Price||0);   // second-level program
  const avgIn = (regRev+lvl2Rev)/MONTHS, avgCost = (feeYear+adsYear)/MONTHS;
  // whole players per session; in goal mode the remainder goes to the first sessions
  const sizes = Array.from({length:v.sessions}, (_,i)=> v.mode==='goal' ? Math.floor(players/v.sessions) + (i < players % v.sessions ? 1 : 0) : perSession);
  // each session's registrations come in the month it starts and its Phase II the month after (the last
  // session's Phase II stays in month 12, so the year's total is all here). Spreading later sessions evenly
  // would count their money before they start and make break-even look earlier than it is.
  const inMo = Array(MONTHS).fill(0), perPlayer = players>0 ? regRev/players : 0, l2Each = v.lvl2/100*(v.lvl2Price||0);
  sizes.forEach((n,i)=>{ const m = Math.floor(MONTHS*i/v.sessions); inMo[m] += n*perPlayer; inMo[Math.min(MONTHS-1, m+1)] += n*l2Each; });
  const pre = period===1 ? {inn:0, cost:setup+v.fee+preAds, fee:v.fee, ads:preAds, setup} : null;
  // when players arrive and when the ones who stay start spending
  const arrivals = Array(MONTHS).fill(0), joins = Array(MONTHS).fill(0), counts = Array(MONTHS).fill(0);
  const marks = [], y1Groups = [];
  // joins = when stayers start spending (month after); counts = when they show as still playing
  if(camp){ const k = players*v.keep/100; arrivals[6] += players; joins[8] += k; counts[8] += k; marks.push({i:6, label:'Camp season', add:players, unitLabel:'campers'}); }   // camp in July, year-round programs from September
  else for(let i=0;i<v.sessions;i++){ const m = Math.floor(MONTHS*i/v.sessions);
    // players go on to the second-level program the month after their session, and those who move into
    // regular programming start paying the month after that
    const size = sizes[i], k = size*v.lvl2/100*v.keep/100;
    arrivals[m] += size; if(m+2<MONTHS) joins[m+2] += k; counts[Math.min(m+2, MONTHS-1)] += k; y1Groups.push({e:m+2, k});
    marks.push({i:m, label:`Session ${i+1}`, short:`S${i+1}`, add:size}); }
  // next 12 months: first-year players keep playing through their one-year term, and the retention
  // estimate applies at each group's one-year mark, so month 13 picks up right where month 12 left off
  const y1Stayers = counts.reduce((a,b)=>a+b,0);
  const carryMo = Array(MONTHS).fill(0);
  if(period===2) y1Groups.forEach(gp=>{ for(let i=0;i<MONTHS;i++){
    if(gp.e>=MONTHS){ if(i>=gp.e-MONTHS) carryMo[i] += gp.k; }        // started after month 12: still in their first term
    else carryMo[i] += i<gp.e ? gp.k : gp.k*v.renew/100; } });
  const carry = carryMo[MONTHS-1];   // first-year players still playing at the end of the next 12 months
  let cumP = 0, cumS = 0, cumC = 0;
  const spendMo = v.spendMode==='month' ? v.spend : v.spend/12;
  const mo = arrivals.map((a,i)=>{ cumP += a; cumS += joins[i]; cumC += counts[i]; return {players:cumP, stayers:cumC+carryMo[i], stay:(cumS+carryMo[i])*spendMo, inn:inMo[i]+(cumS+carryMo[i])*spendMo, cost:v.fee+adsMo[i]+(i===0&&!pre?setup:0), fee:v.fee, ads:adsMo[i], setup:i===0&&!pre?setup:0}; });
  const stayYear = mo.reduce((s,x)=>s+x.stay,0);
  return {key, v, camp, campInfo, marks, pre, period, setup, campaignAds, listYear, campaigns, carry, y1Stayers, perSession, players, paid, free, regRev, adsYear, feeYear, cost, avgIn, avgCost, mo, stayYear,
    lvl2Players, lvl2Rev, totalIn: regRev+lvl2Rev+stayYear, stayersEnd: mo[MONTHS-1].stayers, stayEnd: mo[MONTHS-1].stay};
}
export function combine(a, b){
  const mo = a.mo.map((x,i)=>{ const y=b.mo[i]; return {players:x.players+y.players, stayers:x.stayers+y.stayers, stay:x.stay+y.stay, inn:x.inn+y.inn, cost:x.cost+y.cost}; });
  const sum = k => a[k]+b[k];
  return {both:true, players:sum('players'), paid:sum('paid'), free:sum('free'), regRev:sum('regRev'), adsYear:sum('adsYear'), feeYear:sum('feeYear'),
    cost:sum('cost'), avgCost:sum('avgCost'), stayYear:sum('stayYear'), totalIn:sum('totalIn'), stayersEnd:sum('stayersEnd'), stayEnd:sum('stayEnd'),
    setup: a.setup+b.setup, carry: a.carry+b.carry, y1Stayers: a.y1Stayers+b.y1Stayers, period: a.period, fee: a.v.fee+b.v.fee, mo, marks: a.marks.concat(b.marks), a, b};
}


/* ---------- inputs from a link or a request ---------- */
export const CHOICES = {
  ltn: {mode:['goal','sessions'], spendMode:['year','month']},
  camp: {mode:['new','existing'], spendMode:['year','month']}
};
// inputs that only take whole numbers: percentages and counts
export const WHOLE = ['full','friend','keep','lvl2','renew','back','grow','early','ffull','hfull','growNow','sessions','goal','spots','fspots','hspots','lastCampers'];
/* The limits every value is held to, typed, dragged, linked or emailed: the field's minimum, its cap (or
   its slider's max), whole numbers where they must be, cents at most. v = that program's inputs.
   Returns null for a key that isn't a number field. */
export function clampInput(key, k, val, v){
  const f = PROGRAMS[key].fields.find(x=>x.key===k);
  if(!f || !Number.isFinite(val)) return null;
  val = Math.max(f.min, val);
  val = Math.min(k==='spend' ? (v.spendMode==='month' ? Math.round((f.cap||12000)/12) : (f.cap||12000)) : (f.cap ?? f.max), val);
  if(WHOLE.includes(k)) val = Math.round(val);
  else if(k==='wpc') val = Math.round(val*10)/10;
  else val = Math.round(val*100)/100;
  if(key==='camp' && k==='wpc') val = Math.min(v.sessions, val);   // a camper can't average more weeks than the camp runs
  return val;
}
/* Builds both programs' inputs from [name, value] pairs such as ['ltn.spots', '120'], starting from
   the example numbers. Unknown names, non-numbers and out-of-range values never get through. */
export function readInputs(pairs){
  const out = {ltn:{...DEFAULTS.ltn}, camp:{...DEFAULTS.camp}}, nums = [];
  for(const [name, raw] of pairs){
    const [key, k] = String(name).split('.'), val = String(raw);
    if(!k || !DEFAULTS[key] || !Object.hasOwn(DEFAULTS[key], k)) continue;
    const ch = CHOICES[key][k];
    if(ch){ if(ch.includes(val)) out[key][k] = val; }
    else if(val.trim()!=='') nums.push([key, k, Number(val)]);
  }
  // numbers after the choices, because the spend cap depends on whether spend is per year or per month
  for(const [key, k, n] of nums){
    if(k==='start'){ if(Number.isInteger(n) && n>=0 && n<MONTHS) out[key].start = n; continue; }
    const c = clampInput(key, k, n, out[key]);
    if(c!==null) out[key][k] = c;
  }
  out.camp.wpc = Math.max(1, Math.min(out.camp.wpc, out.camp.sessions));
  return out;
}
// the URL hash for these inputs: every number that differs from the example, plus the tab
export function hashParams(s, tab){
  const q = new URLSearchParams();
  if(tab && tab!=='ltn') q.set('tab', tab);
  for(const key of ['ltn','camp']) for(const k of Object.keys(DEFAULTS[key]))
    if(s[key][k]!==DEFAULTS[key][k]) q.set(`${key}.${k}`, s[key][k]);
  return q.toString();
}

/* ---------- break-even ---------- */
// first month where revenue so far covers expenses so far, counting any pre-launch period (i = -1 if never).
// first: it happens before the second session starts, so the first session paid for itself
export function breakEven(r){
  const inn = (r.pre?[r.pre.inn]:[]).concat(r.mo.map(x=>x.inn)), cost = (r.pre?[r.pre.cost]:[]).concat(r.mo.map(x=>x.cost)), off = r.pre?1:0;
  let ri=0, ci=0, i=-1;
  for(let k=0;k<inn.length;k++){ ri += inn[k]; ci += cost[k]; if(ri >= ci-0.5 && ri>0){ i = k; break; } }
  const m = i - off, month = i<0 ? '' : m<0 ? 'pre-launch' : r.camp ? MON_FULL[m] : MON_FULL[((r.v.start||0)+m)%12];
  const second = !r.camp && r.v.sessions>1 ? Math.floor(MONTHS/r.v.sessions) : MONTHS;
  let rr=0, cc=0; if(i>=0) for(let k=0;k<=i;k++){ rr += inn[k]; cc += cost[k]; }
  return {i, month, first: !r.camp && i>=0 && m<second, rev: rr, cost: cc};
}
