/* Emails the ROI calculator's report through SendLayer.
   POST /report with the calculator's inputs and the visitor's details (see README.md).
   The report is rebuilt here from the numbers, with the same code the page uses (lib/), and never
   taken from the browser: otherwise anyone could send any email they liked from our address. */
import {readInputs, hashParams} from '../../lib/calc.js';
import {reportData, emailHTML, emailText, esc, TYPES, ROLES} from '../../lib/report.js';

const EMAIL_RE = /^[^\s@,;<>"()]+@[^\s@,;<>"()]+\.[^\s@,;<>"()]+$/;
const LINK_RE = /https?:|www\.|\.(com|net|org|io|ru|xyz|info|biz|co)\b/i;   // no links in typed text: it goes out under our name
const MAX_BODY = 20000, MAX_CC = 3;

// one line of visitor text: no control characters (they could reach email headers), trimmed, capped
const line = (v, max) => typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max) : '';

function validate(b){
  if(!b || typeof b !== 'object') return {error:'bad_request'};
  const type = TYPES.includes(b.type) ? b.type : null;
  const name = line(b.name, 100), club = line(b.club, 120), email = line(b.email, 254).toLowerCase();
  const role = ROLES.includes(b.role) ? b.role : '';
  const note = typeof b.note === 'string' ? b.note.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, ' ').trim().slice(0, 500) : '';
  if(!type) return {error:'bad_request'};
  if(!name) return {error:'invalid', field:'name'};
  if(!club) return {error:'invalid', field:'club'};
  if(!EMAIL_RE.test(email)) return {error:'invalid', field:'email'};
  if(LINK_RE.test(name) || LINK_RE.test(club) || LINK_RE.test(note)) return {error:'invalid', field:'links'};
  const ccRaw = Array.isArray(b.cc) ? b.cc : [];
  if(ccRaw.length > MAX_CC) return {error:'invalid', field:'cc'};
  const cc = [...new Set(ccRaw.map(x => line(x, 254).toLowerCase()))].filter(x => x && x !== email);
  if(!cc.every(x => EMAIL_RE.test(x))) return {error:'invalid', field:'cc'};
  // inputs go through the same validation as a shared link: unknown keys dropped, numbers clamped
  const pairs = ['ltn','camp'].flatMap(key => b[key] && typeof b[key] === 'object'
    ? Object.entries(b[key]).filter(([,v]) => typeof v === 'number' || typeof v === 'string').map(([k,v]) => [`${key}.${k}`, v]) : []);
  return {type, name, club, email, role, note, cc, optin: b.optin === true, inputs: readInputs(pairs),
    token: typeof b.turnstile === 'string' ? b.turnstile.slice(0, 2048) : ''};
}

async function humanCheck(env, token, ip){
  if(!token) return false;
  const fd = new FormData();
  fd.append('secret', env.TURNSTILE_SECRET); fd.append('response', token);
  if(ip) fd.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {method:'POST', body:fd});
  const out = await res.json().catch(() => ({}));
  return out.success === true;
}

async function send(env, msg){
  const res = await fetch('https://console.sendlayer.com/api/v1/email', {
    method:'POST', headers:{'Authorization':`Bearer ${env.SENDLAYER_API_KEY}`, 'Content-Type':'application/json'}, body:JSON.stringify(msg)});
  if(!res.ok) throw new Error(`SendLayer ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

function buildEmails(env, f){
  const today = new Date().toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric', timeZone: env.TIMEZONE || 'America/New_York'});
  const page = new URL(env.PAGE_URL), hash = hashParams(f.inputs, f.type);
  const calcURL = page.href.split('#')[0] + (hash ? '#'+hash : '');
  const logoURL = new URL('assets/signupengine-logo.png', page).href;
  const d = reportData(f.inputs, f.type, {name:f.name, club:f.club, role:f.role, today, calcURL});
  const from = {name: env.FROM_NAME, email: env.FROM_EMAIL}, replyTo = [{name: env.FROM_NAME, email: env.REPLY_TO}];
  const first = f.name.split(/\s+/)[0];
  const noteHTML = f.note ? `<br><br><b>Their note:</b><br>${esc(f.note).replace(/\n/g, '<br>')}` : '';
  const emails = [];

  // 1. the person who asked
  const ccList = f.cc.length ? ` We've also sent a copy to ${f.cc.join(', ')}.` : '';
  const intro1 = `Hi ${esc(first)}, here's the report you made with the SignUpEngine ROI calculator.${esc(ccList)} Questions? Just reply to this email.`;
  const why1 = 'You’re getting this email because you asked for it on the SignUpEngine ROI calculator.';
  emails.push({role:'requester', msg:{From:from, To:[{name:f.name, email:f.email}], ReplyTo:replyTo,
    Subject:`Your ROI report: ${d.title.split(':')[0]}`, ContentType:'HTML',
    HTMLContent: emailHTML(d, {logoURL, intro:intro1, footerWhy:why1}),
    PlainContent: emailText(d, {intro:`Hi ${first}, here's the report you made with the SignUpEngine ROI calculator.${ccList} Questions? Just reply to this email.`, footerWhy:why1}),
    Tags:['roi-calculator','report']}});

  // 2. their colleagues, in one email, with the note at the top
  if(f.cc.length){
    const intro2 = `${esc(f.name)} at ${esc(f.club)} asked us to send you this report from the SignUpEngine ROI calculator.${noteHTML}`;
    const why2 = `You’re getting this email because ${esc(f.name)} entered your address on the SignUpEngine ROI calculator. We haven’t added you to any mailing list.`;
    emails.push({role:'colleagues', msg:{From:from, To:f.cc.map(e => ({name:e, email:e})), ReplyTo:replyTo,
      Subject:`${f.name} shared an ROI report with you`, ContentType:'HTML',
      HTMLContent: emailHTML(d, {logoURL, intro:intro2, footerWhy:why2}),
      PlainContent: emailText(d, {intro:`${f.name} at ${f.club} asked us to send you this report from the SignUpEngine ROI calculator.${f.note?`\n\nTheir note:\n${f.note}`:''}`,
        footerWhy:`You're getting this email because ${f.name} entered your address on the SignUpEngine ROI calculator. We haven't added you to any mailing list.`}),
      Tags:['roi-calculator','colleague']}});
  }

  // 3. the lead, to Peter; replying goes straight to the person who asked
  const row = (k, v) => `<tr><td style="padding:3px 12px 3px 0;color:#675e73;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:3px 0">${v}</td></tr>`;
  const typeName = {ltn:'Adult beginners', camp:'Summer camps', both:'Both programs'}[f.type];
  const leadHTML = `<b>New ROI calculator report request</b><table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px;font-size:14px">
    ${row('Name', esc(f.name))}${row('Club', esc(f.club))}${row('Email', `<a href="mailto:${esc(f.email)}">${esc(f.email)}</a>`)}
    ${row('Role', esc(f.role || 'Not given'))}${row('Report', typeName)}${row('Colleagues', f.cc.length ? esc(f.cc.join(', ')) : 'None')}
    ${row('Note', f.note ? esc(f.note).replace(/\n/g, '<br>') : 'None')}${row('Wants program ideas', f.optin ? '<b>Yes</b>, opted in' : 'No')}
    ${row('Numbers', d.basisH)}${row('Calculator', `<a href="${esc(calcURL)}">Open with their numbers</a>`)}</table>
    <p style="margin:10px 0 0;color:#675e73">Reply to this email to reach ${esc(first)} directly. Their report is below.</p>`;
  emails.push({role:'lead', msg:{From:from, To:[{name:env.LEAD_TO, email:env.LEAD_TO}], ReplyTo:[{name:f.name, email:f.email}],
    Subject:`ROI report request: ${f.club} (${f.name})`, ContentType:'HTML',
    HTMLContent: emailHTML(d, {logoURL, intro:leadHTML}),
    PlainContent: [`New ROI calculator report request`, `Name: ${f.name}`, `Club: ${f.club}`, `Email: ${f.email}`, `Role: ${f.role || 'Not given'}`,
      `Report: ${typeName}`, `Colleagues: ${f.cc.join(', ') || 'None'}`, `Note: ${f.note || 'None'}`, `Wants program ideas: ${f.optin ? 'Yes' : 'No'}`,
      `Numbers: ${d.basisH}`, `Calculator: ${calcURL}`].join('\n'),
    Tags:['roi-calculator','lead']}});
  return emails;
}

export default {
  async fetch(request, env){
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const okOrigin = allowed.includes(origin);
    const cors = okOrigin ? {'Access-Control-Allow-Origin':origin, 'Access-Control-Allow-Methods':'POST, OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type', 'Access-Control-Max-Age':'86400', 'Vary':'Origin'} : {'Vary':'Origin'};
    const reply = (status, body) => new Response(JSON.stringify(body), {status, headers:{'Content-Type':'application/json', ...cors}});

    if(new URL(request.url).pathname !== '/report') return reply(404, {error:'not_found'});
    if(request.method === 'OPTIONS') return new Response(null, {status: okOrigin ? 204 : 403, headers:cors});
    if(request.method !== 'POST') return reply(405, {error:'method'});
    if(!okOrigin) return reply(403, {error:'origin'});

    const dry = env.DRY_RUN === '1';
    if((!env.SENDLAYER_API_KEY && !dry) || (!env.TURNSTILE_SECRET && env.ALLOW_NO_TURNSTILE !== '1'))
      return reply(503, {error:'not_configured'});

    const ip = request.headers.get('CF-Connecting-IP') || '';
    if(env.RATE_LIMITER){
      const {success} = await env.RATE_LIMITER.limit({key: ip || 'unknown'});
      if(!success) return reply(429, {error:'rate_limited'});
    }
    const text = await request.text();
    if(text.length > MAX_BODY) return reply(413, {error:'too_large'});
    let body; try { body = JSON.parse(text); } catch { return reply(400, {error:'bad_json'}); }
    const f = validate(body);
    if(f.error) return reply(400, f);
    if(env.TURNSTILE_SECRET && !(await humanCheck(env, f.token, ip))) return reply(403, {error:'human_check'});

    const emails = buildEmails(env, f);
    if(dry) return reply(200, {ok:true, dryRun:true, emails});

    // the requester's own copy decides success; the colleague copy and the lead are logged if they fail
    const results = await Promise.allSettled(emails.map(e => send(env, e.msg)));
    results.forEach((r, i) => { if(r.status === 'rejected') console.error(`send ${emails[i].role} failed:`, r.reason?.message); });
    if(results[0].status === 'rejected') return reply(502, {error:'send_failed'});
    return reply(200, {ok:true, colleagues: emails[1]?.role === 'colleagues' ? results[1].status === 'fulfilled' : null});
  }
};
