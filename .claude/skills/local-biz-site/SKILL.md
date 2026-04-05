---
name: local-biz-site
description: Build a polished single-page marketing website for a local business or small brand — hero, services, pricing, process, FAQ, and a multi-step contact form with ROI calculator. Vanilla HTML/CSS/JS, no build step, Netlify-ready. Use when the user brings a mascot, vibe, or partial brand and wants "a full website that looks pro with lots of animation." Opinionated about the ink-on-paper aesthetic unless the user asks for a different style.
---

# Local Biz Marketing Site — Playbook

A reusable workflow for turning "I have a vibe and a mascot" into a deployed, polished landing page for a local business (landscaper, barber, restaurant, contractor, coach, etc.) in a few focused sessions.

## When to use this skill

Trigger on any of:
- "build a landing page / marketing site / website for my business"
- "I have a mascot / logo / vibe — turn it into a website"
- "I need a website for a [local business type]"
- The user brings partial brand assets (colors, mascot, vibe words) and wants a full site
- The user says "vibe code" a site

Don't use for: web apps, dashboards, e-commerce stores with catalogs, multi-page sites, sites that need a CMS.

---

## The 6-stage workflow

**Always follow these stages in order.** Each one ends in a human approval point. Do NOT skip ahead — e.g. don't write CSS before the HTML skeleton is approved.

### Stage 1 — Brief

Ask the user, in ONE message, for:
1. Business type + what they do
2. Vibe (3 adjectives max — "retro, warm, playful")
3. Existing assets (mascot image? logo? colors? fonts?)
4. One or two reference sites they love (optional but super valuable)
5. Primary goal of the site (leads? bookings? showing up on Google?)

**Your role is GAP FILLER, not auto-decider.** Look at what the user brought and fill only what's missing. Don't override their choices, and don't apply rigid rules about what's "always" needed.

**Colors — fill the gap:**
- 0 colors + vibe word → pick full palette from vibe (e.g. "professional" → navy + cream + muted gold)
- 1 color + vibe word → pick the other 2 that complement it (e.g. "red" + "professional" → red + near-black + off-white)
- 2 colors → pick the 3rd only if one is needed; sometimes 2-color is the point
- 3+ colors → use them, don't add more

**Determine the animation tier NOW based on the vibe words:**
- **Heavy tier** (friendly, playful, warm, local, retro, handmade, indie, zine): full Stage 5 recipe
- **Minimal tier** (premium, luxury, boutique, professional, minimal, editorial, high-end): subtle scroll fades + smooth scroll + one signature motion — no wiggles, no magnetic buttons, no ink strikes, no word reveals. Restraint reads as expensive.

Confirm the tier with the user in one sentence before moving to Stage 2 ("going heavy / going minimal on motion, sound right?").

### Stage 2 — Content architecture (no code yet)

Propose this section list as the default for local biz sites, then cut/add with the user:

1. **Hero** — big promise headline, 1-sentence subhead, primary + secondary CTA, mascot illustration, trust line
2. **Services grid** — 4–6 cards, each with inline SVG icon + heading + 1-sentence blurb
3. **Featured work callout** — single recent project link (or testimonial if no portfolio)
4. **Pricing** — ONE plan, structured as one-time setup + monthly, with a fake-urgency countdown timer
5. **Process** — 4 numbered steps ("tell us → we build → you review → launch")
6. **FAQ** — 5 common questions as an accordion
7. **Contact / lead form** — multi-step wizard (fun first, info last)
8. **Footer** — mini nav + copyright + small brand block

Get explicit approval on the list before writing any code.

### Stage 3 — HTML skeleton

Write the full `index.html` in one pass with:
- All sections from Stage 2
- Placeholder copy in the final tone (see below)
- Inline SVG icons for services (no icon fonts, no image sprites)
- Semantic tags (`<nav>`, `<section>`, `<footer>`)
- Links to `styles.css` and `script.js` — don't write them yet
- A hidden `<svg class="svg-filters">` block with `<filter id="rough">` (feTurbulence + feDisplacementMap) for hand-drawn ink effects

**Copy tone rules:**
- All lowercase, always
- Second-person ("your business deserves...")
- Zero corporate jargon ("solutions," "leverage," "synergy" → ban)
- Short sentences, punchy
- Local-friendly ("websites for local businesses that actually look good")
- Never promise specific metrics ("300% more leads!")

Get the skeleton + copy approved before touching styles.

### Stage 4 — Styles pass

Build `styles.css` top-down in this order:
1. Reset + CSS variables (`--ink`, `--cream`, `--accent`, transitions)
2. Typography (one display font + one body font, always Google Fonts — defaults: Space Grotesk + DM Sans)
3. Button system (3 variants: solid, outline, accent)
4. Nav + mobile menu
5. Hero
6. Section utilities (`.container`, `.section`, `.section-dark`)
7. Each content section in document order
8. Responsive breakpoints at 968px + 640px

**Aesthetic defaults** (ink-on-paper stamp style — override if user wants different):
- Colors: warm cream bg (`#EDE6DB`), near-black ink (`#1A1A1A`), one vivid accent
- Imperfect borders: `border-radius: 4% 6% 5% 3% / 5% 3% 6% 4%` on cards
- Subtle rotation: `transform: rotate(-0.8deg)` or `0.5deg` — makes things feel hand-placed
- Ink stamp shadow: `box-shadow: 6px 6px 0 var(--ink)` on hover, NOT blur
- Paper texture: fixed overlay with SVG `feTurbulence` filter, mix-blend-mode multiply, ~10% opacity
- Dashed borders on featured callouts and ROI boxes
- Ink dividers between sections: SVG paths with slight waviness + stroke-dasharray draw animation

### Stage 5 — Animation pass

**If you picked MINIMAL tier at Stage 1:** do only these three things and stop. Anything more makes a premium brand feel cheap.
1. Subtle `.animate-on-scroll` fadeUp on section reveals (threshold 0.15, ~600ms, cubic-bezier ease)
2. Smooth anchor scroll + a clean nav-on-scroll shadow
3. ONE signature motion — usually a single underline draw on the hero headline, a slow Ken Burns on a hero image, or a quiet count-up on one stat. Pick one. Don't do all three.

**If you picked HEAVY tier:** dial it all the way up. The full checklist below. Brayan will tell you if it's too much.

- **Scroll reveals** — `.animate-on-scroll` class + IntersectionObserver, fadeUp transform. Stagger siblings.
- **Number count-up** — eased 0 → target when element enters viewport (shared `animateCount()` function)
- **Staged reveal sequences** — for hero pricing: show original price big → ink strike draws across → shrinks/scoots aside → discounted price POPS in → timer/save/monthly block fade in after. Collapse `max-height` on late-reveal elements so they don't reserve space.
- **Wiggle CTA** — periodic keyframe on primary button every ~3s, speeds up on hover
- **Magnetic buttons** — `mousemove` tracks cursor, translates button + inner `<span>` separately for depth
- **3D card tilt** — perspective + rotateX/Y on service cards following mouse
- **Word-by-word hero reveal** — JS splits h1 into `.word-reveal` spans, staggered drop-in with rotation
- **Ink dividers draw on scroll** — `stroke-dasharray` + intersection observer
- **Mascot zero-gravity physics** — delta-time spring physics with mouse nudge, drifts organically
- **Countdown timer** — rAF-updated digits
- **Parallax starfield/smudges** — canvas dots or CSS elements on scroll
- **FAQ accordion** — max-height transition, rotate + on open

**Critical animation traps to avoid:**
1. Don't apply `filter: url(#rough)` to clean icons — it makes them look like crayon. Save it for hand-drawn dividers, underlines, and stamps only.
2. Don't let count-up run on a number that's supposed to feel static (e.g. "$1,000 is the real price" needs to just sit there before the reveal). Use `data-defer` to skip the global count-up observer.
3. Don't leave layout space for `.reveal-late` elements — collapse `max-height`, `padding`, and `margin` too, or the hidden timer creates an awkward gap.
4. Don't combine JS magnetic effect with CSS wiggle keyframes on the same button — inline transform overrides animation. Exclude `.btn-wiggle` from the magnetic selector.
5. Don't use `display: none` → `display: block` for fade-ins — transitions don't fire on display changes. Use max-height/visibility or the double-rAF trick.
6. Respect `prefers-reduced-motion` at the end of the stylesheet with a blanket `animation-duration: 0.01ms` override.

### Stage 6 — Lead form + deploy

**Multi-step form structure — fun first, info last:**

Step 1 (the biz): business name, what they do, **vibe picker** (4 radio cards with icons) + free-text "or describe your own"

Step 2 (the dream): **color mood swatches** (6 radio cards with 2-circle previews) + free-text, "what's one thing you wish people knew", existing website status, existing CRM/email tool

Step 3 — **pick the right type based on the business model:**

- **Lead-value businesses** (services where one lead = meaningful revenue — landscaping, contractors, coaches, consultants, B2B): use the **ROI calculator**. Ask avg customer value + customers per month → show "if your site brings in just X new customers, it pays for itself. Y customers/month covers hosting forever." Add a simple 10% bump calc if they fill customers-per-month, spelled out as arithmetic ("10% more = 4 extra × $150 = $600/mo extra").

- **Volume / walk-in businesses** (tattoo shops, barbers, restaurants, cafes, retail): **skip the ROI calculator entirely**. Replace with softer questions: favorite part of what they do, a sample of their best work, hours, location. These businesses don't think in "cost per lead" — they think in vibes and reputation.

- **Booking-driven** (salons, studios, classes): ask about peak seasons, booking tool they use, capacity per day.

Match step 3 to the client, not the template.

Step 4 (their info): name, email, phone (optional), timeline, notes

**Form implementation:**
- `<form name="..." method="POST" data-netlify="true" netlify-honeypot="bot-field">`
- Hidden `<input type="hidden" name="form-name" value="...">` for Netlify detection
- Honeypot: off-screen input named `bot-field`
- Progress bar with 4 dots, animates as steps advance
- Per-step validation with form-level shake animation on errors
- Enter key advances to next step (unless in textarea)
- Submit via `fetch('/')` with URL-encoded body → shows stamped success card
- Cards POP on selection (scale bounce via cubic-bezier)

**Deploy:**
- GitHub → Netlify (auto-deploy from main branch)
- Publish directory: root (no build command)
- Netlify auto-detects forms at build time from the static HTML — no extra config
- Remind user: Netlify forms ONLY work on the deployed site, not locally or on GitHub Pages

---

## Default tech stack (don't deviate without reason)

- **Vanilla HTML + CSS + JS** in 3 files (`index.html`, `styles.css`, `script.js`)
- **No framework, no bundler, no npm, no build step**
- **Google Fonts** via `<link>` in `<head>`
- **Inline SVG** for all icons (never icon fonts)
- **Hosting:** Netlify free tier, auto-deploy from GitHub `main`
- **Forms:** Netlify Forms (no backend)
- **Images:** raw PNGs in repo root (mascot, OG image)

## The "I want lots of animation" prompt

When the user wants the animation dialed up, this exact phrasing unlocks the full recipe:

> I want you to really animate and have movement. I should have to tell you to tone it back. Like a real pro at animation websites. Numbers count up, CTA button wiggles, price reveal sequences, magnetic buttons, the works.

## Starter prompts the user can paste

**Stage 1 (brief):**
> Build a marketing site for [BUSINESS TYPE]. Vibe: [3 ADJECTIVES]. Colors I want: [COLOR 1] and [COLOR 2], pick the 3rd. I have [MASCOT/LOGO/NOTHING]. Use the `local-biz-site` skill.

**Stage 2 (architecture):**
> Propose the section list using the default architecture. Cut anything that doesn't fit [BUSINESS TYPE].

**Stage 4 (styles):**
> Build the full stylesheet in the ink-on-paper aesthetic. Imperfect borders, slight rotation on cards, stamp shadows, paper texture overlay.

**Stage 5 (animation):**
> Animation pass — dial it all the way up. The full recipe. I'll tell you if it's too much.

**Stage 6 (form):**
> Build the 4-step Netlify form with the ROI calculator on step 3. Fun first, info last.

## Reference implementation

The first site built with this skill: **Launchy** (`github.com/BRYNHDZ/Launchy`) — a site-building service for local businesses. Every technique in this playbook is in that repo. When in doubt, read that codebase for exact patterns.

## What this skill does NOT cover

- Multi-page sites (use a framework for those)
- Blogs / CMS integration
- E-commerce with real products + checkout
- Apps with authentication
- Accessible audits beyond `prefers-reduced-motion` and semantic HTML
- Actual copywriting strategy beyond tone rules
