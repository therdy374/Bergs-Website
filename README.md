# BERGS 2026 Website Redesign

A static front-end prototype for BERGS Holdings Corporation.

## Included
- Dark-first BERGS-inspired visual system
- Light/Dark mode toggle with localStorage persistence
- Responsive desktop/tablet/mobile layouts
- Scroll reveal animations
- Animated statistics counter
- Project category filtering
- Mobile navigation
- Reduced-motion support
- Modern energy/engineering visual direction

## Run locally
Open `index.html` in a modern browser.

For best results, serve the folder through a local web server:
- VS Code Live Server
- XAMPP/Laragon
- `python -m http.server`

## Important
The external images are temporary visual placeholders. Replace them with approved BERGS-owned project/plant photography before production.

The copy uses the public BERGS site positioning and company descriptions as a starting point. Verify all corporate claims, project figures, addresses, certifications, and subsidiary names before publishing.


### Image frame behavior
The Balingasag Power Station imagery uses the supplied Unsplash power-plant photo. Project and gallery frames use cover-style cropping with fixed responsive aspect ratios, so landscape, portrait, and square photos can be swapped in without stretching or breaking the layout.

### Latest visual adjustment
- Removed the power-plant image from the featured Balingasag project area.
- Light-mode hero imagery is now intentionally very subtle (low opacity) so the headline and supporting text remain clearly readable.
- Light-mode hero copy uses dark text with a soft light text shadow for contrast.


### v3 (modern UI)
- Animated light/dark switch with circular reveal (View Transitions), follows system preference on first visit.
- New buttons (ripple, magnetic hover), card spotlight, project/company quick-view modals, inquiry modal with type chips and success state.
- All images are generated SVG stand-ins in `assets/` (no external image hosts). Replace them with real photos (keep filenames or update references).
- Logo: `assets/logo/bergs-mark.svg` is a STAND-IN mark. Replace it with the official BERGS logo file.
- Technical Expertise accordion text and modal copy are draft copy; verify before publishing.

### v4: how to replace images
Every picture sits in a fixed-ratio frame with `object-fit: cover`, so any size or orientation fits and stays responsive.
Drop your photo into `assets/` using the same base name (e.g. `activity-01.jpg`, `.png` or `.webp`); it is picked up automatically over the placeholder `.svg`.
Hero background: `assets/hero.svg` (edit the two `hero.svg` references in `styles.css`). Adjust the crop of one image with `style="--pos: center top"` on its `<img>`.


### v5: logo, tagline, image slots
- Logos: `assets/logo/bergs-logo-dark.png` (white text, shown in dark mode) and `bergs-logo-light.png` (black text, shown in light mode). The supplied files are only 85×70 px, so they look soft on retina screens. Replace them with a larger PNG/SVG (same filenames); height is fixed and width follows the aspect ratio.
- Tagline: "One-stop shop for reliable power generation" (hero, footer, page title, meta description).
- Each company has its own slots in `assets/`: `{code}-card` (home card), `{code}-hero` (company page hero), `{code}-01/02/03` (gallery), `{code}-logo` (logo chip). Codes: bhc, bestc, bppms, bisi, bgc, brc, mdsi. Drop a .jpg/.png/.webp with the same base name and it replaces the placeholder automatically.


### v6/v7: hero media (animated logo) inside `.hero-image`
`<div class="hero-image">` holds a `<video>` built from `moving3_new.gif` (31.6 MB -> 0.8 MB): `assets/hero-media.webm`, `.mp4`, poster `.jpg`. Do not use the raw GIF on the site.
Knobs (CSS vars on `.hero-image`): `--hero-opacity` (0-1), `--w` (width of media area), `--ratio` (shape, e.g. 1920/1000), `--fit` (cover | contain), `--pos` (crop focus, e.g. center top).
To use a plain image instead: replace the `<video>` with `<img src="assets/your-image.jpg" alt="">`; the same CSS fits any size.
Re-encode: `ffmpeg -i in.gif -vf "scale=1280:-2" -c:v libx264 -crf 26 -pix_fmt yuv420p -movflags +faststart -an hero-media.mp4`

### v8: visitor-appeal polish
Company marquee under the hero, SVG capability icons, animated headline accent, floating Inquire + back-to-top button (appears after scrolling), hero parallax on desktop, gallery grid with no empty cells, Open Graph + JSON-LD (Organization) for search and link previews. Check the domain in the `og:image` / JSON-LD URLs (`https://www.bergsph.com`) matches your real one.

### v9: interactive marquee + forced video autoplay
Marquee is JS-driven (`script.js`, bottom): auto-scroll, slows to a stop on hover, drag/swipe with inertia, prev/next arrows, pause button, arrow keys, and clicking a company opens its Quick View. Speed: change `.7` in `x -= .7 * k * dt`.
Hero video now always autoplays on open (muted + inline), retries on first interaction if the browser blocks it, and has a pause button. It no longer follows the OS "Reduce motion" setting.

### v10: deployment hardening (GitHub Pages)
- `script.js` features are isolated in try/catch: one failing block can no longer stop the marquee or the hero video.
- `styles.css?v=9` and `script.js?v=9` (bump the number on each deploy) so browsers/CDN never mix a new page with an old script.
- Marquee falls back to a swipeable strip if JS fails; the video keeps `autoplay muted loop playsinline` in the HTML.
- Auto image detection caches its lookups per session (fewer 404s). Disable with `<html data-auto-img="off">` once final image filenames are in the HTML.
- Deploy checklist: upload the whole folder contents (including `assets/hero-media.webm`, `.mp4`, `.jpg`), keep file name case exactly, wait 1-10 min, then hard refresh (Ctrl+Shift+R).
