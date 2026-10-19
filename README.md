# SignUpEngine ROI Calculator

A one-page calculator that shows a club what an adult beginner program or summer camp pays back
with SignUpEngine. Published with GitHub Pages at
https://roi.signupengine.io/ (custom domain: `CNAME` file + a CNAME record at register.com;
the old github.io address forwards here)

## ⚠ This repo and its site are public

Everything here is visible to anyone. Never commit API keys (SendLayer or anything else): the
page runs in the visitor's browser, so a key in it is a key anyone can read. Email sending needs a
small server endpoint that holds the key (see below).

## Layout

```
index.html                    the page: layout, styles, inputs, chart, form (loads lib/ as ES modules)
lib/calc.js                   the numbers: programs, example inputs, the 12-month model, link parsing
lib/report.js                 the report: what it says, the in-page preview, the email version
worker/                       Cloudflare Worker that emails the report through SendLayer
assets/signupengine-logo.png  logo, used in the report (a real file so email clients will load it)
robots.txt, noindex meta      keep it out of search engines; remove both if it should be indexed
```

To update the calculator, edit the files, then commit and push to `main`. Pages redeploys in a
minute or two. `lib/` is shared with the Worker: after changing it, redeploy the Worker too
(`cd worker && npm run deploy`) so emailed reports match the page.

The page uses ES modules, which browsers won't load from a `file://` path. To try it locally, serve
the folder: `py -3 -m http.server 8765 --bind 127.0.0.1`, then open http://127.0.0.1:8765/.

## Sharing numbers by link

The URL hash holds every number that differs from the example, for example
`#tab=camp&camp.fspots=60&camp.fprice=625`. The report's "Copy link to these numbers" button
and its "Open the calculator with these numbers" link both build one. Use it to send a prospect a
pre-filled calculator. The page reads the hash on load and then clears the address bar, which never
changes while someone edits (so reloading starts from the example numbers). Values are validated on load (`readInputs` in `lib/calc.js`); unknown keys are ignored.

## The emailed report

Two constants near the top of the report script in `index.html`:

- `REPORT_ENDPOINT` empty: the bottom bar says "See my report" and opens the report preview
  straight away, with Print / Save as PDF and Copy link. No form, no personal data collected.
- `REPORT_ENDPOINT` set to the Worker's `/report` URL: the bar says "Email me this report" and
  opens the form (name, club, email, role, up to three colleagues, a note, opt-in).
- `TURNSTILE_SITE_KEY`: the public key of the Cloudflare Turnstile widget that proves a person
  sent the form. The Worker refuses requests without a valid Turnstile token.

One request sends up to three emails, all from peter@signupengine.io with replies to Peter:

1. **To the person who asked**: their report.
2. **To their colleagues** (if any, in one email): the same report, with "Pat at Lakeside TC asked
   us to send you this" and their note at the top.
3. **To Peter**: the lead (name, club, email, role, colleagues, note, opt-in, a link that opens the
   calculator with their numbers) above a copy of the report. Replying goes to the person who asked.

The Worker rebuilds the report from the numbers with the same `lib/` code the page uses. It never
takes report HTML from the browser: otherwise anyone could send any email they like from our
address. It also rejects links in the name, club and note, allows at most three colleagues, and
rate-limits each IP to 5 requests a minute.

### Worker setup (one time)

From the `worker/` folder:

1. `npm install`, then `npx wrangler login` (approve in the browser, signed in to Cloudflare).
2. `npm run deploy`. Wrangler prints the URL, `https://signupengine-roi-report.<subdomain>.workers.dev`.
3. Cloudflare dashboard → Turnstile → Add widget: hostnames `roi.signupengine.io` and `signupenginellc.github.io`, mode Managed.
   Put the **site key** in `TURNSTILE_SITE_KEY` in `index.html`, and the **secret key** in the Worker:
   `npx wrangler secret put TURNSTILE_SECRET`.
4. `npx wrangler secret put SENDLAYER_API_KEY` and paste the key from SendLayer → Settings → API keys.
5. Set `REPORT_ENDPOINT` in `index.html` to `<worker URL>/report`, commit and push.

Settings that aren't secret (sender, reply-to, lead address, page URL) are in `worker/wrangler.toml`.
`npx wrangler tail` shows the Worker's logs live, including any send that failed.

### Testing the Worker locally

`cp .dev.vars.example .dev.vars`, then `npm run dev`. `.dev.vars` turns on dry run: the Worker
answers with the emails it would have sent instead of sending them, and skips Turnstile.
