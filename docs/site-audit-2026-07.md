# Website Audit & Remaining Follow-ups — July 2026

Third and final pass in the July 2026 audit series. Covers:

1. **`ink-playing-cards-www` defects** (`W-*`) — 11 findings, including a **build-breaking bug**.
2. **Marketing / landing page opportunities** (`M-*`) — 14 items.
3. **Remaining library follow-ups** (`L-*`) — 3 items not captured in the earlier passes.
4. **An atomic change ledger** (`AC-W*`, `AC-L*`) continuing the numbering scheme.

Companions: [`audit-2026-07.md`](./audit-2026-07.md) (28 bugs, 25 features),
[`refactor-plan-2026-07.md`](./refactor-plan-2026-07.md) (10 defects, 14 refactors, 56 changes).

Site baseline: `cb5814b`. `tsc --noEmit` clean, `next lint` clean.

---

## Part 1 — Website defects

### W1. `yarn build` fails from a clean checkout — React version mismatch

**Severity: critical** · `yarn.lock`, `package.json:22-23`

The committed `yarn.lock` predates the React 19 upgrade. It contains **no entry for
`react@^19.0.0`** — only `react@^18.2.0, react@^18.3.1, react@>=18.0.0: version "18.3.1"`. Both
`react` and `react-dom` are declared as floating `^19.0.0`, so they resolve independently and
land on a mismatched pair. `next build` then aborts during "Collecting page data".

**Evidence** — clean clone, `yarn install --frozen-lockfile && yarn build`:

```
unhandledRejection [Error: Incompatible React versions: The "react" and "react-dom"
packages must have the exact same version. Instead got:
  - react:      19.2.4
  - react-dom:  19.0.0
error Command failed with exit code 1.
```

`yarn install --frozen-lockfile` **did not fail** — Yarn 1 silently amended the lockfile
(`git status` showed `M yarn.lock`) rather than erroring, so the staleness is invisible until
the build breaks.

**Fix** Pin `react` and `react-dom` to the same exact version, regenerate `yarn.lock` against
the current dependency set, and add a `packageManager` field (see `W11`). Verify with a
clean-clone build.

> Note: the live site presumably builds because Vercel's resolution predates React 19.2.4's
> publish. This will break on the next cache miss or dependency change.

---

### W2. `prebuild` overwrites committed showcase data with an empty array on failure

**Severity: high** · `scripts/fetch-showcase.mjs:51-54,118-125,128-137`

`GITHUB_TOKEN` is optional in `githubHeaders()`, but GitHub's `/search/code` endpoint
**requires authentication and always returns 401 unauthenticated**. On a non-OK response
`fetchFromGitHub` returns `[]`, and `main()` then unconditionally writes `showcase.json` with
`count: 0` and exits **0**, so the build proceeds and ships an empty Showcase page. The `catch`
handler does the same thing deliberately — "Write empty data so the build doesn't break".

**Evidence** — `yarn build` with no token:

```
→ Searching GitHub for dependents...
  GitHub search failed: 401 Unauthorized
✓ Wrote 0 projects to src/data/showcase.json
```

`src/data/showcase.json` is **committed with 4 real projects**. The build replaced them with 0
and left a dirty working tree. Every contributor, fork PR, and tokenless CI run silently
destroys good data and publishes an empty page that the nav links to.

**Fix** On failure, leave the committed `showcase.json` untouched and warn. Only write when the
fetch succeeds. Fail the build loudly if a token is expected but absent in CI.

---

### W3. `/skill` has no metadata and inherits the homepage canonical

**Severity: high** · `src/app/skill/page.tsx`, `src/app/layout.tsx:84-86`

`/examples` and `/showcase` both export full `metadata` with a page-specific `canonical`.
`/skill/page.tsx` exports **none** — `grep -c metadata` returns 0. The root layout sets
`alternates.canonical = SITE_URL`, and Next.js metadata inherits, so `/skill` declares its
canonical URL to be the **homepage**.

That is an explicit duplicate-content signal telling search engines not to index the page — and
`/skill` is arguably the site's most differentiated marketing asset. It also inherits the
generic site title and description, so it has no distinct search snippet or social preview.

**Fix** Add a `metadata` export with page-specific `title`, `description`, `openGraph`, and
`canonical`. Consider removing `canonical` from the root layout entirely so a missing
per-page canonical fails visibly rather than silently pointing at `/`.

---

### W4. `/skill` is missing from the sitemap

**Severity: medium** · `src/app/sitemap.ts:14-34`

The sitemap lists `/`, `/examples`, `/showcase`, and every curated showcase slug. `/skill` is
absent (`grep -c skill sitemap.ts` → 0) despite being in the nav, linked from the homepage, and
the subject of its own PR (#11). Compounds `W3`.

**Fix** Add the entry. Better: derive the static route list from one shared constant so nav,
sitemap, and metadata cannot drift.

---

### W5. Five of six analytics events are never fired

**Severity: medium** · `src/lib/analytics.ts:13-35`

`trackEvent` defines six events. Only `codeBlockCopy` is wired (in `CodeBlock.tsx:125`,
`CopyButton.tsx:12`, `CopyableCode.tsx:29`). These are dead:

| Event | Would measure |
| --- | --- |
| `demoInteraction` | whether anyone actually plays the live terminals — **the site's entire differentiator** |
| `ctaClick` | whether the hero converts |
| `externalLink` | GitHub vs npm click split |
| `viewExamples` | examples funnel |
| `storybookNavigation` | which components people explore |

So the two questions most worth answering — *does the hero convert* and *do people engage with
the live demos* — are currently unanswerable.

**Fix** Wire the five events. `demoInteraction` and `ctaClick` first.

---

### W6. Version fallback is stale and displays wrong information

**Severity: low** · `src/lib/version.ts:1`

`FALLBACK_VERSION = "1.0.0"` while the published package is `1.1.1`. If the npm registry fetch
fails at build time the footer confidently renders `ink-playing-cards v1.0.0` — worse than
rendering nothing.

**Fix** Fall back to the installed dependency's version (`ink-playing-cards/package.json`) so
the fallback tracks reality, or render the version only on success.

---

### W7. `README.md` describes a project that no longer exists

**Severity: low** · `README.md`

| Claim | Reality |
| --- | --- |
| `ink ^5.1.0` | `^6.0.0` |
| `ink-playing-cards ^0.7.0` | `^1.1.1` |
| Font: Geist | Playfair Display + DM Sans + Space Mono |
| `react-xtermjs` in the stack | not a dependency |
| "Current Approach (Manual Shims)" | uses `ink-canvas` |
| "Project Goal: Build a Next.js marketing website" | the site is live |

**Fix** Rewrite as documentation of a shipped site, not a plan.

---

### W8. The steering file is stale *and* `inclusion: always`

**Severity: medium** · `.kiro/steering/project-overview.md`

Same drift as `W7`, but this file has `inclusion: always` — so every agent session on this repo
is fed outdated context as authoritative background. It presents the ink-canvas integration as
an unresolved decision ("Option C: current exploration", "Recommendation: use ink-canvas…
requires upgrading first"), lists `ink-playing-cards ^0.8.0` and `@xterm/xterm ^5.5.0 → needs
^6.0.0`, and points at `src/components/raw-term.ts` and `Terminal.tsx` — **neither of which
exists**.

This is the highest-leverage doc fix in either repo: a wrong always-on steering file actively
misleads every future agent-assisted change.

**Fix** Rewrite to describe the current architecture. Move the researched-alternatives
comparison to a dated ADR if it is worth keeping.

---

### W9. The site vendors a stale copy of the library's storybook

**Severity: medium** · `src/components/storybook/views/` (7 files)

The site duplicates the library's storybook rather than importing it, and has already drifted:

```
library: CardStackView CardView CustomCardView DeckView GridView MiniCardView TarotCardView UnicodeCardView
site:    CardStackView CardView CustomCardView DeckView GridView MiniCardView                UnicodeCardView
```

`TarotCardView` is missing, so the site's interactive storybook cannot show the newest
component. Every future library view must be hand-ported.

Related: the library currently ships `dist/storybook` to npm (`B7`). Removing it is still safe
because the site has its own copy — but importing from the package would be the better fix for
both problems, and would need `B7` reconsidered.

**Fix** Either import the storybook from the published package (and keep it in `files`), or
document the copy as intentional and add a sync checklist. Pick one deliberately.

---

### W10. `topLevelAwait` build warnings from Ink and yoga-layout

**Severity: low** · `next.config.ts`

`next build` emits repeated warnings for `ink/build/reconciler.js`, `ink/build/render-to-string.js`,
and `yoga-layout/dist/src/index.js`:

> The generated code contains 'async/await' because this module is using "topLevelAwait".
> However, your target environment does not appear to support 'async/await'.

Currently harmless (these run client-side in modern browsers) but they obscure real warnings.

**Fix** Raise the webpack `target`/browserslist floor so top-level await is supported, or scope
the warning suppression narrowly.

---

### W11. No `packageManager` field, and lockfile discipline is unenforced

**Severity: medium** · `package.json`

A `yarn.lock` is committed but no `packageManager` field declares which package manager or
version owns it. `npm install` happily ignores it and produces a different (also broken) tree.
`.gitignore` has no lock entries, so a stray `package-lock.json` could be committed alongside.

Same finding as `B27` in the library — worth fixing in both repos with the same convention.

**Fix** Add `"packageManager": "yarn@1.22.22"`, add `package-lock.json` and `pnpm-lock.yaml` to
`.gitignore`, and run a clean-clone install + build in CI. (There is no CI workflow in this repo
at all — see `AC-W12`.)

---

## Part 2 — Marketing & landing page opportunities

The site is genuinely good: strong visual identity, real live demos, solid base SEO. These are
conversion and content gaps, roughly ordered by expected impact.

### M1. The primary CTA sends the highest-intent click off-site

`src/app/page.tsx:118-133`

"Get Started" — the single most prominent button — links to `github.com/gfargo/ink-playing-cards`
with `target="_blank"`. The visitor most ready to act is handed to a raw README instead of the
install command and quick start that already exist *further down the same page*.

**Fix** Point "Get Started" at `#quick-start` (or a `/docs` route once `M4` exists) and demote
GitHub to a secondary link. This is a one-line change with the best effort-to-impact ratio on
the page.

### M2. No social proof anywhere

A grep for `shields.io`, `badge`, `downloads`, or `stargazers_count` across `src/` returns
nothing but the skill page's internal "recommended" label. There is no version badge, no npm
download count, no GitHub star count — and the library's own `readme.md` has **zero badges**
either.

Meanwhile the data already exists: `showcase.json` carries `stars` per project, and four real
games (`tBlackjack`, `tMemory`, `tSolitaire`, `tTarot`) ship on npm.

**Fix** Add npm version + downloads badges to both the readme and the site footer. Surface an
aggregate on the homepage ("4 games built with it").

### M3. `TarotCard` is invisible across the entire site

The library's newest headline component (252 lines, 22 tests, a 78-card deck, its own PR #8)
appears **nowhere** on the marketing site:

- not in `FEATURES` on the homepage (`page.tsx:13-56`)
- no `TarotCardDemo` in `src/components/demos/` (12 demos, none tarot)
- no `TarotCardView` in the site's storybook (`W9`)

The only "Tarot" hits are `tTarot`, a *consumer app* in the showcase — a different thing.
Shipping a major feature that the marketing site never mentions is the clearest content gap here.

**Fix** Add a tarot demo, a `FEATURES` entry, and port `TarotCardView`. Pairs with `L1`.

### M4. No API reference on the site

Routes are `/`, `/examples`, `/showcase`, `/skill`. There is no `/docs`. Anyone wanting a prop
table leaves for the GitHub readme — which also has no TarotCard section (`L1`).

**Fix** Generate a reference from the TypeScript declarations. This is `F25` from the first
audit; the `/skill` page shows the design language already supports dense reference content.

### M5. 22 written game guides are invisible to the site

The library has **22 example guides** in `examples/*.md` — blackjack, klondike, pyramid, uno,
go-fish, poker, war, memory, cribbage-adjacent variants. The site's `/examples` page shows
**12 component demos** and links to none of the guides.

There is also a naming mismatch: `/examples` is really "component demos", while the repo's
"examples" are game tutorials.

**Fix** Render the guides as site pages (they are already markdown) — 22 pages of
long-tail-SEO game-tutorial content for near-zero authoring cost. Rename the existing page to
`/components` or `/playground`.

### M6. No changelog or releases page

Nothing announces what shipped. `release-it` is configured to write `changelog.md`
(`.release-it.json`) but no changelog is committed in either repo.

**Fix** A `/changelog` route sourced from GitHub Releases. Gives returning visitors a reason to
come back and gives releases a linkable home.

### M7. Structured data only on the homepage

`application/ld+json` appears in `src/app/page.tsx` only. `/showcase/[slug]` pages are ideal
`SoftwareApplication` candidates, and `/examples` guides would suit `TechArticle`/`HowTo`.

### M8. Static OG image for every page

All pages share `/og-image.png`. Showcase and example pages would benefit from dynamic OG
images via Next.js `ImageResponse` — rendering the game name and terminal art makes shared
links far more clickable.

### M9. The showcase is the strongest asset and is underused on the homepage

Four real, installable games built on the library is the most persuasive proof available, and
the homepage never mentions them — the showcase is only reachable via nav. "Built for agents"
gets a full homepage section; "four shipped games" gets none.

**Fix** Add a homepage showcase strip above or beside the agent section.

### M10. No "why this exists" or comparison framing

The page explains *what* the library does but never *why* someone should reach for it over
hand-rolling Ink `<Box>`/`<Text>`. No before/after, no "what this saves you". The `/skill` page
has a before/after demo — that framing belongs on the homepage.

### M11. No fallback when the live terminal fails

The whole hero rests on xterm.js + ink-canvas running in-browser. On unsupported browsers,
blocked JS, or a slow connection, there is no static screenshot or GIF fallback — the
differentiator becomes an empty box.

**Fix** Render a static ASCII/`<pre>` or image fallback inside the terminal container.

### M12. Live-terminal accessibility and keyboard trapping

The interactive terminals capture keystrokes. Worth verifying a keyboard-only user can escape
each terminal (and that arrow keys do not hijack page scroll on mobile). Decorative suits are
correctly `aria-hidden`, so the basics are already in place.

### M13. No end-of-page conversion step

The page ends on the agent-skill section then the footer. No "star on GitHub", no final install
CTA, no next step.

### M14. No `prefers-reduced-motion` support — confirmed accessibility defect

`src/app/globals.css`, `src/app/page.tsx`, `src/components/Reveal.tsx`

The homepage is animation-heavy: `animate-float` on three decorative suits, `animate-fade-in-up`
with staggered `delay-1`…`delay-4`, a scroll-triggered `Reveal` wrapper, and hover transitions
throughout — 12 animation utility usages across `page.tsx` and `globals.css`.

**Evidence** `grep -c "prefers-reduced-motion" src/app/globals.css` → **0**. There is no
reduced-motion handling anywhere in the stylesheet.

Users with vestibular disorders who have set the OS-level reduced-motion preference get the full
animation treatment. This is a WCAG 2.3.3 (Animation from Interactions) failure and the only
confirmed accessibility defect found on the site.

**Fix** Add a `@media (prefers-reduced-motion: reduce)` block in `globals.css` that disables the
float/fade keyframes and neutralises `Reveal`'s transition.

---

## Part 3 — Remaining library follow-ups

### L1. `readme.md` never mentions `TarotCard`

**Severity: medium** · `readme.md`

`grep -c TarotCard readme.md` → **0**. `grep -c createTarotDeck readme.md` → **0**.

The readme's Components section documents Card, MiniCard, UnicodeCard, CustomCard, CardStack,
CardGrid, and Deck. `TarotCard` — exported from the public API, 22 tests, a 78-card deck
constructor — is absent from the Components section, the Features list, and the Utilities
section. `SKILL.md` covers it (9 mentions), so **the agent skill documents the library better
than the readme does**.

**Fix** Add a `### TarotCard` section and `createTarotDeck` to Utilities. Pairs with `M3`.

### L2. Neither repo's readme has badges

**Severity: low** · `readme.md`

No npm version, downloads, license, or CI badge. Standard signal of project health on an npm
landing page, and npm renders the readme as the package page.

### L3. `.release-it.json` targets a changelog that is not committed

**Severity: low** · `.release-it.json`

`infile: "changelog.md"` but no `changelog.md` exists in the repo. Either releases are not
generating it or it is being discarded. Feeds `M6`.

---

## Part 4 — Atomic change ledger (continued)

Continues the numbering from `refactor-plan-2026-07.md`. `AC-W*` = website, `AC-L*` = library.

### Website — Phase W0: unbreak the build

| ID | Change | Files | Verify | Dep |
| --- | --- | --- | --- | --- |
| **AC-W01** | Pin `react`/`react-dom` to one exact version; regenerate `yarn.lock` (`W1`) | `package.json:22-23`, `yarn.lock` | Clean clone → `yarn install --frozen-lockfile && yarn build` exits 0 | — |
| **AC-W02** | Add `packageManager`; ignore foreign lockfiles (`W11`) | `package.json`, `.gitignore` | `yarn install --frozen-lockfile` twice, no lockfile diff | AC-W01 |
| **AC-W03** | Never overwrite `showcase.json` on fetch failure (`W2`) | `scripts/fetch-showcase.mjs:51-54,118-125,128-137` | Build with no `GITHUB_TOKEN`: committed 4 projects intact, warning emitted | — |
| **AC-W04** | Add a CI workflow (install, lint, typecheck, build) | new `.github/workflows/ci.yml` | A PR that breaks the build goes red | AC-W02 |

### Website — Phase W1: SEO and measurement

| ID | Change | Files | Verify | Dep |
| --- | --- | --- | --- | --- |
| **AC-W05** | Add `metadata` to `/skill` with its own canonical (`W3`) | `src/app/skill/page.tsx` | Rendered `<link rel="canonical">` is `/skill` | — |
| **AC-W06** | Drop the blanket `canonical` from the root layout (`W3`) | `src/app/layout.tsx:84-86` | No page inherits the homepage canonical | AC-W05 |
| **AC-W07** | Add `/skill` to the sitemap; derive routes from one constant (`W4`) | `src/app/sitemap.ts`, new `src/lib/routes.ts`, `src/components/Nav.tsx` | `/sitemap.xml` contains every nav route | AC-W05 |
| **AC-W08** | Wire `demoInteraction` and `ctaClick` (`W5`) | `src/lib/analytics.ts`, `DemoShowcase.tsx`, `StorybookCanvas.tsx`, `page.tsx:118-133` | Both events appear in Vercel Analytics | — |
| **AC-W09** | Wire `externalLink`, `viewExamples`, `storybookNavigation` (`W5`) | `Nav.tsx`, `Footer.tsx`, `storybook/storybook.tsx` | All six events fire | AC-W08 |
| **AC-W10** | Version fallback tracks the installed package (`W6`) | `src/lib/version.ts:1` | With the registry unreachable, footer shows the real version | — |

### Website — Phase W2: content and conversion

| ID | Change | Files | Verify | Dep |
| --- | --- | --- | --- | --- |
| **AC-W11** | Repoint "Get Started" on-page; demote GitHub (`M1`) | `src/app/page.tsx:118-133`, `QuickStartSection.tsx` (add `id`) | CTA scrolls to quick start | AC-W08 |
| **AC-W12** | Add npm version + downloads badges (`M2`, `L2`) | `src/components/Footer.tsx`, `../ink-playing-cards/readme.md` | Badges render and resolve | AC-W10 |
| **AC-W13** | Add `TarotCardDemo` + a `FEATURES` entry (`M3`) | new `src/components/demos/TarotCardDemo.tsx`, `page.tsx:13-56`, `DemoSection.tsx` | Tarot demo renders live | — |
| **AC-W14** | Port `TarotCardView` into the site storybook (`W9`, `M3`) | new `src/components/storybook/views/TarotCardView.tsx`, `storybook/storybook.tsx` | Tarot reachable in the storybook menu | AC-W13 |
| **AC-W15** | Decide the storybook duplication strategy (`W9`) | `src/components/storybook/**` or `package.json` | Documented decision; no silent drift path | AC-W14 |
| **AC-W16** | Homepage showcase strip (`M9`) | `src/app/page.tsx`, `src/data/curated-demos.ts` | Four games visible without opening the nav | AC-W03 |
| **AC-W17** | Render the 22 game guides as site pages (`M5`) | new `src/app/guides/[slug]/page.tsx`, `../ink-playing-cards/examples/*.md` | 22 routes in the sitemap | AC-W07 |
| **AC-W18** | Rename `/examples` → `/components`, redirect old path (`M5`) | `src/app/examples/` → `src/app/components/`, `next.config.ts` | `/examples` 308s to `/components` | AC-W17 |
| **AC-W19** | `/changelog` from GitHub Releases (`M6`) | new `src/app/changelog/page.tsx`, `src/lib/releases.ts` | Latest release renders | AC-W07 |
| **AC-W20** | Dynamic OG images for showcase + guides (`M8`) | new `opengraph-image.tsx` routes | OG preview shows the project name | AC-W17 |
| **AC-W21** | JSON-LD on subpages (`M7`) | `showcase/[slug]/page.tsx`, `guides/[slug]/page.tsx` | Rich Results Test passes | AC-W17 |
| **AC-W22** | Static fallback inside terminal containers (`M11`) | `StorybookCanvas.tsx`, `QuickStartCanvas.tsx`, `ShowcaseDemoCanvas.tsx` | With JS disabled, a card visual still renders | — |
| **AC-W23** | "Why this exists" / before-after section (`M10`) | `src/app/page.tsx` | Section present above Features | AC-W11 |
| **AC-W24** | Closing CTA above the footer (`M13`) | `src/app/page.tsx`, `Footer.tsx` | Final install + star CTA present | AC-W11 |
| **AC-W25** | Add a `prefers-reduced-motion` block (`M14`) | `src/app/globals.css`, `src/components/Reveal.tsx` | With the OS preference set, no float/fade animation runs | — |
| **AC-W29** | Verify keyboard escape from live terminals (`M12`) | `StorybookCanvas.tsx`, `QuickStartCanvas.tsx`, `ShowcaseDemoCanvas.tsx` | Tab moves focus out of every terminal | — |

### Website — Phase W3: hygiene

| ID | Change | Files | Verify | Dep |
| --- | --- | --- | --- | --- |
| **AC-W26** | Rewrite the always-on steering file (`W8`) | `.kiro/steering/project-overview.md` | No claim contradicts `package.json` | — |
| **AC-W27** | Rewrite `README.md` (`W7`) | `README.md` | Same | AC-W26 |
| **AC-W28** | Resolve `topLevelAwait` warnings (`W10`) | `next.config.ts` | `yarn build` emits no top-level-await warnings | AC-W01 |

### Library — follow-ups

| ID | Change | Files | Verify | Dep |
| --- | --- | --- | --- | --- |
| **AC-L01** | Document `TarotCard` + `createTarotDeck` in the readme (`L1`) | `readme.md:80-198,328-337` | `grep -c TarotCard readme.md` > 0 | — |
| **AC-L02** | Add badges to the library readme (`L2`) | `readme.md:1-4` | Badges render on npm | AC-L01 |
| **AC-L03** | Commit a changelog or drop the `infile` config (`L3`) | `.release-it.json`, new `changelog.md` | Config matches what is committed | — |

---

## Recommended order

**This week — the build is broken.** `AC-W01` (React pin) and `AC-W03` (stop clobbering
showcase data) are the only two urgent items in this document. `AC-W04` (CI) stops both from
recurring; there is currently no CI in the www repo at all, which is how `W1` reached `main`.

**Then, cheap and high-impact:** `AC-W05`–`AC-W07` (make `/skill` indexable — it is currently
telling Google it is a duplicate of the homepage), `AC-W11` (stop sending the primary CTA
off-site), `AC-W26` (the stale always-on steering file misleads every agent session), and
`AC-L01` (a shipped headline feature is undocumented).

**Then content:** `AC-W17` (22 game guides as pages) is the largest SEO opportunity in the
project for the least authoring effort — the content is already written and committed.

**Deliberate decision needed:** `AC-W15`. The duplicated storybook has already drifted by one
view. It interacts with library bug `B7` (which ships `dist/storybook` to npm) — resolve them
together rather than independently.
