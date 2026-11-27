# CLAUDE.md — 23Twenty Media

Brian's commercial photo/video production site, www.23twenty.com (headshots, events, music, product, video).
Astro 7 + Keystatic CMS, hosted on Vercel. Ported in October 2026 from a Next.js static export built on the
"Opta" template; the switch-over is still in progress — see `TODO.md`. Sister site: Brian K Photo
(`~/DEV/Brian-K-Photo`), the wedding business, built the same way.

## Where things are

- Content: `src/content/*.yaml` (singletons) and `src/content/galleries/*.yaml` (one per gallery), edited at
  `/keystatic`. Schema: `keystatic.config.ts`. Read via `src/lib/content.ts` and `src/lib/galleries.ts`.
- Images: `src/assets/` (resized to WebP at build). Gallery photos: `src/assets/gallery/<slug>/`.
- Styles: `src/styles/site.css` for shared rules; everything else in its component's `<style>`. The template's
  3,100 lines of CSS were replaced, not copied.
- Galleries use `src/lib/justify.ts`, which reproduces react-photo-album's row layout (the old site's library):
  its cost function and its responsive defaults (row height width/5…width/2, spacing 20/15/10/5 at
  1200/600/300/0px). Change those together, or the galleries stop matching what Brian approved.
- Pages are prerendered; only `/keystatic` and `/api/keystatic/*` run on demand.

## Conventions

- Content changes go in the YAML (or through the editor), never hard-coded in a page.
- The design was ported 1:1 against the live site. Visual changes are deliberate and called out in the commit.
- No analytics on this site (the old one had none); don't add any without asking.

## Verifying a change

```sh
npx astro check && npm run build
npm run shots -- http://localhost:4321 shots/x      # every page, phone+desktop, + findings.txt
node scripts/style-snapshot.mjs <url> shots/a.json  # before/after any CSS change…
node scripts/style-diff.mjs shots/a.json shots/b.json
```

Expected noise in `findings.txt`: none. Anything else is real. Videos stream from Mux (`<mux-player>`,
playback IDs in `videos.yaml`), not Vimeo.

## Gotchas

- **`@astrojs/vercel` is pinned to 11.0.12.** 11.0.13 crashes every on-demand route ("Cannot find native
  binding", withastro/astro#18328). Unpin once a fixed release ships, and check `/keystatic` returns 200.
- **"504 Outdated Optimize Dep" in dev** after adding/removing packages: restart `astro dev`. Client scripts
  (menu, gallery layout) silently don't run until you do.
- **Astro drops whitespace between an element and an `{expression}`** — `</a>\n{text}` renders with no space.
  Write `{' '}` explicitly (see the home heading).
- **Keystatic storage is `local` in dev, `github` in production** (repo `brian-kilpatrick/23twenty`).
