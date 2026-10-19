/* The one-page report: what it says (reportData) and two ways to draw it.
   previewHTML is the in-page preview, styled by index.html's .em classes.
   emailHTML / emailText are the emailed version: tables and inline styles, because email
   clients drop most CSS (no grid or flex, and Gmail ignores classes in many places).
   Shared by the page and the Worker; no DOM here. Anything a visitor typed (name, club, role,
   note) is escaped where it is drawn; everything else is built from numbers. */
import {DEFAULTS, $, int, calc, combine} from './calc.js';

export const CONTACT_URL = 'https://signupengine.io/contact-us/';
export const TYPES = ['ltn','camp','both'];
export const ROLES = ['Director of Tennis','General Manager','COO','CEO or Owner','Program Director','Other'];
export const esc = s => String(s??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const xr = (i,c) => c>0 ? (i/c).toFixed(2)+'x' : 'n/a';
const stripTags = s => String(s).replace(/<[^>]+>/g, '');

// true when a program's inputs are still the example defaults
// (only the inputs the current camp type uses: a new camp ignores last summer, an existing one ignores the weekly table)
const EXISTING_ONLY = ['lastCampers','lastRev','growNow'], NEW_ONLY = ['sessions','wpc','fspots','ffull','fprice','hspots','hfull','hprice'];
export const isExample = (s, key) => Object.keys(DEFAULTS[key]).every(k => {
  if(k==='mode') return true;
  if(key==='camp' && (s.camp.mode==='existing' ? NEW_ONLY : EXISTING_ONLY).includes(k)) return true;
  return s[key][k]===DEFAULTS[key][k];
});
function basisItems(s, key){
  const v = s[key], sp = `${$(v.spend)} a ${v.spendMode!=='month'?'year':'month'}`;
  return key==='ltn' ? [
    `${v.sessions} sessions a year, ${v.spots} spots each, ${v.full}% full`,
    `${$(v.price)} per player, and ${v.friend}% of paying players bring a free friend`,
    `${v.keep}% keep playing, spending ${sp}, and ${v.renew}% of them are still playing a year later`,
    `${$(v.setup)} setup, ${$(v.fee)} a month for the platform, and ${$(v.ads)} in digital ads per session`
  ] : v.mode==='existing' ? [
    `${v.lastCampers} campers last summer and ${$(v.lastRev)} in camp revenue, about ${$(v.lastRev/Math.max(1,v.lastCampers))} per camper`,
    `${v.growNow}% more campers this summer with SignUpEngine, and ${v.early}% sign up in January`,
    `Only growth over last summer counts toward the return`,
    `${v.keep}% of new campers join a year-round program, spending ${sp}, and ${v.renew}% stay enrolled the next year`,
    `Next season grows ${v.grow}%, and ${v.back}% of campers come back`,
    `${$(v.setup)} setup, ${$(v.fee)} a month for the platform, and ${$(v.ads)} in digital ads for the season`
  ] : [
    `${v.sessions} camp weeks. Full-Day: ${v.fspots} spots at ${$(v.fprice)}, ${v.ffull}% full. Half-Day: ${v.hspots} spots at ${$(v.hprice)}, ${v.hfull}% full`,
    `Campers stay ${v.wpc} weeks on average, and ${v.early}% sign up in January`,
    `${v.keep}% join a year-round program, spending ${sp}, and ${v.renew}% stay enrolled the next year`,
    `Next season grows ${v.grow}%, and ${v.back}% of campers come back`,
    `${$(v.setup)} setup, ${$(v.fee)} a month for the platform, and ${$(v.ads)} in digital ads for the season`
  ];
}

/* Everything the report says, for inputs s = {ltn, camp} and report type 'ltn' | 'camp' | 'both'.
   The bullet strings hold <b> tags and nothing a visitor typed. */
export function reportData(s, type, {name='', club='', role='', today, calcURL}){
  const P = {1:{}, 2:{}};
  for(const pp of [1,2]){ const sp = {...s, period:pp}; P[pp] = {a:calc(sp,'ltn'), b:calc(sp,'camp')}; }
  const A1=P[1].a, A2=P[2].a, B1=P[1].b, B2=P[2].b;
  const pick = pp => type==='ltn' ? P[pp].a : type==='camp' ? P[pp].b : combine(P[pp].a, P[pp].b);
  const r1 = pick(1), r2 = pick(2);
  const cols = type==='camp' ? ['This camp season','Next camp season'] : ['Your first 12 months','The next 12 months'];
  const title = type==='ltn' ? 'Adult Beginner Program: what it pays back'
    : type==='camp' ? 'Summer Camps: what they pay back' : 'Adult Beginner Program and Summer Camps: what they pay back';
  const B = n => `<b>${n}</b>`;
  const grows = (a,b) => b>=a*2 ? 'more than doubles' : b>=a ? 'grows' : 'comes in';
  const fromTxt = (a,b) => b>=a ? 'up from' : 'down from';
  let p1, p2;
  if(type==='ltn'){
    const carry = int(A2.carry), fresh = Math.round(A2.stayersEnd) - Math.round(A2.carry);
    p1 = [ `${B(int(A1.players)+' new adults')} sign up, bringing in ${B($(A1.regRev))}`,
      A1.stayersEnd>0.5 ? `${B(int(A1.stayersEnd)+' keep playing')}, worth ${B($(A1.stayYear))} this year` : null,
      `${B('Total investment: '+$(A1.cost))} for setup, the platform and digital ads` ];
    p2 = [ `${B('No setup fee')}, so your investment drops to ${B($(A2.cost))}`,
      A2.stayersEnd>0.5 ? `${B(int(A2.stayersEnd)+' adults')} are playing by month 24: ${carry} from your first year plus ${fresh} new` : null,
      `Revenue ${grows(A1.totalIn,A2.totalIn)} ${A2.totalIn>=A1.totalIn?'to':'at'} ${B($(A2.totalIn))}, ${fromTxt(A1.totalIn,A2.totalIn)} ${$(A1.totalIn)}` ];
  } else if(type==='camp' && B1.existing){
    p1 = [ `${B(int(B1.added)+' more campers')} than last summer, at about ${$(B1.per)} each, bringing in ${B($(B1.regRev))} more`,
      `Camp revenue goes from ${$(B1.lastRev)} to ${B($(B1.totalRev))}`,
      B1.stayersEnd>0.5 ? `${B(int(B1.stayersEnd)+' of the new campers')} join year-round programs, worth ${B($(B1.stayYear))} by December` : null,
      `${B('Total investment: '+$(B1.cost))} for setup, the platform and digital ads` ];
    p2 = [ `Camp grows another ${B(B1.v.grow+'%')} to ${B(int(B2.players)+' campers')}, ${int(B2.added)} more than before SignUpEngine`,
      `${B('No setup fee')}, and digital ads only need to find new campers, so your investment drops to ${B($(B2.cost))}`,
      B2.stayersEnd>0.5 ? `${B(int(B2.stayersEnd)+' kids')} from your new campers in year-round programs by December` : null ];
  } else if(type==='camp'){
    const per = B1.players>0 ? B1.regRev/B1.players : 0, cpc = B1.players>0 ? B1.cost/B1.players : 0;
    p1 = [ `${B(int(B1.players)+' campers')} sign up, bringing in ${B($(B1.regRev))}`,
      `Each camper brings in about ${B($(per))}, for about ${B($(cpc))} of your investment`,
      B1.stayersEnd>0.5 ? `${B(int(B1.stayersEnd)+' kids')} join year-round programs, worth ${B($(B1.stayYear))} by December` : null,
      `${B('Total investment: '+$(B1.cost))} for setup, the platform and digital ads` ];
    p2 = [ `Camp grows ${B(B1.v.grow+'%')} to ${B(int(B2.players)+' campers')}, and ${int(B2.returning)} of them come back`,
      `${B('No setup fee')}, and digital ads only need to find new campers, so your investment drops to ${B($(B2.cost))}`,
      B2.stayersEnd>0.5 ? `${B(int(B2.stayersEnd)+' kids')} in year-round programs by December` : null ];
  } else {
    p1 = [ `${B('Adult Beginner Program: '+xr(A1.totalIn,A1.cost))}, with ${int(A1.players)} new adults and ${int(A1.stayersEnd)} who keep playing`,
      B1.existing ? `${B('Summer Camps: '+xr(B1.totalIn,B1.cost))}, with ${int(B1.added)} more campers than last summer` : `${B('Summer Camps: '+xr(B1.totalIn,B1.cost))}, with ${int(B1.players)} campers and ${int(B1.stayersEnd)} who join year-round programs`,
      `${B('Total investment: '+$(r1.cost))} for setup, the platform and digital ads across both` ];
    p2 = [ `${B('Adult Beginner Program: '+xr(A2.totalIn,A2.cost))}, as adults who stayed keep paying`,
      `${B('Summer Camps: '+xr(B2.totalIn,B2.cost))}, as camp grows ${B1.v.grow}% and ${int(B2.returning)} campers come back`,
      `${B('No setup fees')}, so your investment drops to ${B($(r2.cost))}` ];
  }
  const hero = r => ({ret: xr(r.totalIn,r.cost), per: r.cost>0 ? `$${(r.totalIn/r.cost).toFixed(2)} back for every $1 invested` : '',
    ahead: r.totalIn>=r.cost, diff: $(Math.abs(r.totalIn-r.cost))});
  const progs = type==='both' ? [A1,B1] : [r1];
  const sum = k => progs.reduce((t,x)=>t+x[k],0);
  const keys = type==='both' ? ['ltn','camp'] : [type], ex = keys.map(k=>isExample(s,k));
  const allEx = ex.every(Boolean), noneEx = !ex.some(Boolean);
  return {
    type, title, cols, today, calcURL,
    club: club || 'Your club', name: name || 'Your name', role,
    heroes: [hero(r1), hero(r2)],
    change: r1.cost>0 && r2.cost>0 ? `${fromTxt(r1.totalIn/r1.cost, r2.totalIn/r2.cost)} ${xr(r1.totalIn,r1.cost)}` : '',
    points: [p1.filter(Boolean), p2.filter(Boolean)],
    covers: {
      fees: type==='both' ? `${$(A1.v.fee)} and ${$(B1.v.fee)} a month` : `${$(r1.v.fee)} a month`,
      setup: $(sum('setup')), platform: $(sum('feeYear')), ads: $(sum('adsYear')),
      totalLabel: `Total investment, ${cols[0].replace('Your first','first').toLowerCase()}`, total: $(r1.cost)
    },
    basisH: allEx ? 'Based on example numbers' : noneEx ? 'Based on your numbers' : 'Based on these numbers',
    exNote: allEx ? `These are SignUpEngine's example numbers, not your club's. Put in your own in the calculator for a report that reflects your club.`
      : !noneEx ? `One program still uses SignUpEngine's example numbers. Put in your own in the calculator for a report that reflects your club.` : '',
    basis: type==='both'
      ? [{title:'Adult Beginner Program', tag: allEx||noneEx ? '' : ex[0]?'example numbers':'your numbers', items: basisItems(s,'ltn')},
         {title:'Summer Camps', tag: allEx||noneEx ? '' : ex[1]?'example numbers':'your numbers', items: basisItems(s,'camp')}]
      : [{title:'', tag:'', items: basisItems(s,type)}]
  };
}

const DISCLAIMER = d => `These are estimates based on the numbers entered on ${d.today}. Your results will depend on your club, your pricing and your market.`;
const COVERS_PLATFORM = 'ad management, campaign monitoring and optimization, eblasts, and registration support';
const COVERS_ADS = 'Runs in your own ad account and is billed to your card by Meta or Google. None of it goes to SignUpEngine.';

/* ---------- the in-page preview (index.html styles the .em classes) ---------- */
export function previewHTML(d, logoURL){
  const pts = a => `<ul class="em-pts">${a.map(t=>`<li>${t}</li>`).join('')}</ul>`;
  const hero = h => `<div class="em-hero"><div><div class="k">Your return</div><div class="big">${h.ret}</div><div class="k">${h.per}</div></div>
    <div><div class="k">You come out ${h.ahead?'ahead':'behind'}</div><div class="mid">${h.diff}</div><div class="k">${h.ahead?'more':'less'} than you invest</div></div></div>`;
  const c = d.covers;
  return `<div class="em">
    <div class="em-top"><img src="${esc(logoURL)}" alt="SignUpEngine" width="76" height="30"><div class="em-date">${d.today}</div></div>
    <div class="em-body">
      <p class="em-club">${esc(d.club)}</p>
      <h1>${d.title}</h1>
      <p class="em-for">Prepared for ${esc(d.name)}${d.role?`, ${esc(d.role)}`:''}</p>
      <div class="em-sec"><div class="em-sec-h">${d.cols[0]}</div>${hero(d.heroes[0])}${pts(d.points[0])}</div>
      <div class="em-sec next"><div class="em-sec-h">${d.cols[1]}${d.change?`<span>${d.change}</span>`:''}</div>${hero(d.heroes[1])}${pts(d.points[1])}</div>
      <div class="em-sec"><div class="em-sec-h">What your investment covers</div><div class="em-inv">
        <div><span>One-time setup</span><b>${c.setup}</b></div>
        <div><span>SignUpEngine platform<small>${c.fees}: ${COVERS_PLATFORM}</small></span><b>${c.platform}</b></div>
        <div><span>Digital ads<small>${COVERS_ADS}</small></span><b>${c.ads}</b></div>
        <div class="tot"><span>${c.totalLabel}</span><b>${c.total}</b></div></div></div>
      <div class="em-basis"><h2>${d.basisH}</h2>${d.exNote?`<p class="em-ex">${d.exNote}</p>`:''}${d.basis.map(b=>`${b.title?`<h3>${b.title}${b.tag?`<span>${b.tag}</span>`:''}</h3>`:''}<ul>${b.items.map(t=>`<li>${t}</li>`).join('')}</ul>`).join('')}</div>
      <div class="em-cta"><p>Want to check these against your club's real numbers? We'll walk you through it in 15 minutes.</p>
        <a class="b" href="${CONTACT_URL}" target="_blank" rel="noopener">Book a 15-minute walkthrough</a>
        <a class="l" href="${esc(d.calcURL)}" target="_blank" rel="noopener">Open the calculator with these numbers</a></div>
    </div>
    <div class="em-foot"><p>${DISCLAIMER(d)}</p>
      <p>SignUpEngine · signupengine.io · info@signupengine.io</p></div>
  </div>`;
}

/* ---------- the emailed version ---------- */
const F = `font-family:'Kumbh Sans',Arial,Helvetica,sans-serif`;
const C = {ink:'#221a2b', muted:'#675e73', purple:'#75449A', tint:'#efe6f6', line:'#e3dcea', soft:'#f6f4f9', warn:'#fff7e0', warnInk:'#5a4a1a'};

/* opts.intro: an optional paragraph above the report (HTML, already escaped by the caller).
   opts.footerWhy: one sentence on why the reader got this email. */
export function emailHTML(d, {logoURL, intro='', footerWhy=''}){
  const td = (style, html, attrs='') => `<td ${attrs} style="${F};${style}">${html}</td>`;
  const sec = (head, sub, body) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.line};border-radius:12px;border-collapse:separate;margin-top:24px;overflow:hidden">
    <tr>${td(`background:${C.soft};border-bottom:1px solid ${C.line};padding:12px 18px;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:${C.muted}`,
      `${head}${sub?`<span style="float:right;font-size:12px;font-weight:700;letter-spacing:0;text-transform:none;color:${C.purple}">${sub}</span>`:''}`)}</tr>
    ${body}</table>`;
  const hero = (h, light) => {
    const bg = light ? C.tint : C.purple, fg = light ? C.ink : '#ffffff', k = light ? C.muted : '#eadcf5', big = light ? C.purple : '#ffffff';
    const cell = (label, value, size, note, border) => td(`width:50%;vertical-align:top;padding:18px;background:${bg};color:${fg};${border?`border-left:1px solid ${light?'#d9c8e8':'#9270ad'}`:''}`,
      `<div style="font-size:13px;color:${k}">${label}</div><div class="hero-n" style="font-size:${size}px;font-weight:800;line-height:1.1;margin:4px 0;color:${big}">${value}</div><div style="font-size:13px;color:${k}">${note}</div>`, 'class="hero-c"');
    return `<tr><td style="padding:0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${cell('Your return', h.ret, 40, h.per, false)}
      ${cell(`You come out ${h.ahead?'ahead':'behind'}`, h.diff, 28, `${h.ahead?'more':'less'} than you invest`, true)}
    </tr></table></td></tr>`;
  };
  const pts = a => `<tr><td style="padding:12px 18px 14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${a.map(t=>`<tr>
    ${td(`width:16px;vertical-align:top;color:${C.purple};font-size:15px;line-height:1.5;padding:3px 0`, '&#8226;')}
    ${td(`font-size:15px;line-height:1.5;color:${C.ink};padding:3px 0`, t)}</tr>`).join('')}</table></td></tr>`;
  const c = d.covers;
  const inv = (label, small, value, total) => `<tr>
    ${td(`padding:10px 0;font-size:15px;color:${C.ink};font-weight:${total?800:600};${total?`border-top:2px solid ${C.ink}`:`border-bottom:1px solid #eee8f3`}`,
      `${label}${small?`<div style="font-size:13px;font-weight:400;color:${C.muted};margin-top:1px">${small}</div>`:''}`)}
    ${td(`padding:10px 0 10px 16px;font-size:15px;font-weight:800;color:${C.ink};text-align:right;white-space:nowrap;vertical-align:top;${total?`border-top:2px solid ${C.ink}`:`border-bottom:1px solid #eee8f3`}`, value)}</tr>`;
  const list = items => `<ul style="margin:4px 0 0;padding-left:18px">${items.map(t=>`<li style="${F};font-size:13px;line-height:1.5;color:${C.muted};margin:0 0 3px">${t}</li>`).join('')}</ul>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light">
<title>${esc(d.title)}</title>
<style>@media (max-width:480px){.pad{padding-left:18px !important;padding-right:18px !important}.hero-c{padding:14px !important}.hero-n{font-size:26px !important}h1{font-size:22px !important}}</style>
</head>
<body style="margin:0;padding:0;background:#efeaf4">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#efeaf4"><tr><td align="center" style="padding:16px 8px 32px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px">
  <tr><td class="pad" style="padding:18px 28px;border-bottom:1px solid #eee8f3">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><img src="${esc(logoURL)}" alt="SignUpEngine" width="76" height="30" style="display:block;border:0"></td>
      ${td(`text-align:right;font-size:13px;color:${C.muted}`, d.today)}
    </tr></table></td></tr>
  <tr><td class="pad" style="padding:26px 28px 8px">
    ${intro ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px"><tr>${td(`background:${C.soft};border-left:3px solid ${C.purple};padding:12px 16px;font-size:15px;line-height:1.5;color:${C.ink}`, intro)}</tr></table>` : ''}
    <p style="${F};margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${C.purple}">${esc(d.club)}</p>
    <h1 style="${F};margin:0 0 6px;font-size:26px;line-height:1.2;font-weight:800;color:${C.ink}">${d.title}</h1>
    <p style="${F};margin:0;font-size:14px;color:${C.muted}">Prepared for ${esc(d.name)}${d.role?`, ${esc(d.role)}`:''}</p>
    ${sec(d.cols[0], '', hero(d.heroes[0], false) + pts(d.points[0]))}
    ${sec(d.cols[1], d.change, hero(d.heroes[1], true) + pts(d.points[1]))}
    ${sec('What your investment covers', '', `<tr><td style="padding:4px 18px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${inv('One-time setup', '', c.setup)}
      ${inv('SignUpEngine platform', `${c.fees}: ${COVERS_PLATFORM}`, c.platform)}
      ${inv('Digital ads', COVERS_ADS, c.ads)}
      ${inv(c.totalLabel, '', c.total, true)}
    </table></td></tr>`)}
    <h2 style="${F};margin:24px 0 6px;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:${C.muted}">${d.basisH}</h2>
    ${d.exNote ? `<p style="${F};margin:0 0 8px;font-size:13px;line-height:1.5;background:${C.warn};color:${C.warnInk};border-radius:8px;padding:9px 12px">${d.exNote}</p>` : ''}
    ${d.basis.map(b=>`${b.title?`<h3 style="${F};margin:10px 0 2px;font-size:13px;color:${C.ink}">${b.title}${b.tag?` <span style="font-weight:600;color:${C.purple};font-size:12px">${b.tag}</span>`:''}</h3>`:''}${list(b.items)}`).join('')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 8px;background:${C.soft};border-radius:12px"><tr><td align="center" style="padding:20px">
      <p style="${F};margin:0 0 14px;font-size:15px;font-weight:600;color:${C.ink}">Want to check these against your club's real numbers? We'll walk you through it in 15 minutes.</p>
      <a href="${CONTACT_URL}" style="${F};display:inline-block;background:${C.purple};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 22px;border-radius:8px">Book a 15-minute walkthrough</a>
      <p style="${F};margin:12px 0 0;font-size:13px"><a href="${esc(d.calcURL)}" style="color:${C.purple};font-weight:600">Open the calculator with these numbers</a></p>
    </td></tr></table>
  </td></tr>
  <tr><td class="pad" style="${F};padding:14px 28px 24px;font-size:12px;line-height:1.5;color:#8a8196">
    <p style="margin:0 0 6px">${DISCLAIMER(d)}</p>
    ${footerWhy ? `<p style="margin:0 0 6px">${footerWhy}</p>` : ''}
    <p style="margin:0">SignUpEngine · <a href="https://signupengine.io" style="color:#8a8196">signupengine.io</a> · <a href="mailto:info@signupengine.io" style="color:#8a8196">info@signupengine.io</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// plain-text version, for clients that show text only (and spam filters, which like having one)
export function emailText(d, {intro='', footerWhy=''}){
  const h = (x, i) => `${d.cols[i].toUpperCase()}${i&&d.change?` (${d.change})`:''}\nYour return: ${x.ret}${x.per?` (${x.per})`:''}\nYou come out ${x.ahead?'ahead':'behind'} by ${x.diff}`;
  const c = d.covers;
  return [
    intro, intro ? '' : null,
    d.club, stripTags(d.title), `Prepared for ${d.name}${d.role?`, ${d.role}`:''} · ${d.today}`, '',
    h(d.heroes[0], 0), ...d.points[0].map(t=>'- '+stripTags(t)), '',
    h(d.heroes[1], 1), ...d.points[1].map(t=>'- '+stripTags(t)), '',
    'WHAT YOUR INVESTMENT COVERS',
    `One-time setup: ${c.setup}`, `SignUpEngine platform (${c.fees}): ${c.platform}`, `Digital ads (billed by Meta or Google): ${c.ads}`, `${c.totalLabel}: ${c.total}`, '',
    d.basisH.toUpperCase(), d.exNote || null,
    ...d.basis.flatMap(b=>[b.title ? `${b.title}${b.tag?` (${b.tag})`:''}` : null, ...b.items.map(t=>'- '+stripTags(t))]), '',
    `Book a 15-minute walkthrough: ${CONTACT_URL}`,
    `Open the calculator with these numbers: ${d.calcURL}`, '',
    DISCLAIMER(d), footerWhy || null,
    'SignUpEngine · signupengine.io · info@signupengine.io'
  ].filter(x=>x!==null).join('\n');
}
