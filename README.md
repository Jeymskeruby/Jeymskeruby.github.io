# Portfolio — James Kerby C. Sarmiento

A buildless static portfolio. Hand-written HTML/CSS/JS, no bundler, no framework.
Every page uses Google Fonts (DM Sans and Manrope) and a Light / Dark / System
theme switch. Contact works through an email link, with LinkedIn as a secondary
option.

It showcases two commissioned, multi-role dashboard systems — each rebuilt as a
safe, self-contained public demo (mock/local backend, deterministic fictional
data, no client data or credentials, one-click login, "Reset Demo Data") —
plus three Zapier business-process automations.

## Structure

```
index.html              client-focused landing (services, projects, automations, about, contact)
css/home.css             design tokens (light + dark), header, footer, landing-page sections
css/case-study.css       case-study layouts, layered on home.css
js/portfolio.js          theme switch, scroll-spy nav, mobile menu, reveal-on-scroll, footer year (no deps)
projects/                per-project case studies
  relay-helpdesk.html
  iserve.html
  auto-audioblog.html
  auto-crm.html
  auto-leadgen.html
relay-helpdesk/          live demo — served at /relay-helpdesk/  (buildless vanilla JS + localStorage)
iserve/                  live demo — served at /iserve/          (mock Firebase + localStorage)
assets/
  img/                   headshot, thumbnails, favicon, OG image
  resume/                CV PDF
.github/workflows/deploy-pages.yml   GitHub Pages deploy (upload repo root, no build)
```

## Run locally

Any static file server, from the repo root:

```
npx serve .
# or
python3 -m http.server 8000
```

Open `http://localhost:3000` (or `:8000`). The two live demos are at
`/relay-helpdesk/` and `/iserve/`.

## Deploy

Push to `main`. The Pages workflow uploads the repo as-is (everything is already
static) and publishes. In the GitHub repo: **Settings → Pages → Source = GitHub
Actions**. Works whether Pages serves from the domain root (`jeymskeruby.github.io`)
or a project sub-path — every internal link is relative.

## Status

The home page uses the existing headshot, résumé, demos, thumbnails, and case studies.
The inline Calendly scheduler is disabled for now: its markup in `#contact` and the
`widget.js` script in `<head>` are commented out in `index.html` (the styles stay in
`css/home.css`). To re-enable, uncomment both. It points at the event titled
"Interview"; renaming it (or creating a dedicated project-inquiry event and swapping
the `data-url`) would suit client inquiries better.
