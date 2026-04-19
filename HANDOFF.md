# Blaztly Session — Handoff (2026-04-19)

**Goal this session:** expand the portfolio section on the main site, ship the two unlive portfolio subpages with animations that fit each client's vibe, reword the pricing section to reflect multi-tier reality, complete full on-page SEO, and scope out a Google Business Profile setup for Blaztly itself.

---

## What shipped

### 1. Recent work / portfolio section (index.html)
Replaced the single-item "featured callout" with a proper portfolio layout:
- **Amigo spotlight** — biggest highlight (`★ featured build ★` stamp, dashed ink border, rotates slightly, drop shadow). Linked to https://amigolandscaping.com
- **4-card grid** below the spotlight:
  - `erikblendz.com` — live, orange "* live *" tag, external link
  - `hairbymayel.com` — live, orange "* live *" tag, external link
  - `valdocuts` — dashed ink-bordered "* portfolio *" tag, internal link → `/valdocuts.html`
  - `nardoblends` — dashed ink-bordered "* portfolio *" tag, internal link → `/nardoblends.html`

CSS: new `.work-hero`, `.work-card`, `.work-card-tag-live`, `.work-card-tag-portfolio` blocks in `styles.css`. Old `.featured-*` rules removed. Mobile media query updated.

### 2. Portfolio subpages
Both created fresh at project root with `<meta name="robots" content="noindex, nofollow">` (excluded from search, also excluded via robots.txt).

**`valdocuts.html` — premium / elegant**
- Tailwind CDN + Great Vibes + Playfair + Montserrat
- Animations:
  - Hero "Valdo" reveals letter-by-letter (slow cursive fade-up)
  - Gold hairline divider draws outward under the name
  - Tagline / body / CTAs cascade in with soft ease
  - Service rows: gold left-border grows top-down on hover
  - Book Appointment button: gold shimmer sweep on hover
  - Stars sparkle once on load
  - Scroll-reveal on sections below the fold
- Respects `prefers-reduced-motion`

**`nardoblends.html` — SRT / aggressive**
- Tailwind CDN + Kanit + Inter + FontAwesome
- Red (`#DC0000`) is strictly on the `//` slash marks and the top RPM scroll-progress bar. **Nowhere else.** (User explicit: "less makes it stronger.")
- Animations:
  - Hero `//NARDO` slams in from the left (opacity + translateX, hard ease, no bounce, no letter stagger — user pushed back on earlier letter-by-letter version as "goofy")
  - RPM progress bar at top grows with scroll
  - Service rows: slide-in from left, staggered
  - Book Now button: black L→R sweep on hover (not red)
  - Gallery borders on hover: black (not red)
  - Image-reveal on the hero portrait
- Phone in footer is `tel:` only, "(Text Preferred)" copy removed

### 3. Pricing section reword (index.html)
Prior copy implied there was only one plan. Reframed to reflect that the launch package is a starting tier:
- h2: `one plan. no confusion.` → `simple starter pricing.`
- sub: dropped `no packages to compare`; now `the launch package covers everything a new site needs. no surprise invoices.`
- label: `one-time setup` → `one-time setup — starts at`
- **Features list now includes:**
  - `basic contact form — leads straight to your inbox`
  - `google business profile setup`

Positive framing throughout — no mention of upsell tiers or CRM connections even though they exist.

### 4. On-page SEO pass — complete
**`<head>` additions:**
- Keyword-rich title, meta description, author, robots, theme-color, canonical (`https://blaztly.com/`)
- Favicon + apple-touch-icon pointing to `mascot.png`
- Open Graph (type/site_name/title/description/url/image/image:alt/locale)
- Twitter Card (summary_large_image)

**Three JSON-LD schema blocks:**
- `ProfessionalService` — name, description, logo, email `contact@blaztly.com`, phone `+1-218-583-7714`, `sameAs` → `https://www.instagram.com/blaztly`, `makesOffer` with $700 Launch Package
- `WebSite` — baseline
- `FAQPage` — all 5 FAQ questions mapped for rich-snippet eligibility

**Footer contact row added:**
- `contact@blaztly.com` · `@blaztly` · `(218) 583-7714` — styled with Space Grotesk, separators hide on mobile.

**Crawl files at project root:**
- `robots.txt` — allows everything except the portfolio subpages (already `noindex`); references sitemap
- `sitemap.xml` — single entry for `/` (portfolio pages excluded since they're noindex)

---

## Decisions made this session

- **Red restraint on Nardo:** only `//` slashes + top RPM bar. Explicitly stripped from: hero left-border, stars, location icon, Book Now shadow, hover states, gallery borders, selection color. Saved as feedback memory.
- **Booksy stays as Nardo's CTA.** User hates marketplaces but doesn't want SMS-to-book or a manual alternative there. Also hates Square iframes. Wants something custom eventually but won't pick for clients.
- **GBP strategy: local only, not nationwide.** Web design is a remote service but GBP ranks by proximity — going wide dilutes. Lead with local GBP for inbound, use outbound/Instagram/content for nationwide.
- **Nardo hero description** is a placeholder (`Professional barber based in West Chicago, IL. Booking through Booksy.`). Earlier attempt ("Clean cuts, sharp lines, zero filler...") was called cringe. User open to removing the paragraph entirely if we wanted to let the heading + location carry it.

---

## Outstanding / next up

### Blaztly's own Google Business Profile
Walked through the full setup with the user; he's paused before video verification. Notes for when he resumes:

- **Business name:** Blaztly
- **Primary category:** Website Designer
- **Additional categories:** Marketing Agency, Graphic Designer, Web Hosting Company, Advertising Agency
- **Location type:** service-area (hide physical address)
- **Service area:** West Chicago + Wheaton + Naperville + Aurora + Geneva + St. Charles + Batavia + Elmhurst (approved list — user is in West Chicago, IL)
- **Hours:** Mon–Fri 9a–6p CT, + optionally Sat 10a–2p; enable "By appointment only" attribute
- **Description:** finalized version (no em dashes, no pricing, no monkey line):
  > Blaztly builds hand-crafted websites for local service businesses like contractors, lawyers, coaches, and service pros. Our launch package includes custom design, lite branding, domain, fast hosting, a basic contact form, and Google Business Profile setup. Sites go live in under 7 days. We handle unlimited edits forever. No templates. No slop. Every site is designed by humans for the business behind it.
- **Services to list (~9):** Custom Website Design, Website Hosting & Support, Lite Branding Package, Logo Design, Domain Setup, Google Business Profile Setup, Contact Form Setup, SEO Setup, Website Edits & Updates
- **Photos to upload:** logo (mascot.png), headshot.png, cover = clean screenshot of amigolandscaping.com, plus shots of erikblendz/hairbymayel/valdocuts/nardoblends
- **Verification:** video verify required. 2-min single-take: outside/neighborhood → walk to desk → laptop showing blaztly.com loaded, contact@blaztly.com inbox, Netlify panel for blaztly.com, domain registrar, any physical proof (business card, printed logo, mail addressed to him, bank/Stripe dashboard).

### Phone number
User's current `+1-218-583-7714` is a cold-outreach dialer line and likely to go bad. Plan: get a free **Google Voice** number for the main client-facing line, keep the dialer for outreach only. When swapped, update in two spots:
- `index.html` head — JSON-LD `telephone` field
- `index.html` footer contact row — `tel:` link

### Deploy
All changes are local. Netlify will auto-deploy on push. No build step.

### Still-open items from prior session
- `.gitignore` still missing at project root. Should include `.superpowers/`, `.DS_Store`, `node_modules/`, `*.log`.
- `SKILL.md` (the old illustration-only skill at project root) is superseded by the global `blaztly-brand-guide` skill — can be deleted.

---

## Files changed this session

**Modified:**
- `index.html` — portfolio section, pricing rewording, SEO meta + JSON-LD, footer contact row
- `styles.css` — `.work-*` blocks (replacing `.featured-*`), footer contact styles, mobile adjustments

**Created:**
- `valdocuts.html` — premium portfolio page with elegant animations
- `nardoblends.html` — SRT-energy portfolio page with restrained red accent
- `robots.txt` — allow all except portfolio subpages, links sitemap
- `sitemap.xml` — single `/` entry

**Untouched this session:**
- `script.js`, `brand-guide.html`, `SKILL.md`, skill folder, all PNGs

---

## Memory updates

- Added `feedback_accent_restraint.md` — rule: signature accent color goes on 1–2 anchor spots only; scattering across CTAs/borders/stars/hovers dilutes impact. Indexed in MEMORY.md.

---

## How to resume

Open the project. Say *"pick up from the 2026-04-19 handoff"* or reference this file. The two highest-priority next moves are:
1. **Finish Blaztly's own GBP** (video verification → go live) — copy is already drafted in this doc.
2. **Swap the dialer phone for a Google Voice number** — two-file update described above.

If the user decides he wants to build something custom to replace Booksy for client booking flows (he hinted at it), that's a separate scoped effort — not a quick win.
