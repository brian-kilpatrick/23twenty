// Records the rendered style of every visible text run, image and icon on each page at
// phone and desktop widths, keyed by content rather than markup — so a CSS refactor that
// renames classes or restructures wrappers can be checked for "nothing visibly moved".
// `node scripts/style-snapshot.mjs <baseUrl> <out.json>`; compare two runs with style-diff.mjs.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const [base = 'http://localhost:4321', out = 'shots/styles.json'] = process.argv.slice(2);
const pages = process.env.PAGES ? process.env.PAGES.split(',') : ['/', '/photo/', '/photo/headshots/', '/photo/events/', '/photo/music/', '/photo/product/', '/video/'];
const viewports = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };
const PROPS = [
  'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'color', 'background-color',
  'text-transform', 'letter-spacing', 'text-decoration-line', 'opacity', 'border-radius', 'text-align',
];

const result = {};
const browser = await chromium.launch();
for (const [vp, viewport] of Object.entries(viewports)) {
  const page = await browser.newPage({ viewport });
  for (const path of pages) {
    await page.goto(base + path, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.fonts.ready);
    result[`${vp} ${path}`] = await page.evaluate((PROPS) => {
      const skip = (el) => el.closest('iframe, mux-player, [class^="hb-p-"], .pswp, .bm-menu-wrap');
      const seen = new Map();
      const rows = [];
      for (const el of document.body.querySelectorAll('*')) {
        if (skip(el)) continue;
        const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim().replace(/\s+/g, ' ');
        const media = el.tagName === 'IMG' ? (el.getAttribute('alt') || el.currentSrc.split('/').pop().slice(0, 40)) : el.tagName === 'svg' ? el.innerHTML.slice(0, 40) : '';
        if (!own && !media) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        let key = `${el.tagName.toLowerCase()} "${(own || media).slice(0, 50)}"`;
        const n = (seen.get(key) ?? 0) + 1;
        seen.set(key, n);
        if (n > 1) key += ` #${n}`;
        const cs = getComputedStyle(el);
        const style = Object.fromEntries(PROPS.map((p) => [p, cs.getPropertyValue(p)]));
        const y = r.top + window.scrollY;
        rows.push([key, { box: [Math.round(r.left), Math.round(y), Math.round(r.width), Math.round(r.height)], ...style }]);
      }
      return Object.fromEntries(rows);
    }, PROPS);
  }
  await page.close();
}
await browser.close();
writeFileSync(out, JSON.stringify(result, null, 1));
console.log(`wrote ${out}`);
