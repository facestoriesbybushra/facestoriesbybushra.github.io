# Face Stories by Bushra

Marketing site for **Face Stories by Bushra** — a bridal and event makeup studio in
Jamshedpur, Jharkhand. Live at <https://facestoriesbybushra.com>.

Static HTML, CSS and vanilla JavaScript. **No server, no backend, no build step,
no dependencies** — the files in this folder are exactly what gets served.

---

## Viewing it locally

Double-click `index.html`. That's it — it opens straight in the browser and
everything works, including the carousels and galleries.

(One quirk: on the `404.html` page the links point at `/`, which only resolves
once the site is actually hosted. Every other page works fine from disk.)

---

## Hosting

`facestoriesbybushra.com` is served by **Netlify**, deploying from the `main`
branch of `facestoriesbybushra/facestoriesbybushra.github.io`. Pushing to
`main` publishes the site — there is no staging step.

Netlify-specific pieces in this folder:

- `_headers` — forces the brochure PDF to download instead of opening inline
- the contact form's `data-netlify="true"` attribute — Netlify handles submissions

The repo also has GitHub Pages enabled, which mirrors the site at
`facestoriesbybushra.github.io`. There is deliberately **no `CNAME` file**: adding
one would make GitHub Pages try to claim the custom domain that Netlify serves.

---

## Project structure

```
FSB/
├── index.html              Home — hero carousel, services, testimonials
├── about.html              Artist bio + award video showcase
├── portfolio.html          Auto-scrolling photo wall + full-res lightbox
├── brochure.html           Packages, pricing, inclusions, booking policy
├── contact.html            Enquiry form, map, studio details
├── success.html            Post-form thank-you (noindex)
├── 404.html                Not-found page
├── robots.txt              Crawl rules
├── sitemap.xml             Indexable URLs
├── favicon.ico
│
└── assets/
    ├── css/
    │   ├── base.css        Design tokens, reset, typography, a11y utilities
    │   ├── layout.css      Header, nav, footer, page shells
    │   ├── components.css  Buttons, icon controls, modals, spinner
    │   └── pages/          One stylesheet per page
    │
    ├── js/
    │   ├── modules/        Reusable behaviour, one concern per file
    │   │   ├── modal.js             Accessible open/close/focus handling
    │   │   ├── swipe.js             Shared touch-swipe detection
    │   │   ├── glitter-canvas.js    Decorative particle background
    │   │   ├── scroll-animations.js AOS wrapper
    │   │   ├── hero-carousel.js     Home hero slideshow
    │   │   ├── testimonial-carousel.js
    │   │   ├── photo-wall.js        Portfolio looping columns
    │   │   ├── image-lightbox.js    Full-resolution photo viewer
    │   │   ├── award-slider.js      About-page award clips
    │   │   └── video-lightbox.js    Award clip with sound
    │   └── pages/          Entry point per page; wires modules together
    │
    ├── img/
    │   ├── portfolio/      Web-sized gallery images
    │   │   └── full/       Original full-resolution files (lightbox only)
    │   ├── hero/           Hero backgrounds (desktop + `-mobile` variants)
    │   ├── testimonials/   Client photos
    │   ├── services/       Service card imagery
    │   ├── about/          Portrait + award video posters
    │   └── brand/          Logo, logo mark, apple touch icon
    │
    ├── video/              Award clips (audio removed)
    └── docs/               Downloadable brochure PDF
```

---

## How things work

### Images: two sizes, on purpose

Photography is the product here, so the gallery serves **compressed, web-sized
images** while the **untouched originals** sit in `assets/img/portfolio/full/`
and are fetched only when a visitor actually opens a photo. That keeps the page
fast without ever showing anyone a degraded picture.

Note: 12 of the 18 originals are PNG files that were saved with a `.jpg`
extension. They were copied here losslessly under their **true** extension, so
the `full/` folder contains a mix of `.jpg` and `.png`. Converting them to JPEG
would cut their size substantially, but it is lossy, so it was left as a
deliberate decision for later rather than applied silently.

### Portfolio: progressive enhancement

`portfolio.html` ships a plain `<ul>` grid where every photo is a real link to
its full-size file. That is what search engines index and what a visitor without
JavaScript sees. On load, `photo-wall.js` reads those items and rebuilds them
into the endlessly looping columns. Nothing is generated from a JS array, so the
gallery can never be empty for a crawler.

### Adding a portfolio photo

1. Drop the original in `assets/img/portfolio/full/` as `portfolio-NN.jpg`.
2. Add a compressed copy in `assets/img/portfolio/` with the same name:
   ```bash
   sips -s format jpeg -s formatOptions 65 -Z 1000 \
     assets/img/portfolio/full/portfolio-19.jpg \
     --out assets/img/portfolio/portfolio-19.jpg
   ```
3. Copy the last `<li>` in `portfolio.html`, bump the numbers, write a
   descriptive `alt`.

The columns, looping and lightbox pick it up automatically.

### Adding a testimonial

Copy the last `<figure class="testimonial-card">` in `index.html`. The **full**
quote goes in the `<blockquote>` — CSS clamps it to five lines on the card and
the modal re-reads the same element, so the text is written once and search
engines see all of it.

### Motion

Every animation checks `prefers-reduced-motion`. With that enabled the glitter
background is removed, the photo wall stands still, and scroll animations are
disabled.

---

## Tracking

Both run on every page:

| Tool | ID | Purpose |
| --- | --- | --- |
| Meta Pixel | `1280521714030635` | Instagram/Facebook ad retargeting and conversions |
| Google Analytics 4 | `G-Y875RYH6HM` | Visitor numbers, location, device, traffic sources |

`success.html` additionally fires a `Lead` (Meta) and `generate_lead` (GA4)
event, so a completed enquiry registers as a conversion in both dashboards.

---

## Contact form

The form in `contact.html` is currently wired for **Netlify Forms**
(`data-netlify="true"` plus the hidden `form-name` input).

**This only works if the site is hosted on Netlify.** Processing a form
submission needs a server, and GitHub Pages only serves files — it has nothing
to receive a POST. On GitHub Pages the form will appear to work but the message
goes nowhere.

Options if you host on GitHub Pages:

- **Formspree** (free tier, ~2 minutes to set up) — sign up, then change the
  form tag to `<form action="https://formspree.io/f/YOUR_ID" method="POST">`
  and delete the `data-netlify` attribute and hidden `form-name` input.
- **Keep it on Netlify** — Netlify also hosts static sites for free and handles
  the form natively, in which case leave the markup as-is.
- **Drop the form** and rely on the WhatsApp / call / email links, which already
  work everywhere and need no backend.

---

## SEO

- Unique `<title>`, meta description and canonical URL per page
- Open Graph + Twitter Card tags so shared links render a proper preview
- One `BeautySalon` entity defined on the homepage with `@id`; other pages
  reference it by that id rather than duplicating the block, and add their own
  `BreadcrumbList`
- `robots.txt` + `sitemap.xml`; `success.html` and `404.html` are `noindex`

After any change to page URLs, update `sitemap.xml` and resubmit it in Google
Search Console.
