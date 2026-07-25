# Refactor & Fix Plan — July 2026

Companion to [`audit-2026-07.md`](./audit-2026-07.md). That document catalogued **28 bugs**
and **25 feature items**. This one is a second pass focused on:

1. **New defects** not caught the first time (`N-*`) — 10 findings, all reproduced.
2. **Refactor opportunities** (`R-*`) — 14 findings, mostly duplication and layered
   layout math.
3. **An atomic change ledger** (`AC-*`) — every fix and refactor from *both* documents
   broken into single-commit units with file/line references, dependencies, and a
   verification step.

Baseline: `62316ee` (v1.1.1). Every `Evidence` block was reproduced against compiled
`dist/` output.

Cross-references: `B##`/`F##` refer to items in `audit-2026-07.md`.

---

## Part 1 — New defects

### N1. `CardGrid`'s `alignment.vertical` is a no-op

`src/components/CardGrid/index.tsx:60-100,140`

`getAlignmentStyle()` computes a `justifyContent` value from `alignment.vertical`, but the
container `Box` is `flexDirection="column"` with **no height**, so the main axis collapses to
the content and `justifyContent` has nothing to distribute.

**Evidence** — first rendered line is byte-identical for all three settings:

```
vertical=top    -> "╭────╮╭────╮"
vertical=middle -> "╭────╮╭────╮"
vertical=bottom -> "╭────╮╭────╮"
```

**Fix** Accept an explicit `height` prop (or drop `alignment.vertical` from the public API).
Currently it is documented behaviour that does nothing.

---

### N2. `CardGrid` silently discards cards beyond `rows × cols`

`src/components/CardGrid/index.tsx:46-57`

The `grid` memo slices exactly `rows × cols` cards and pads short rows, but never reports
overflow. Passing 4 cards into a 1×2 grid renders 2 and drops 2 with no warning — an easy
source of "my card vanished" bugs, especially since `cards` is `Array<GridCard | undefined>`
and callers often build it from a filtered list.

**Fix** Warn in development when `cards.length > rows * cols`.

---

### N3. `StructuredLayout` reserves two symbol rows but may render only one

`src/components/CustomCard/index.tsx:170-181`

`hasSymbols` is `symbols.length > 0`, and the height budget adds **1 line for the top row and
1 for the bottom row** whenever it is true. But `CornerSymbols` returns `null` when neither
corner for its position is populated. A card with only a `top-left` symbol therefore reserves
2 lines, renders 1, and loses a content line to a row that draws nothing.

**Evidence** — `size="medium"` (innerHeight 9), description long enough to saturate:

```
no symbols     -> 9 content rows   (9 used)
top-left only  -> 8 content rows   (1 symbol + 7 description, last row BLANK)
both corners   -> 9 content rows   (1 symbol + 7 description + 1 symbol)
```

**Fix** Compute `hasTopSymbols`/`hasBottomSymbols` independently and reserve each only when
that row will actually render.

---

### N4. `BaseCardProps.effects` is accepted everywhere and read by nothing

`src/types/index.ts:29`, `src/components/TarotCard/index.tsx:247`

`effects?: CardEffect[]` is on the base props of every card type. `TarotCard` dutifully
forwards it to `CustomCard`. No component ever reads it. A grep across all non-test,
non-storybook source for a *read* of `effects` returns only the type declaration, the
forwarding line, and a doc comment.

This is the rendering-side twin of `F3` (the `EffectManager` is never invoked by the reducer):
the effects system is disconnected at **both** ends.

**Fix** Either render an effect indicator (badge/border tint) or remove `effects` from
`BaseCardProps` and keep it purely in game state. Decide before adding more surface.

---

### N5. `id` is required on every card and ignored by both renderers

`src/components/Card/index.tsx:34-44`, `src/components/CustomCard/index.tsx:265-284`

`BaseCardProps.id` is required, and neither `Card` nor `CustomCard` destructures or uses it.
Consumers must invent an id to render a single decorative card. It is needed for zone
bookkeeping and React keys in `CardStack`/`CardGrid`, but not by the leaf components.

**Fix** Keep `id` required on `TCard` (zones need it) but make it optional on the component
props, or document why it is required. Low effort, removes a papercut.

---

### N6. `TarotCard` passes both `size` and explicit dimensions

`src/components/TarotCard/index.tsx:231-233`

```tsx
size="large"     // preset is [24, 15]
width={20}       // overrides it
height={13}      // overrides it
```

`size` is inert because `CustomCard` prefers `width ?? presetW`. A reader reasonably concludes
tarot cards are 24×15; they are 20×13. Also the only hardcoded card dimensions left outside
`CARD_DIMENSIONS`/`SIZE_PRESETS` (see R4).

**Fix** Drop `size` and add a `tarot: [20, 13]` entry to the dimension source of truth.

---

### N7. `buildMinorProps` has a three-branch conditional with one outcome

`src/components/TarotCard/index.tsx:157-171`

```tsx
if (isCourt)      title = `${props.value} of ${suitLabel}`
else if (isPip)   title = props.value === 'Ace' ? `Ace of ${suitLabel}` : `${props.value} of ${suitLabel}`
else              title = `${props.value} of ${suitLabel}`
```

All three branches evaluate to the same string (`props.value` *is* `'Ace'` in the Ace case).
`isPip` exists only to feed this dead branch.

**Fix** `const title = \`${props.value} of ${suitLabel}\`` and delete `isPip`.

---

### N8. `VALUE_OFFSET.JOKER` is unreachable and points at an unassigned code point

`src/components/UnicodeCard/constants.ts:36,50-58`

`getCardUnicode` returns early for `value === 'JOKER'`, so `VALUE_OFFSET.JOKER = 0xf` is dead.
Were it ever reached, `SUIT_BASE.spades + 0xf` = `U+1F0AF`, which is **unassigned** in the
Unicode Playing Cards block (the joker code points are `U+1F0BF`, `U+1F0CF`, `U+1F0DF`).

Verified separately: all 10 non-joker glyph mappings are **correct**, including the
`Q = 0xD`/`K = 0xE` skip over the Knight card at `0xC`. Only the dead joker entry is wrong.

**Fix** Remove the `JOKER` key from `VALUE_OFFSET` and narrow its type to exclude `'JOKER'`.

---

### N9. `Card`'s out-of-provider fallback depends on the bug `B3` proposes to fix

`src/components/Card/index.tsx:46-47`, `src/components/CustomCard/index.tsx:286-287`

Both components do `useContext(DeckContext)?.backArtwork ?? defaultBackArtwork` and document
"Can be used inside or outside a DeckProvider". The optional chain is currently dead code,
because `DeckContext` has a fully-populated default (`src/contexts/DeckContext.tsx:55`).

**This is a trap for `B3`.** Changing the default to `undefined` so `useDeck`/`useHand` throw
correctly is the right fix — but it *only* stays safe because these two components already use
`?.`. Any regression test for `B3` must also assert that a bare `<Card>` and `<CustomCard>`
still render outside a provider.

**Evidence** `<Card faceUp={false}>` with no provider renders the `?` back today.

**Fix** No code change needed — but `AC-03` must land with a test locking this in.

---

### N10. `CustomCard`'s inner-dimension comment is wrong

`src/components/CustomCard/index.tsx:293`

```tsx
// Border takes 2 chars on each side
const innerWidth = Math.max(1, cardWidth - 2)
```

A border takes 1 column per side, 2 total. The arithmetic is right; the comment says
something different and will mislead the next person adjusting the layout budget.

---

## Part 2 — Refactor opportunities

### R1. `center`/`left`/`right` silently reserve 2 columns (root cause of `B19`)

`src/utils/text.ts:20,35,45`

All three helpers compute padding from `width - 2`. A border assumption is baked into a
generic text utility, so `center(text, w)` actually centres within `w - 2`.

**Evidence**

```
center("AB", 10).length = 8   (expected 10)
left(  "AB", 10).length = 8
right( "AB", 10).length = 8
```

This is the highest-leverage refactor in the codebase: it is the root cause of `B19` and every
symptom in `R2`. Fix the primitives, then correct each caller's arithmetic.

---

### R2. `layout.ts` compounds the `-2` two more times

`src/utils/layout.ts:25-36,100`, `src/utils/cardArtRenderer.ts:120-122`

The pipeline subtracts the same 2 columns at three levels:

| Call | Width in | Width out | Expected |
| --- | --- | --- | --- |
| `formatLine("AB", 20)` | 20 | 18 | 20 |
| `formatLine("AB", 20, {frame})` | 20 | 18 | 20 |
| `createBodySection(["AB"], 20, 2)` | 20 | **14** | 20 |
| `createFramedSection(["AB"], 20, …)` | 20 | 18 (all rows) | 20 |

Three compounding problems:

- `formatLine` computes `contentWidth = width - frameWidth - paddingWidth` (line 25) and then
  hands it to `center`, which subtracts 2 again.
- `createFramedSection` calls `formatLine` and then re-centres the result (line 100).
- `renderCardArt` re-pads every finished line a third time
  (`cardArtRenderer.ts:120-122`).
- `createBodySection`'s `padding` is applied as a *width reduction* (`width - padding * 2`)
  and never as leading spaces — so `padding` does not mean padding.

Also `layout.ts` exports two incompatible shapes both named `frame`: `{left, right}` for
`formatLine` and `{top, middle, bottom}` for `createFramedSection`.

**Fix** After `R1`, make every function pad to exactly the width requested and add unit tests
(there are currently none for `text.ts`, `layout.ts`, or `cardArtRenderer.ts` — the three
modules with the most subtle arithmetic).

---

### R3. Two parallel, unequal card-art architectures

`src/constants/cardArt.ts:254-264`, `src/constants/robotTheme.ts`, `src/utils/cardArtRenderer.ts`, `src/types/cardArt.ts`, `src/components/Card/utils.ts:282-300,320-324`

Five of six themes are flat `string[]` tables in `THEME_MAP`. The sixth, `robot`, is a
section-based `CardArtDefinition` rendered by a completely separate pipeline
(`cardArtRenderer.ts` → `layout.ts`). `THEME_MAP.robot` is registered as `{}` and
`createSpecialArt` special-cases it with an early return.

So `types/cardArt.ts`, `utils/cardArtRenderer.ts`, and most of `utils/layout.ts` — roughly 200
lines — exist to render **one theme**. It happens to produce correct 15-wide output today
(verified), but only because three rounding errors cancel.

**Fix** Pick one. Either migrate the five string themes to `CardArtDefinition` and delete the
`THEME_MAP` path, or render robot as a string table and delete `cardArtRenderer.ts` +
`types/cardArt.ts` + the unused half of `layout.ts`. The second is far less work and loses
nothing currently used.

---

### R4. Card dimensions live in four places

- `src/constants/card.ts:6-25` — `CARD_DIMENSIONS` (`ascii`, `simple`, `minimal` only)
- `src/components/MiniCard/index.tsx:31-32` — hardcoded `5`/`4`
- `src/components/CustomCard/index.tsx:14-20` — `SIZE_PRESETS`
- `src/components/CardGrid/index.tsx:104-112` — hardcoded `mini: 5×4`, `micro: 4×4`

`CARD_DIMENSIONS` has no `mini`/`micro` entry, which is why `CardGrid` hardcodes them. (PR #9's
note that it "uses `CARD_DIMENSIONS` instead of hardcoded sizes" only applied to the three
variants that exist in the map.) A `mini` card is 5×4 in two files and could drift silently.

**Fix** One `CARD_DIMENSIONS` covering `micro | mini | minimal | simple | ascii | tarot`, with
`SIZE_PRESETS` either merged in or derived from it.

---

### R5. `createAsciiPipLayout` and `createSimplePipLayout` are the same table twice

`src/components/Card/utils.ts:114-195` and `199-280` — **~170 lines**

Two 80-line literal tables that differ only in row indices: ascii uses rows `2,3,4,5,6`, simple
uses `0,1,2,3,4`. Column values are identical (`left`/`center`/`right` from the destructured
config). Adding a variant means transcribing a third table by hand.

**Fix** One table in normalised row space plus a per-variant row map. ~170 lines → ~45.

---

### R6. `getThemeReplacements` builds all five themes to return one

`src/components/Card/utils.ts:23-60`

The function allocates an object literal containing the replacement map for **every** theme —
performing ~14 `Record` lookups with `?? ''` fallbacks — then indexes a single key and discards
the rest. This runs once per special card per render.

The five feature tables (`GEOMETRIC_SYMBOLS`, `ANIMAL_FEATURES`, `PIXEL_FEATURES`,
`MEDIEVAL_FEATURES`, `ROBOT_FEATURES`) already share the shape
`Record<TSuit, Record<string, string>>`.

**Fix** Hoist to a module-level `THEME_FEATURES: Record<AsciiTheme, Record<TSuit, Record<string, string>>>`.
`getThemeReplacements` collapses to `THEME_FEATURES[theme][suit] ?? {}`. Removes ~35 lines and
all per-render allocation.

---

### R7. `applyReplacements` is duplicated verbatim

`src/components/Card/utils.ts:65-76` (`applyThemeReplacements`) and
`src/utils/cardArtRenderer.ts:10-21` (`applyReplacements`)

Identical implementations. Both also build a `RegExp` per key per line per render:

```ts
result = result.replaceAll(new RegExp(`{${key}}`, 'g'), value)
```

`String.prototype.replaceAll` already replaces every occurrence when given a string, so the
regex is redundant — and `{`/`}` are unescaped, which would break on any key containing regex
metacharacters.

**Fix** One shared `applyReplacements` in `utils/text.ts` using `replaceAll('{' + key + '}', value)`.

---

### R8. `ROBOT_THEME`'s `replacements` blocks are identity no-ops

`src/constants/robotTheme.ts:88-92,113-119,139-145,165-171`

Every entry maps a key to its own placeholder:

```ts
replacements: { suit: '{suit}', data: '{data}', core: '{core}' }
```

`renderCardArt` spreads `{...definition.replacements, ...dynamicReplacements}`
(`cardArtRenderer.ts:112-115`) and the dynamic map always supplies all of these keys, so the
static block is fully overwritten every time. Four blocks, ~22 lines of pure noise that read
like meaningful configuration.

**Fix** Delete all four; make `CardArtDefinition.replacements` optional.

---

### R9. The card-type dispatch triad is copy-pasted three times

`src/components/CardStack/index.tsx:78-104`, `src/components/CardGrid/index.tsx:148-170`,
`src/components/Deck/index.tsx:33-50`

Each independently implements "given a `TCard` and a variant, pick `MiniCard` vs `Card` vs
`CustomCard`" — and they disagree:

| Component | standard | custom | tarot |
| --- | --- | --- | --- |
| `CardStack` | yes | yes | no |
| `CardGrid` | yes | **no** (`GridCard` is standard-only) | no |
| `Deck` | yes | **no** (returns `null`, `B15`) | no |

**Fix** Extract one `<AnyCard card={} variant={} faceUp={} />`. This single component resolves
`B15` (Deck drops custom cards), `F18` (CardGrid custom support), and is the natural insertion
point for `B18`/`F2` tarot support. Highest-value structural refactor in the repo.

---

### R10. Suit → colour logic duplicated four times

`src/components/Card/index.tsx:89`, `src/components/MiniCard/index.tsx:24`,
`src/components/UnicodeCard/index.tsx:52`, `src/components/UnicodeCard/constants.ts:54`

```ts
const color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'white'
```

Four copies of the same rule, with `'white'` hardcoded as the black-suit colour. This is also
the exact seam that `F14` (theming / monochrome mode) needs.

**Fix** `getSuitColor(suit, theme?)` in `constants/card.ts`.

---

### R11. Minimal-card label centring implemented twice

`src/components/Card/index.tsx:8-26` (`createMinimalBackContent`) and
`src/components/Card/utils.ts:379-392` (the `variant === 'minimal'` branch)

Same algorithm — slice label to `innerWidth`, `floor`/remainder split, place on the vertically
centred row, fill the rest — written twice, once with `spaces()` and once with `' '.repeat()`.

**Evidence** `createCardContent('A','♥','minimal',{width:6,height:5,padding:0})` returns
`"    \n A♥ \n    "`; `createMinimalBackContent` reproduces this shape independently.

**Fix** One `centerLabelBlock(label, innerWidth, innerHeight)` in `utils/text.ts`, used by both.

---

### R12. `createCardContent` has a dead default and float-based centring

`src/components/Card/utils.ts:370-375,404,411`

```ts
const { width, height } = config || { width: 11, height: 9, pip: {...}, padding: 0 }
```

`config` is a required parameter, so the fallback is unreachable — and it duplicates the
`simple` entry of `CARD_DIMENSIONS`, a third copy of those numbers (see `R4`).

Two lines of unguarded float arithmetic follow:

```ts
while (lines.length < height / 2 - art.length / 2 - 2)   // no Math.floor
while (lines.length < height - 2 - 1)                    // magic expression
```

These work for the current 13/9 heights but will misbehave on any even/odd change.

**Fix** Delete the dead fallback; `Math.floor` the centring; name `height - 3` as
`contentRows`.

**Also** `xo` already flags this function and `createSpecialArt` for `max-params` (5 each) and
`deckReducer` for complexity 24 — the three existing lint warnings are all pointing here.

---

### R13. `types/index.ts` is a 309-line grab bag that also exports runtime code

`src/types/index.ts` — 30 exports

Mixes card shapes, context types, action unions, event/effect interfaces, and **three runtime
functions** (`isStandardCard:146`, `isCustomCard:158`, `generateCardId:307`). A module named
`types` exporting values means consumers cannot treat it as type-only, and `import type` from
the barrel silently drops the guards.

**Fix** Split into `types/cards.ts`, `types/state.ts`, `types/events.ts`; move the guards and
`generateCardId` to `utils/cards.ts`. Re-export everything from `types/index.ts` so the public
API is unchanged.

---

### R14. `TarotMajorProps` and `TarotMinorProps` duplicate six fields

`src/components/TarotCard/index.tsx:70-108`

`reversed`, `asciiArt`, `borderColor`, `textColor`, `artColor`, `back` are declared identically
in both members of the union, with identical doc comments.

**Fix** `type TarotCommon = BaseCardProps & { reversed?: boolean; … }`, then
`TarotCommon & {arcana:'major'; majorIndex}` | `TarotCommon & {arcana:'minor'; suit; value}`.

---

## Part 3 — Atomic change ledger

One row per commit. `Dep` lists changes that must land first. `Verify` is the specific check
that proves the change worked — not just "tests pass".

### Phase 0 — Make verification trustworthy

Nothing else can be validated until CI can fail. Do these first, in order.

| ID | Change | Files | Verify | Dep |
| --- | --- | --- | --- | --- |
| **AC-01** | Pin colour level for tests so snapshots are environment-independent (`B6`) | `package.json` (ava `environmentVariables`) | `npx ava` passes with stdout piped to a file | — |
| **AC-02** | CI runs `yarn test`, not `ava --update-snapshots` (`B5`) | `.github/workflows/ci.yml:19-22` | Deliberately alter one snapshot; CI must go red | AC-01 |
| **AC-03** | Add `packageManager` field, pin Yarn in CI (`B27`) | `package.json`, `.github/workflows/ci.yml` | `yarn install --frozen-lockfile` succeeds twice with no lockfile diff | — |
| **AC-04** | Exclude tests + storybook from the published build (`B7`) | new `tsconfig.build.json`, `package.json` `build` script, delete `.npmignore` (`B28`) | `npm pack --dry-run` shows 0 files matching `*test*` and no `dist/storybook` | — |

### Phase 1 — Correctness (no API change)

| ID | Change | Files | Verify | Dep |
| --- | --- | --- | --- | --- |
| **AC-05** | Add `default: return state` to `gameReducer` (`B1`) | `src/contexts/GameContext.tsx:23-47` | Dispatch `{type:'NOPE'}`; `phase`/`turn` unchanged | AC-02 |
| **AC-06** | Guard `NEXT_TURN` against an empty roster (`B23`) | `src/contexts/GameContext.tsx:31-40` | `<GameProvider>` with no players: `turn` stays 0 | AC-05 |
| **AC-07** | Make `deckReducer` pure; queue events and flush from an effect (`B2`) | `src/contexts/DeckContext.tsx:64,79,93,130,147,167,187` + `DeckProvider` | One `DRAW` under `<StrictMode>` fires `CARDS_DRAWN` exactly once | AC-02 |
| **AC-08** | Preserve `players` across `RESET` (`B24`) | `src/contexts/DeckContext.tsx:91-99` | Register 2 players, `RESET`, roster still length 2 | AC-07 |
| **AC-09** | Validate/clamp `cutDeck`'s index (`B17`) | `src/systems/Zones.ts` | `cutDeck(len5,-2)`, `(…,99)`, `(…,2.5)` all behave per documented contract | — |
| **AC-10** | Iterate a listener copy and isolate throwing listeners (`B21`) | `src/systems/Events.ts` | Self-removing listener does not skip the next; one thrower does not stop the rest | — |
| **AC-11** | Fix `createPairedDeck` pair adjacency + suit matching (`B8`) | `src/components/Deck/utils.ts`, `src/components/Deck/utils.test.ts` | Adjacent-pair count well below 26; both cards of a pair share a suit | AC-02 |

### Phase 2 — Layout primitives

`AC-12` is a prerequisite for the rendering fixes. It changes the meaning of three helpers, so
it lands alone with tests before anything depends on it.

| ID | Change | Files | Verify | Dep |
| --- | --- | --- | --- | --- |
| **AC-12** | `center`/`left`/`right` pad to exactly `width`; move border accounting to callers (`R1`, `B19`) | `src/utils/text.ts:20,35,45`; callers in `src/components/Card/utils.ts` | New `text.test.ts`: `center("AB",10).length === 10` | AC-02 |
| **AC-13** | Remove the double/triple centring in the layout pipeline (`R2`) | `src/utils/layout.ts:25-36,100`, `src/utils/cardArtRenderer.ts:120-122` | New `layout.test.ts`: `formatLine`/`createFramedSection`/`createBodySection` all return exactly `width` | AC-12 |
| **AC-14** | Route all width math through `string-width` (`B20`) | `src/utils/text.ts`, `src/components/CustomCard/index.tsx:50-53` (`fit`), `src/components/MiniCard/index.tsx` | A CJK/emoji `title` produces unragged borders | AC-12 |
| **AC-15** | Extract `centerLabelBlock`; delete the duplicate (`R11`) | `src/utils/text.ts`, `src/components/Card/index.tsx:8-26`, `src/components/Card/utils.ts:379-392` | Minimal-card snapshots unchanged | AC-12 |

### Phase 3 — Rendering fixes

| ID | Change | Files | Verify | Dep |
| --- | --- | --- | --- | --- |
| **AC-16** | Add joker art for all 6 themes + `simple` (`B4`) | `src/constants/cardArt.ts`, `src/constants/robotTheme.ts` | Render matrix reports `emptyArt = 0` (currently 28) | AC-02 |
| **AC-17** | `createStandardDeck({jokers})` (`F7`) | `src/components/Deck/utils.ts`, `src/components/Deck/utils.test.ts` | `createStandardDeck({jokers:2}).length === 54` | AC-16 |
| **AC-18** | Bottom-anchor the `CustomCard` footer (`B12`) | `src/components/CustomCard/index.tsx:229-240` | Short-content card renders footer on the last inner row | AC-13 |
| **AC-19** | Overlay corner symbols instead of giving them their own rows (`B12`) | `src/components/CustomCard/index.tsx:116-136,194-199,241-246` | Symbols share the header/footer rows; content rows increase by 2 | AC-18 |
| **AC-20** | Reserve symbol rows per-position (`N3`) | `src/components/CustomCard/index.tsx:170-181` | `top-left`-only card yields 9 content rows, not 8 | AC-19 |
| **AC-21** | Hard-break long words; honour `\n` in `description` (`B10`) | `src/components/CustomCard/index.tsx:25-47` (`wrapText`) | `"Supercalifragilisticexpialidocious"` wraps with no loss; `'a\nb'` yields 2 lines | AC-14 |
| **AC-22** | Warn in dev when `CustomCard` regions are dropped (`B9`) | `src/components/CustomCard/index.tsx:175-181` | `micro` card with all regions logs one dev warning | AC-20 |
| **AC-23** | Fix `CardGrid` double spacing (`B13`) | `src/components/CardGrid/index.tsx:145,147` | `spacing={{row:1,col:1}}` → exactly 1 blank row / 1 space | AC-02 |
| **AC-24** | Fix `CardStack` vertical overlap sign + round scaled margins (`B14`) | `src/components/CardStack/index.tsx:36-45` | Vertical minimal stack overlaps; mini stack gaps are uniform | AC-02 |
| **AC-25** | Fix `MiniCard` value alignment, joker, and card back (`B16`) | `src/components/MiniCard/index.tsx:31-52` | `'10'` and `'A'` both centred; `JOKER` not truncated; back honours context | AC-14 |
| **AC-26** | Give `CardGrid` a height or drop `alignment.vertical` (`N1`) | `src/components/CardGrid/index.tsx:60-100,140` | `vertical=top` and `bottom` produce different output — or the prop is gone | AC-23 |
| **AC-27** | Warn on `CardGrid` card overflow (`N2`) | `src/components/CardGrid/index.tsx:46-57` | 4 cards into a 1×2 grid logs one dev warning | AC-26 |

### Phase 4 — Structural refactors

| ID | Change | Files | Verify | Dep |
| --- | --- | --- | --- | --- |
| **AC-28** | Extract `<AnyCard>`; adopt in `CardStack`, `CardGrid`, `Deck` (`R9`, fixes `B15`, `F18`) | new `src/components/AnyCard/index.tsx`; `CardStack:78-104`, `CardGrid:148-170`, `Deck:33-50` | Custom-card deck renders in all three; snapshots unchanged for standard cards | AC-24, AC-23 |
| **AC-29** | Add `TarotCardProps` to `TCard`; support it in `<AnyCard>` (`B18`) | `src/types/index.ts:141`, `src/components/AnyCard/index.tsx` | `<DeckProvider initialCards={createTarotDeck()}>` compiles with no cast | AC-28 |
| **AC-30** | Unify card dimensions into one source (`R4`, `N6`) | `src/constants/card.ts:6-25`; `MiniCard:31-32`, `CardGrid:104-112`, `CustomCard:14-20`, `TarotCard:231-233` | No card dimension literal outside `constants/card.ts` | AC-25, AC-28 |
| **AC-31** | Merge the two pip-layout tables (`R5`) | `src/components/Card/utils.ts:114-280` | Pip snapshots byte-identical; file ~125 lines shorter | AC-12 |
| **AC-32** | Hoist `THEME_FEATURES`; collapse `getThemeReplacements` (`R6`) | `src/components/Card/utils.ts:23-60`, `src/constants/cardArt.ts`, `src/constants/robotTheme.ts:24-57` | All ascii-theme snapshots unchanged | AC-31 |
| **AC-33** | Share one `applyReplacements`, drop the per-key regex (`R7`) | new helper in `src/utils/text.ts`; `Card/utils.ts:65-76`, `cardArtRenderer.ts:10-21` | Robot + themed snapshots unchanged | AC-32 |
| **AC-34** | Delete the identity `replacements` blocks (`R8`) | `src/constants/robotTheme.ts:88-92,113-119,139-145,165-171`, `src/types/cardArt.ts:18` | Robot snapshots unchanged | AC-33 |
| **AC-35** | Collapse to a single art architecture (`R3`) | `src/utils/cardArtRenderer.ts`, `src/types/cardArt.ts`, `src/utils/layout.ts`, `src/constants/cardArt.ts:254-264`, `Card/utils.ts:282-300,320-324` | Robot snapshots unchanged; ~200 lines removed or five themes migrated | AC-34, AC-13 |
| **AC-36** | Clean up `createCardContent` (`R12`) | `src/components/Card/utils.ts:370-375,404,411` | Snapshots unchanged; `xo` `max-params` warnings resolved | AC-31 |
| **AC-37** | Centralise `getSuitColor` (`R10`) | `src/constants/card.ts`; `Card:89`, `MiniCard:24`, `UnicodeCard:52`, `UnicodeCard/constants.ts:54` | Snapshots unchanged; one definition remains | AC-30 |
| **AC-38** | Split `types/index.ts`, move runtime guards out (`R13`) | `src/types/index.ts` → `types/cards.ts`, `types/state.ts`, `types/events.ts`, `utils/cards.ts` | Public API surface identical (`Object.keys` of built entry unchanged) | AC-29 |
| **AC-39** | Deduplicate the tarot props union (`R14`) | `src/components/TarotCard/index.tsx:70-108` | Tarot snapshots unchanged | AC-38 |
| **AC-40** | Simplify `buildMinorProps` title logic (`N7`) | `src/components/TarotCard/index.tsx:157-171` | Tarot snapshots unchanged | AC-39 |

### Phase 5 — API hygiene

| ID | Change | Files | Verify | Dep |
| --- | --- | --- | --- | --- |
| **AC-41** | `DeckContext` default → `undefined` so hooks throw (`B3`) | `src/contexts/DeckContext.tsx:55`, `src/hooks/useDeck.ts`, `src/hooks/useHand.ts` | `useDeck()` outside a provider throws **and** bare `<Card>`/`<CustomCard>` still render (`N9`) | AC-07 |
| **AC-42** | Resolve `effects` on card props — render it or remove it (`N4`) | `src/types/index.ts:29`, `src/components/TarotCard/index.tsx:247` | No prop is accepted-and-ignored | AC-38 |
| **AC-43** | Remove or implement `CustomCard.onClick` (`B11`) | `src/types/index.ts:135`, `src/components/CustomCard/index.tsx` | No prop is accepted-and-ignored | AC-42 |
| **AC-44** | Narrow `theme` to the `ascii` variant, or honour it (`B25`) | `src/types/index.ts:38-45`, `src/components/Card/index.tsx:34-44` | `theme` with `variant="simple"` is a type error, or changes output | AC-37 |
| **AC-45** | Make `id` optional on leaf components (`N5`) | `src/types/index.ts:27-37`, `Card/index.tsx:34-44`, `CustomCard/index.tsx:265-284` | `<Card suit="hearts" value="A"/>` compiles | AC-38 |
| **AC-46** | Drop the dead `JOKER` unicode offset (`N8`) | `src/components/UnicodeCard/constants.ts:36` | `UnicodeCard` snapshots unchanged | — |
| **AC-47** | Fix the misleading inner-dimension comment (`N10`) | `src/components/CustomCard/index.tsx:293` | — | — |
| **AC-48** | `return` after `exit()` in storybook (`B26`) | `src/storybook/storybook.tsx:107-113` | No invalid view state after quitting | — |
| **AC-49** | Fix or remove `EnhancedSelectInput`'s `limit` (`B22`) | `src/storybook/utils/EnhancedSelectInput.tsx:82,141-142` | Items past `limit` reachable, or the prop is gone | — |

### Phase 6 — Regression tests (`F22`)

Each locks in a Phase 0–5 change. Worth its own commit so the ledger above stays reviewable.

| ID | Test | Target | Dep |
| --- | --- | --- | --- |
| **AC-50** | Event fires exactly once per dispatch under `StrictMode` | AC-07 | AC-07 |
| **AC-51** | Hooks throw off-provider; bare `<Card>`/`<CustomCard>` still render | AC-41, `N9` | AC-41 |
| **AC-52** | Unknown action leaves `GameContext` intact | AC-05 | AC-05 |
| **AC-53** | Render matrix asserts `emptyArt === 0` and `ragged === 0` | AC-16 | AC-16 |
| **AC-54** | `createPairedDeck` adjacency + suit-match assertions | AC-11 | AC-11 |
| **AC-55** | `npm pack` contains no test or storybook files | AC-04 | AC-04 |
| **AC-56** | Unit tests for `text.ts` / `layout.ts` / `cardArtRenderer.ts` | AC-12, AC-13 | AC-13 |

---

## Sequencing notes

- **Phase 0 is non-negotiable first.** With `ava --update-snapshots` in CI, every snapshot in
  Phases 2–4 would silently rewrite itself and the refactors would be unverifiable. `AC-01`
  and `AC-02` are the two cheapest, highest-value commits in this document.
- **`AC-12` is the fulcrum.** It changes the contract of three widely-used helpers. Land it
  alone, with tests, and expect snapshot churn. Everything in Phases 2–4 assumes it.
- **`AC-28` (`<AnyCard>`) unlocks three separate issues** (`B15`, `F18`, `B18`) and is the
  prerequisite for tarot-in-zones. Prioritise it over the cosmetic refactors.
- **`AC-41` needs `N9`'s guard rail.** Flipping the context default is correct but silently
  depends on the `?.` chains in `Card` and `CustomCard`. `AC-51` must land with it.
- **Phase 4 should be snapshot-neutral.** Every refactor there lists "snapshots unchanged" as
  its verification. If a snapshot moves during Phase 4, that is a bug in the refactor, not an
  expected update — which is exactly the signal `AC-02` restores.

## Effort estimate

| Phase | Changes | Rough size |
| --- | --- | --- |
| 0 — verification | 4 | small, unblocks everything |
| 1 — correctness | 7 | small, mostly localised |
| 2 — layout primitives | 4 | medium, snapshot churn expected |
| 3 — rendering | 12 | medium |
| 4 — structural | 13 | large; net **~400 lines removed** |
| 5 — API hygiene | 9 | small; some breaking (`AC-41`–`AC-45`) |
| 6 — regression tests | 7 | medium |

Breaking changes cluster in Phase 5 (`AC-41`, `AC-42`, `AC-43`, `AC-44`, `AC-45`) and
`AC-29`/`AC-38`. Batch them into a single `2.0.0` if you would rather not ship several majors.
