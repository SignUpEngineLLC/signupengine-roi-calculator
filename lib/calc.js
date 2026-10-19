/* The calculator's numbers: programs, example inputs and the 12-month model.
   Shared by the page (index.html) and the email Worker (worker/), so an emailed report
   always shows exactly what the calculator showed. No DOM here.
   s = {period: 1|2, ltn: {...inputs}, camp: {...inputs}} */
export const MONTHS = 12;
export const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const PROGRAMS = {
  ltn: {name:'Adult beginner program', who:'players', session:'session',
    fields:[
      {g:'p', key:'sessions', label:'Sessions per year', min:1, max:12, step:1},
      {g:'p', key:'spots', label:'Spots per session (all class times)', min:0, max:400, step:5},
      {g:'p', key:'full', label:'How full sessions get', min:0, max:100, step:5, suf:'%'},
      {g:'p', key:'price', label:'Price', min:0, max:300, step:1, pre:'$'},
      {g:'p', key:'friend', label:'Paying players who bring a free friend', min:0, max:100, step:5, suf:'%'},
      {g:'c', key:'setup', label:'One-time setup', min:0, max:10000, step:50, pre:'$'},
      {g:'c', key:'ads', label:'Digital ads per session', min:0, max:10000, step:50, pre:'$', hint:'Billed to your card by Meta or Google, not SignUpEngine'},
      {g:'c', key:'fee', label:'SignUpEngine platform per month', min:0, max:3000, step:25, pre:'$', wide:true, hint:'Ad management, campaign monitoring, eblasts and registration support'},
      {g:'s', key:'keep', label:'Keep playing after the program', min:0, max:100, step:5, suf:'%', row:true},
      {g:'s', key:'renew', label:'Of those, still playing next year', min:0, max:100, step:5, suf:'%', row:true},
      {g:'s', key:'spend', label:'What they spend', min:0, max:12000, step:50, pre:'$'}
    ]},
  camp: {name:'Summer camps', who:'campers', session:'camp week',
    fields:[
      {g:'x', key:'lastCampers', label:'Campers last summer', min:0, max:5000, step:5},
      {g:'x', key:'lastRev', label:'Camp revenue last summer', min:0, max:3000000, step:1000, pre:'$'},
      {g:'x', key:'growNow', label:'Camper growth this summer with SignUpEngine', min:0, max:100, step:5, suf:'%', row:true},
      {g:'p', key:'sessions', label:'Camp weeks per summer', min:1, max:14, step:1},
      {g:'p', key:'wpc', label:'Average weeks per camper', min:1, max:14, step:0.1},
      {g:'e', key:'early', label:'Sign up in January (early bird)', min:0, max:80, step:5, suf:'%', row:true},
      {g:'t', key:'fspots', min:0, max:400, step:1}, {g:'t', key:'ffull', min:0, max:100, step:5}, {g:'t', key:'fprice', min:0, max:3000, step:5},
      {g:'t', key:'hspots', min:0, max:400, step:1}, {g:'t', key:'hfull', min:0, max:100, step:5}, {g:'t', key:'hprice', min:0, max:3000, step:5},
      {g:'c', key:'setup', label:'One-time setup', min:0, max:10000, step:50, pre:'$'},
      {g:'c', key:'ads', label:'Digital ads for the season', min:0, max:20000, step:50, pre:'$', hint:'Billed to your card by Meta or Google, not SignUpEngine'},
      {g:'c', key:'fee', label:'SignUpEngine platform per month', min:0, max:3000, step:25, pre:'$', wide:true, hint:'Ad management, campaign monitoring, eblasts and registration support'},
      {g:'n', key:'grow', label:'Camp growth next season', min:0, max:50, step:1, suf:'%', row:true},
      {g:'n', key:'back', label:'Campers who come back next summer', min:0, max:100, step:5, suf:'%', row:true},
      {g:'s', key:'keep', label:'Campers who join a year-round program', min:0, max:100, step:5, suf:'%', row:true},
      {g:'s', key:'renew', label:'Of those, still enrolled next year', min:0, max:100, step:5, suf:'%', row:true},
      {g:'s', key:'spend', label:'What they spend', min:0, max:12000, step:50, pre:'$'}
    ]}
};
export const DEFAULTS = {
  ltn:  {sessions:4,  spots:80, full:80, price:59,  friend:50, setup:1000, fee:600, ads:600,  keep:20, renew:70, spend:1200, spendMode:'year'},
  camp: {sessions:10, wpc:1.7, fspots:40, ffull:85, fprice:585, hspots:24, hfull:70, hprice:350, early:40, grow:5, back:40, setup:1000, fee:795, ads:3000, keep:10, renew:70, spend:2400, spendMode:'year',
          mode:'new', lastCampers:80, lastRev:128000, growNow:25}
};
export const $ = n => (n<0?'−$':'$') + Math.round(Math.abs(n)).toLocaleString('en-US');
export const int = n => Math.round(n).toLocaleString('en-US');
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
    return {players:cumP, campRev: regRev*reg, campTotal: totalRev*reg, campLast: existing ? v.lastRev*reg : 0, stayers, stay:stayers*spendMo,
      inn: regRev*reg + stayers*spendMo,
      cost: v.fee + adsSeason*reg + (i===0?setup:0)};
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
  } else {
    perSession = Math.round(v.spots*v.full/100);   // whole players per session
    players = perSession*v.sessions;
    const bring = v.friend/100;              // share of paying players who bring one free friend
    const share = bring/(1+bring);           // share of all players who came free
    paid = Math.round(players*(1-share)); free = players-paid;   // whole players
    regRev = paid*v.price;
  }
  const adsYear = camp ? v.ads : v.ads*v.sessions;
  const feeYear = v.fee*MONTHS;
  const period = s.period, setup = period===1 ? v.setup : 0;
  const cost = setup + feeYear + adsYear;
  const avgIn = regRev/MONTHS, avgCost = (feeYear+adsYear)/MONTHS;
  // when players arrive and when the ones who stay start spending
  const arrivals = Array(MONTHS).fill(0), joins = Array(MONTHS).fill(0), counts = Array(MONTHS).fill(0);
  const marks = [];
  // joins = when stayers start spending (month after); counts = when they show as still playing
  if(camp){ const k = players*v.keep/100; arrivals[6] += players; joins[8] += k; counts[8] += k; marks.push({i:6, label:'Camp season', add:players, unitLabel:'campers'}); }   // camp in July, year-round programs from September
  else for(let i=0;i<v.sessions;i++){ const m = Math.floor(MONTHS*i/v.sessions), k = perSession*v.keep/100;
    arrivals[m] += perSession; if(m+1<MONTHS) joins[m+1] += k; counts[Math.min(m+1, MONTHS-1)] += k;
    marks.push({i:m, label:`Session ${i+1}`, short:`S${i+1}`, add:perSession}); }
  // next 12 months: players who stayed in the first 12 months carry over, less drop-off
  const y1Stayers = counts.reduce((a,b)=>a+b,0);
  const carry = period===2 ? y1Stayers*v.renew/100 : 0;
  let cumP = 0, cumS = carry, cumC = carry;
  const spendMo = v.spendMode==='month' ? v.spend : v.spend/12;
  const mo = arrivals.map((a,i)=>{ cumP += a; cumS += joins[i]; cumC += counts[i]; return {players:cumP, stayers:cumC, stay:cumS*spendMo, inn:avgIn+cumS*spendMo, cost:avgCost+(i===0?setup:0)}; });
  const stayYear = mo.reduce((s,x)=>s+x.stay,0);
  return {key, v, camp, campInfo, marks, period, setup, carry, y1Stayers, perSession, players, paid, free, regRev, adsYear, feeYear, cost, avgIn, avgCost, mo, stayYear,
    totalIn: regRev+stayYear, stayersEnd: mo[MONTHS-1].stayers, stayEnd: mo[MONTHS-1].stay};
}
export function combine(a, b){
  const mo = a.mo.map((x,i)=>{ const y=b.mo[i]; return {players:x.players+y.players, stayers:x.stayers+y.stayers, stay:x.stay+y.stay, inn:x.inn+y.inn, cost:x.cost+y.cost}; });
  const sum = k => a[k]+b[k];
  return {both:true, players:sum('players'), paid:sum('paid'), free:sum('free'), regRev:sum('regRev'), adsYear:sum('adsYear'), feeYear:sum('feeYear'),
    cost:sum('cost'), avgCost:sum('avgCost'), stayYear:sum('stayYear'), totalIn:sum('totalIn'), stayersEnd:sum('stayersEnd'), stayEnd:sum('stayEnd'),
    setup: a.setup+b.setup, carry: a.carry+b.carry, y1Stayers: a.y1Stayers+b.y1Stayers, period: a.period, fee: a.v.fee+b.v.fee, mo, marks: a.marks.concat(b.marks), a, b};
}


/* ---------- inputs from a link or a request ---------- */
export const CHOICES = {mode:['new','existing'], spendMode:['year','month']};
// inputs that can't go past their slider's max (percentages and counts); the rest can be typed higher
export const CAPPED = ['full','friend','keep','renew','back','grow','early','sessions','ffull','hfull','wpc','growNow'];
/* Builds both programs' inputs from [name, value] pairs such as ['ltn.spots', '120'], starting from
   the example numbers. Unknown names, non-numbers and out-of-range values never get through. */
export function readInputs(pairs){
  const out = {ltn:{...DEFAULTS.ltn}, camp:{...DEFAULTS.camp}};
  for(const [name, raw] of pairs){
    const [key, k] = String(name).split('.'), val = String(raw);
    if(!k || !DEFAULTS[key] || !Object.hasOwn(DEFAULTS[key], k)) continue;
    if(CHOICES[k]){ if(CHOICES[k].includes(val)) out[key][k] = val; continue; }
    const f = PROGRAMS[key].fields.find(x=>x.key===k), n = Number(val);
    if(f && val.trim()!=='' && Number.isFinite(n)) out[key][k] = Math.min(CAPPED.includes(k) ? f.max : 10000000, Math.max(f.min, n));
  }
  for(const key of ['ltn','camp']) out[key].sessions = Math.max(1, Math.round(out[key].sessions));
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
