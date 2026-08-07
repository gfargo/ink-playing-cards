/**
 * The set of concrete card display variants that `selectCardVariant` can
 * resolve to. `'responsive'` (used by `AnyCard`/`CardGrid`) is deliberately
 * excluded here — it is the trigger for auto-selection, not an output of it.
 */
export type CardVariant = 'ascii' | 'simple' | 'minimal' | 'mini' | 'micro'

/**
 * Ordered widest-first table of minimum terminal column counts to card
 * variants. Thresholds are chosen so roughly 6-7 cards of the selected
 * variant fit on one row before the layout needs to degrade further:
 * - ascii   (width 15) needs >= 80 columns
 * - simple  (width 11) needs >= 48 columns
 * - minimal (width 6)  needs >= 28 columns
 * - mini    (width 5)  needs >= 16 columns
 * - micro   (width 4)  is the fallback for anything narrower
 */
export const VARIANT_BREAKPOINTS: ReadonlyArray<{
  readonly minColumns: number
  readonly variant: CardVariant
}> = [
  { minColumns: 80, variant: 'ascii' },
  { minColumns: 48, variant: 'simple' },
  { minColumns: 28, variant: 'minimal' },
  { minColumns: 16, variant: 'mini' },
]

/**
 * Maps a terminal column count to the widest card variant that still fits.
 * Falls back to `fallback` (default `'simple'`) when `columns` is
 * `undefined`, not a finite number, or non-positive.
 */
export function selectCardVariant(
  columns: number | undefined,
  fallback: CardVariant = 'simple'
): CardVariant {
  if (columns === undefined || !Number.isFinite(columns) || columns <= 0) {
    return fallback
  }

  for (const breakpoint of VARIANT_BREAKPOINTS) {
    if (columns >= breakpoint.minColumns) {
      return breakpoint.variant
    }
  }

  return 'micro'
}
