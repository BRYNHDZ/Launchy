# Blaztly Brand Session — Handoff

**Session date:** 2026-04-19
**Goal:** codify the Blaztly brand into (1) a human-readable brand guide page on the site and (2) a reusable Claude skill that works in both Claude Code and Claude.ai.

---

## What was decided

### Identity
- **Blaztly** = website-building agency (project folder still named `Launchy`, ignore — brand is Blaztly).
- **Target:** lead-based local service businesses — contractors, lawyers, coaches, agencies, service pros.
- **Not a fit:** e-commerce. Restaurants only with embed-friendly ordering platforms (ChowNow, Toast TakeOut, Olo Rails). No Square/bare Clover iframes.
- **Positioning:** AI made everyone a web developer — taste made Blaztly. Anti-slop, not anti-AI.
- **Hero line:** *your business deserves a launchpad.*
- **Tagline energy:** *built by humans. launched by monkeys.*

### Visual system (all already in `styles.css`)
- **Palette:** `--cream` `#EDE6DB`, `--cream-light` `#F2ECE2`, `--ink` `#1A1A1A`, `--ink-light` `#2E2E2E`, `--accent` `#FF6B35`, `--accent-dark` `#E25A28`, `--gray-200/400/600` warm grays.
- **Fonts:** Cherry Bomb One (LOGO ONLY), Space Grotesk (UI/display), DM Sans (body), Caveat (accent/handwritten).
- **Orange = spotlight.** Two emphasis treatments:
  - **Anchor** (`.ink-underline`) — orange text + wobbly hand-drawn underline. Hero/display scale only.
  - **Marker** (`.highlight`) — ink text + orange marker stroke behind. Body/carousel/annotations only.
  - **Never both in one layout.**

### Voice
- **Earnest** when speaking about the customer. **Playful** when speaking about Blaztly itself.
- **Lowercase default** across all marketing. Proper nouns lowercase when legibility allows. Normal sentence case for 1:1 client comms only.
- Short, punchy, likes a twist.

### Illustrations
- Hand-drawn, inked, **strict two-tone only** (no orange, no gradients).
- Assets at project root: `mascot.png`, `rocket.png`, `asteroid.png`, `galaxy.png`, `earth.png`, `ufo cow.png`, `Banana.png`.

### Instagram
- **Core principle:** *show the what, sell the how.* Teach the outcome publicly, sell the build.
- **Primary format:** educational carousels.
- **Slide commitment rule:** each slide leans copy OR ink, never both.
- **Big numbers:** Caveat 700 **ink** (never orange), with `no.` superscript prefix on tip slides.
- **Straight layouts, crooked ink:** only ink-drawn marks (scribbles, arrows, circles) may tilt. Grids/buttons/type stay aligned.
- **Cover → tips → CTA** structure. Last slide = orange CTA button (`book a call →`).

---

## Deliverables built

### 1. `brand-guide.html` (project root)
- Live at `/brand-guide` once deployed to Netlify (Netlify strips `.html` by default).
- `<meta name="robots" content="noindex,nofollow">` — search engines won't index it.
- No link from `index.html` — intentionally not discoverable via navigation.
- 9 sections + TOC: identity, logo & mascot, color, typography, orange rules (both treatments), illustration, voice, Instagram (carousel + rules), principles.

### 2. `~/.claude/skills/blaztly-brand-guide/SKILL.md` (global Claude Code skill)
- Auto-registered — shows up in every Claude Code session.
- Full frontmatter: `name: blaztly-brand-guide` + description that triggers on any Blaztly-related work.
- Contains copy-paste CSS for `.ink-underline`, `.highlight`, CTA button, eyebrow, big-num, root tokens.
- Checklist for "before shipping a Blaztly asset" at the bottom.

### 3. Memory updated
- `C:\Users\HdzBr\.claude\projects\c--Users-HdzBr-OneDrive-Desktop-Projects-Launchy\memory\user_profile.md` — now names Blaztly (was Launchy), points to both skills.

---

## Outstanding items / next steps

### 1. Upload skill to Claude.ai (user handles)
- Settings → Capabilities → Skills → upload the `blaztly-brand-guide` folder.
- Source folder: `C:\Users\HdzBr\.claude\skills\blaztly-brand-guide\`

### 2. Create `.gitignore`
- No `.gitignore` exists yet in the project.
- Should at minimum contain:
  ```
  .superpowers/
  .DS_Store
  node_modules/
  *.log
  ```
- `.superpowers/` holds brainstorm session files — shouldn't be committed. Currently uncommitted and will stay that way if a gitignore is added before the next `git add`.

### 3. Optional: bundle brand assets into the Claude.ai skill
- To give the Claude.ai version of the skill direct access to the mascot/rocket/asteroid PNGs, copy them into `~/.claude/skills/blaztly-brand-guide/` alongside `SKILL.md` before uploading.
- Not needed for Claude Code (skill references them at the project path).

### 4. Deploy
- Push branch and Netlify will auto-deploy `brand-guide.html` → `/brand-guide`.
- Nothing else in the index changed — safe push.

---

## Files changed this session

- **Created:** `brand-guide.html` (project root) — full brand guide page.
- **Created:** `C:\Users\HdzBr\.claude\skills\blaztly-brand-guide\SKILL.md` — the skill.
- **Updated:** user profile memory to reflect Blaztly as the brand.
- **Untouched:** `index.html`, `styles.css`, `script.js`, `SKILL.md` (the old illustration-only skill at project root — can stay or be deleted later since `blaztly-brand-guide` supersedes it).

---

## How to resume the next session

Open the project. Say *"continue from the Blaztly brand handoff"* or reference this file. The brand guide is locked — next sessions should be about **using** the brand (building the IG carousel as an image, writing posts, updating the site to match the guide, etc.), not re-deciding it.

If anything in the brand rules ever feels wrong in practice, update it in both:
1. `brand-guide.html` (the living spec)
2. `~/.claude/skills/blaztly-brand-guide/SKILL.md` (the agent-readable spec)

Keep them in sync.
