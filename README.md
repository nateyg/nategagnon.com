# nategagnon.com

Personal portfolio site. Static — plain HTML/CSS/JS, no build step.

## Structure
- `index.html` — shell; loads the app
- `js/app.js` — hash-router SPA (home `#/`, project `#/p/<slug>`, `#/contact`)
- `js/glossy-icon.js` — three.js (r128) `<glossy-icon>` web component (3D hero marks)
- `css/style.css` — all styles (mobile-first; desktop at `@media (min-width: 1080px)`)
- `data/projects.json` — the project list (drives both the home list and project pages)
- `assets/`, `fonts/`, `vendor/` — icons, Scto Grotesk fonts, three.js
- `2023/` — archive of the previous site
- `serve.py` — local dev server with no-store headers (`python3 serve.py` → localhost:4242). Not deployed.

## Deploying
Hosted on Vercel, connected to this repo — pushing to the default branch triggers a deploy.
After editing JS/CSS, bump the `?v=` query params in `index.html` so browsers fetch fresh copies.

## Editing content
- Add/edit a project: edit `data/projects.json`.
- Contact "Updated" date: `SITE_UPDATED` at the top of `js/app.js`.
