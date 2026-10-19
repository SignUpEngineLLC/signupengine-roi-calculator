# SignUpEngine ROI Calculator

A one-page calculator that shows a club what an adult beginner program or summer camp pays back
with SignUpEngine. Published with GitHub Pages at
https://signupenginellc.github.io/signupengine-roi-calculator/

## ⚠ This repo and its site are public

Everything here is visible to anyone. Never commit API keys (SendLayer or anything else): the
page runs in the visitor's browser, so a key in it is a key anyone can read. Email sending needs a
small server endpoint that holds the key (see below).

## Layout

```
index.html                    the calculator: HTML, CSS and JS in one file, no build step
assets/signupengine-logo.png  logo, used in the report (a real file so email clients will load it)
robots.txt, noindex meta      keep it out of search engines; remove both if it should be indexed
```

To update the calculator, edit `index.html`, then commit and push to `main`. Pages redeploys in a
minute or two.

## Sharing numbers by link

The URL hash holds every number that differs from the example, for example
`#tab=camp&camp.fspots=60&camp.fprice=625`. Copying the address bar, the report's
"Copy link to these numbers" button, and the report's "Open the calculator with these numbers"
link all reopen the calculator with those numbers. Use it to send a prospect a pre-filled
calculator. Values are validated on load; unknown keys are ignored.

## The emailed report

`REPORT_ENDPOINT` near the top of the report script in `index.html` switches between two modes:

- **Empty (now):** the bottom bar says "See my report" and opens the report preview straight away,
  with Print / Save as PDF and Copy link. No form, no personal data collected.
- **Set to a URL:** the bar says "Email me this report" and opens the form (name, club, email,
  role, up to three colleagues, a note, opt-in). On submit the page POSTs JSON to the endpoint:

  ```json
  {"type": "ltn|camp|both", "name": "", "club": "", "email": "", "role": "", "cc": ["", ""],
   "note": "", "optin": false, "ltn": { ...inputs }, "camp": { ...inputs }}
  ```

  The endpoint must rebuild the report from these numbers itself and send it. It must never accept
  report HTML from the browser, or anyone could use it to send any email they like from our address.
