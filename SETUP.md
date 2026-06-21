# Illuminance Wedding Films — Setup & Editing Guide

Everything here is free for a single site. You'll do a one-time setup (about 30–45 minutes), and after that you manage your photos, films, couples, and packages from a visual dashboard — no code.

---

## What's in this folder

```
illuminance-site/
├─ index.html            ← home page
├─ portfolio.html        ← full portfolio
├─ gallery.html          ← full gallery
├─ assets/
│   ├─ styles.css        ← all the styling (you won't need to touch this)
│   └─ site.js           ← the engine that loads your content
├─ content/              ← YOUR CONTENT lives here (the dashboard edits these)
│   ├─ site.json         ← hero, about, social links
│   ├─ portfolio.json    ← couples
│   ├─ gallery.json      ← photos
│   └─ packages.json     ← packages + add-ons
├─ images/               ← logo + all your uploaded photos
│   └─ logo.png
└─ admin/                ← the dashboard
    ├─ index.html
    └─ config.yml        ← one block to paste into (Step 4)
```

A quick note on previewing: because the site loads your content from the `content` folder, **double-clicking `index.html` won't show the photos** — browsers block that for local files. It works the moment it's on a real host (next step). If you want to preview locally first, you'd run a tiny local server, but honestly the fastest path is just to deploy it.

---

## Step 1 — Put the site on GitHub (free)

GitHub is where your site's files live. The dashboard saves your edits here.

1. Make a free account at **github.com**.
2. Click the **+** (top right) → **New repository**.
3. Name it `illuminance-site`, keep it **Public**, click **Create repository**.
4. On the new repo page, click **uploading an existing file**.
5. Drag in **everything inside this folder** (the files and the `assets`, `content`, `images`, `admin` folders), then **Commit changes**.

---

## Step 2 — Put it online with Netlify (free)

1. Make a free account at **netlify.com** — choose **Sign up with GitHub**.
2. Click **Add new site → Import an existing project → GitHub**.
3. Pick your `illuminance-site` repo. Leave the build settings empty and click **Deploy**.
4. In a minute you'll get a live link like `random-name.netlify.app`. That's your site, live.
   - You can rename it under **Site configuration → Change site name**.

At this point your full site works — home, portfolio, gallery, packages — just with placeholder photos until you add yours in Step 4.

---

## Step 3 — Point your domain (when you're ready)

Keep your domain at Squarespace or move it — either works.

- **Easiest:** in Netlify, go to **Domain management → Add a domain**, type your domain, and Netlify shows you the DNS records to set. Then in Squarespace, open your domain's **DNS settings** and add those records.
- Netlify gives you a free SSL certificate (the padlock) automatically.

There's zero rush on this — your `.netlify.app` link works fine in the meantime.

---

## Step 4 — Turn on the dashboard (DecapBridge)

This is what lets you log in and edit without touching code.

1. Go to **decapbridge.com** and create a free account.
2. Click **Create site**. Give it a name, and link your `illuminance-site` GitHub repo.
3. Choose a login style:
   - **Classic** = log in with an email + password.
   - **PKCE** = log in with Google or Microsoft.
4. DecapBridge will show you a **`backend:` block**. Copy it.
5. Open `admin/config.yml` (on GitHub: click the file → pencil icon to edit). Replace the placeholder `backend:` block at the top with the one DecapBridge gave you. **Commit**.
6. Back in DecapBridge, **invite yourself** by email.
7. Go to **your-site.com/admin** (or `your-name.netlify.app/admin`), log in, and you're in.

You'll see four sections: **Site Settings, Portfolio, Gallery, Packages & Add-Ons.** Edit, hit **Publish**, and your live site updates within a minute.

> Full walkthrough if you get stuck: decapbridge.com/docs/getting-started

---

## Step 5 — Make the contact form deliver to your inbox (Formspree, free)

1. Make a free account at **formspree.io**.
2. Create a new form; it gives you an ID that looks like `xmyzabcd`.
3. In `index.html`, find `YOUR_FORM_ID` and replace it with that ID. Commit.

Now inquiries land in your email.

---

## Day-to-day: how to update things

All from **your-site.com/admin**, with **Publish** to go live:

- **Add a wedding** → *Portfolio → add a Couple* → names, date, venue, upload a cover photo, paste the YouTube link to their film.
- **Add gallery photos** → *Gallery → add a Photo* → upload, pick a tile size (normal / tall / wide).
- **Change a price or package detail** → *Packages & Add-Ons*.
- **Swap the hero film, edit your About, or change social links** → *Site Settings*.

That's it — no files, no code.

---

## Good to know

- **Photo sizes:** upload photos around 1600–2000px wide and saved as JPG. Huge phone photos load slowly; resizing first keeps the site fast.
- **The logo:** it currently blends nicely because every background it sits on is dark. If you ever get a proper transparent-background PNG or vector of the logo, drop it in as `images/logo.png` and it'll look clean on any background.
- **Nothing breaks if you experiment** — every change is saved in GitHub's history, so anything can be undone.
