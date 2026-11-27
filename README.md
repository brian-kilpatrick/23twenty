# 23Twenty Media

www.23twenty.com — an [Astro](https://astro.build) site with a [Keystatic](https://keystatic.com) editor, hosted on Vercel.

## Editing content

Open **`/keystatic`** on the live site (works on a phone), sign in with GitHub, edit, and Save. Saving commits to
this repo; Vercel rebuilds and the change is live in about a minute.

- **Contact & footer** — email, Facebook, Instagram, the menu's Weddings link
- **Home page** — the heading and tile photos
- **About page** — currently empty (see `TODO.md`)
- **Video page** — the Mux-hosted videos, in order
- **Galleries** — one entry per photo gallery (Headshots, Events, Music, Product); add one and it appears on
  the Photography page and at `/photo/<address>/`

## Developing

```sh
npm install
npm run dev     # http://localhost:4321, editor at http://127.0.0.1:4321/keystatic (writes local files)
npm run build
```

See `CLAUDE.md` for the verification tools.
