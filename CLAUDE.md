# CLAUDE.md — Project Handoff & Context

> This file orients Claude Code (and any developer) on this project. Claude Code
> loads it automatically when the folder is opened. Read it before making changes.

## Snapshot

Custom website for **Illuminance Wedding Films** (wedding videographer **Hunter Sites**,
Petersburg, West Virginia). It replaces a Squarespace site the owner disliked. It is a
**static, multi-page, data-driven site** — no build step, no framework. Content is stored
as JSON and edited through a visual dashboard (Decap CMS). Brand is **black + gold**,
elegant and cinematic.

The guiding creative concept: the four packages (**First Light → Golden Hour → Starlight →
Evermore**) form a journey of light from dawn to night, and the site leans into that — the
intro "illuminates" the logo out of darkness, and the Packages section scrolls from a dawn
sky down through sunset, starlight, and moonlight.

## Run / preview locally (do this first)

The pages fetch `content/*.json`, so **opening `index.html` directly via `file://` will NOT
load content** (browsers block local fetch). Serve the folder over HTTP:

```bash
# from the project root
python3 -m http.server 8000
# then open http://localhost:8000
```

(Or use the VS Code "Live Server" extension.) When deployed to Netlify it just works.

## Stack & hosting (all free tier)

- **Plain HTML/CSS/JS**, no bundler, no framework. Fonts via Google Fonts CDN.
- **GitHub** — source of truth; the CMS commits here.
- **Netlify** — static hosting + SSL, deploys from the GitHub repo.
- **Decap CMS** (`/admin`) — the visual editing dashboard.
- **DecapBridge** — auth for the dashboard (Netlify Identity was deprecated; DecapBridge
  replaces it and lets the owner log in with Google/password, no GitHub account needed).
- **Formspree** — contact-form delivery (placeholder `YOUR_FORM_ID` in `index.html`).

End-user setup steps live in **SETUP.md**.

## File map

```
index.html         home (intro, hero, about, portfolio preview, gallery preview, packages, contact)
portfolio.html     full portfolio grid (data-page="portfolio")
gallery.html       full gallery grid + lightbox (data-page="gallery")
assets/styles.css  ALL styling (single stylesheet, shared by every page)
assets/site.js     ALL behavior + rendering. Reads content JSON, renders per body[data-page]
content/site.json      hero text, hero video URL, about quote/bio, social URLs
content/portfolio.json couples: { name, date, venue, photo, film }
content/gallery.json   photos: { image, caption, size: normal|tall|wide }
content/packages.json  packages[] + addons[]
images/logo.png    logo (see "Logo gotcha")
admin/index.html   loads Decap CMS
admin/config.yml   CMS content model + backend block (backend is a DecapBridge placeholder)
SETUP.md           non-technical setup/editing guide for the owner
```

## How rendering works (assets/site.js)

- `document.body.dataset.page` ("home" | "portfolio" | "gallery") decides what renders.
- On boot it `fetch`es the needed JSON and calls render functions:
  - `renderHero`, `renderAbout` (home only)
  - `renderPortfolio(couples, container, limit)` — limit 4 on home, 0 (all) on portfolio page
  - `renderGallery(photos, container, limit)` — limit 5 on home, 0 on gallery page; builds lightbox
  - `renderPackages(packages)` — the stacked dawn→night panels (home only)
  - `renderAddons(addons)` + `wireForm()` (home only)
- `imgPath(p)` normalizes image references: CMS stores `/images/x.jpg`; seed data may use a
  bare filename — both resolve correctly. **Use `imgPath()` for any new image field.**
- `ytEmbed(url)` turns a YouTube link into an embed URL for the hero film.
- Social links are set from `site.json` onto elements with classes `.js-ig`, `.js-yt`, `.js-fb`.
- `#loadError` banner shows if fetch fails (e.g., opened via file://).

## Design system

- **Colors** (CSS vars in `styles.css`): `--ink #0a0a0b`, `--gold #e9c46a`,
  `--gold-bright #f3d484`, `--gold-deep #c8962e`, `--cream #f4efe4`, plus per-package "sky"
  gradients `--sky-dawn / --sky-golden / --sky-star / --sky-ever`.
- **Type**: `Tangerine` (700) for romantic script headings (couple names, section titles,
  "Remember Your Wedding"); `Cormorant Garamond` for serif body/headings; `Montserrat`
  (letter-spaced) for nav, labels, buttons, the wordmark feel.
- **Motion**: `.reveal` elements fade/rise in via IntersectionObserver. Respect
  `prefers-reduced-motion` (intro is skipped, transitions minimized) — keep this when adding motion.

## Feature notes / gotchas

- **Intro animation** (home only, `#intro` in `index.html`): logo blooms from black with a
  gold glow + a gleam that sweeps across it, then lifts away (~2.6s). The gleam is a moving
  highlight **masked to the logo PNG** (`.intro-shine` mask set in JS) so it doesn't reveal a
  rectangle. Skipped entirely for reduced-motion users.
- **Logo gotcha**: the owner's "transparent" logo upload was actually a JPEG with a solid
  black background (no alpha). The current `images/logo.png` is a keyed cutout with a faint
  edge. We hide that edge with `mix-blend-mode: screen` on every logo instance — which works
  **only because every background the logo sits on is dark**. If the logo ever needs to sit on
  a light background, get a true transparent PNG/vector and you can drop the blend hack.
- **Packages**: built from `packages.json`. `sky` picks the time-of-day theme; `stars: true`
  adds a starfield (Starlight/Evermore). Feature lists with **>6 items render in two columns**
  automatically (keeps Evermore from towering). Tabs were intentionally removed — it's a
  single scroll-through.
- **No time-of-day labels** on packages (owner found them confusing) — don't re-add them.
- **Gallery lightbox**: only photos with an `image` open the lightbox (placeholders don't).
  Keyboard arrows + Esc supported.

## Status — done

- Full responsive design, intro, hero (with YouTube-embed slot), about, portfolio (preview +
  full page), gallery (preview + full page + lightbox), packages scroll-journey, contact form
  with live add-on subtotal, footer. All pages render from content JSON. Verified via local
  HTTP server.

## TODO — not done yet (owner-side, see SETUP.md)

1. Push to GitHub, deploy on Netlify.
2. Point the domain (currently on Squarespace) at Netlify.
3. Wire DecapBridge auth: paste the generated `backend:` block into `admin/config.yml`
   (placeholder values: `YOUR_GITHUB_USERNAME`, `YOUR_SITE_ID`).
4. Replace `YOUR_FORM_ID` in `index.html` with a Formspree form ID.
5. Add real content: hero montage (YouTube link), couple cover photos + film links, gallery
   photos, About portrait + sample photos (the About `.portrait`/`.ph` tiles are still
   styled placeholders in `index.html`).
6. Optional: obtain a true transparent/vector logo to remove the blend-mode dependency.

## Conventions

- No build tooling — edit files directly; changes are live on next deploy/refresh.
- Keep all styling in `assets/styles.css` and all behavior in `assets/site.js` (shared across
  pages). Don't inline page-specific CSS/JS unless necessary.
- New editable content should go through a `content/*.json` file **and** get a matching field
  in `admin/config.yml`, so it stays editable from the dashboard.
- Images: prefer ~1600–2000px wide JPGs for performance.
```
