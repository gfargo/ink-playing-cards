import process from 'node:process'
import { Box, type BoxProps, Text } from 'ink'
import React, { useContext } from 'react'
import { EFFECT_INDICATOR_COLOR } from '../../constants/card.js'
import { DeckContext, defaultBackArtwork } from '../../contexts/DeckContext.js'
import {
  type CustomCardBack,
  type CustomCardProps,
  type CustomCardSize,
  type CustomCardSymbol,
} from '../../types/index.js'
import { displayWidth, spaces, truncate } from '../../utils/text.js'

/**
 * Size presets: [width, height]
 *
 * Region budget per size (inner content height, after the 1-cell border on
 * each side):
 *
 * | size   | width×height | innerHeight |
 * |--------|--------------|-------------|
 * | micro  | 5×3          | 1           |
 * | mini   | 8×5          | 3           |
 * | small  | 12×7         | 5           |
 * | medium | 18×11        | 9           |
 * | large  | 24×15        | 13          |
 *
 * When structured regions need more lines than `innerHeight` provides, they
 * are allocated via `REGION_PRIORITY` — see `allocateRegions` below.
 */
const SIZE_PRESETS: Record<CustomCardSize, [number, number]> = {
  micro: [5, 3],
  mini: [8, 5],
  small: [12, 7],
  medium: [18, 11],
  large: [24, 15],
}

/**
 * Region priority, highest first. When structured regions need more lines
 * than `innerHeight` provides, regions are allocated in this order and
 * whatever doesn't fit is dropped — textual identity (header/typeLine/footer)
 * outranks decorative regions (description body, art). This is a deliberate,
 * documented contract: keep it stable so card authors can predict what
 * survives at small sizes.
 *
 * Corner symbols are folded into the header/footer rows (see
 * `StructuredLayout`) and only need their own budgeted row — counted under
 * `header`/`footer` — when there is no header/footer content to merge into.
 */
const REGION_PRIORITY = [
  'header',
  'typeLine',
  'footer',
  'description',
  'art',
] as const

type RegionName = (typeof REGION_PRIORITY)[number]

type RegionDescriptor = {
  readonly present: boolean
  readonly lineCost: number
  /** Variable-length regions (art/description) are truncated to fit rather than dropped outright. */
  readonly variable?: boolean
}

type RegionAllocation = {
  readonly included: ReadonlySet<RegionName>
  readonly dropped: readonly RegionName[]
  readonly artLines: number
  readonly descriptionLines: number
}

/**
 * Allocates `innerHeight` lines across regions in `REGION_PRIORITY` order.
 * Fixed-cost regions (header/typeLine/footer) are all-or-nothing.
 * Variable-cost regions (art/description) are truncated to whatever remains
 * and are only reported as "dropped" if truncated all the way to zero lines.
 */
function allocateRegions(
  regions: Readonly<Record<RegionName, RegionDescriptor>>,
  innerHeight: number
): RegionAllocation {
  const included = new Set<RegionName>()
  const dropped: RegionName[] = []
  let artLines = 0
  let descriptionLines = 0
  let remaining = innerHeight

  for (const name of REGION_PRIORITY) {
    const region = regions[name]
    if (!region.present) continue

    if (region.variable) {
      const allotted = Math.min(region.lineCost, remaining)
      if (allotted > 0) {
        included.add(name)
        remaining -= allotted
        if (name === 'art') artLines = allotted
        if (name === 'description') descriptionLines = allotted
      } else {
        dropped.push(name)
      }

      continue
    }

    if (region.lineCost <= remaining) {
      included.add(name)
      remaining -= region.lineCost
    } else {
      dropped.push(name)
    }
  }

  return { included, dropped, artLines, descriptionLines }
}

const warnedSignatures = new Set<string>()

/**
 * Warns once (in development) per distinct card+size+dropped-region
 * combination, so re-renders don't spam the console.
 */
function warnDroppedRegions(
  cardLabel: string,
  size: CustomCardSize,
  innerHeight: number,
  dropped: readonly RegionName[]
): void {
  if (process.env['NODE_ENV'] === 'production' || dropped.length === 0) return

  const signature = `${cardLabel}|${size}|${dropped.join(',')}`
  if (warnedSignatures.has(signature)) return
  warnedSignatures.add(signature)

  console.warn(
    `[CustomCard] "${cardLabel}" (size="${size}", innerHeight=${innerHeight}) doesn't fit all content — dropped region(s): ${dropped.join(', ')}.`
  )
}

/**
 * Wraps text to fit within a given width, breaking on word boundaries.
 * Respects embedded newlines as hard line breaks, and hard-breaks any
 * single word longer than `maxWidth` so no content is silently dropped.
 */
function wrapText(text: string, maxWidth: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(' ')
    let current = ''
    for (const word of words) {
      let remaining = word
      while (displayWidth(remaining) > maxWidth) {
        if (current.length > 0) {
          lines.push(current)
          current = ''
        }

        // Truncate() can return '' when maxWidth is narrower than the next
        // code point's own width (e.g. a 2-column glyph in a 1-column
        // budget) — force-consume that code point so remaining always
        // shrinks and the loop can't spin forever.
        let chunk = truncate(remaining, maxWidth)
        if (chunk.length === 0) {
          chunk = [...remaining][0] ?? ''
        }

        if (chunk.length === 0) break
        lines.push(chunk)
        remaining = remaining.slice(chunk.length)
      }

      if (current.length === 0) {
        current = remaining
      } else if (
        displayWidth(current) + 1 + displayWidth(remaining) <=
        maxWidth
      ) {
        current += ' ' + remaining
      } else {
        lines.push(current)
        current = remaining
      }
    }

    lines.push(current)
  }

  return lines
}

/**
 * Pads or truncates a string to exactly `len` display columns.
 */
function fit(str: string, len: number): string {
  if (len <= 0) return ''
  const width = displayWidth(str)
  if (width >= len) return truncate(str, len)
  return str + spaces(len - width)
}

/**
 * Renders the card back face.
 */
function CardBackFace({
  cardWidth,
  cardHeight,
  back,
  fallbackBack,
  borderColor,
  selected,
  rounded,
}: {
  readonly cardWidth: number
  readonly cardHeight: number
  readonly back?: CustomCardBack
  readonly fallbackBack: string
  readonly borderColor: string
  readonly selected: boolean
  readonly rounded: boolean
}) {
  const style: BoxProps = {
    borderStyle: selected ? 'double' : rounded ? 'round' : 'single',
    borderColor: selected ? 'yellow' : (back?.color ?? borderColor),
    width: cardWidth,
    height: cardHeight,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }

  if (back?.art) {
    const lines = back.art.split('\n')
    return (
      <Box {...style}>
        {lines.map((line, i) => (
          <Text key={i} color={back.color ?? 'gray'}>
            {line}
          </Text>
        ))}
      </Box>
    )
  }

  const symbol = back?.symbol ?? fallbackBack
  const label = back?.label
  return (
    <Box {...style}>
      {label ? (
        <Text dimColor color={back?.color ?? 'gray'}>
          {label}
        </Text>
      ) : null}
      <Text color={back?.color ?? 'gray'}>{symbol}</Text>
    </Box>
  )
}

/**
 * Renders the structured card layout with header, art, typeLine, body, footer regions.
 *
 * Corner symbols (top-left/top-right/bottom-left/bottom-right) are folded into
 * the header and footer rows rather than rendered on their own dedicated lines.
 * The body region uses flexGrow={1} so the footer is always pushed to the bottom
 * of the fixed-height card, eliminating blank rows below it.
 */
function StructuredLayout({
  cardLabel,
  size,
  title,
  cost,
  asciiArt,
  typeLine,
  description,
  footerLeft,
  footerRight,
  symbols,
  innerWidth,
  innerHeight,
  textColor,
  artColor,
}: {
  readonly cardLabel: string
  readonly size: CustomCardSize
  readonly title?: string
  readonly cost?: string
  readonly asciiArt?: string
  readonly typeLine?: string
  readonly description?: string
  readonly footerLeft?: string
  readonly footerRight?: string
  readonly symbols: CustomCardSymbol[]
  readonly innerWidth: number
  readonly innerHeight: number
  readonly textColor: string
  readonly artColor: string
}) {
  const hasHeader = Boolean(title ?? cost)
  const hasFooter = Boolean(footerLeft ?? footerRight)
  const hasTypeLine = Boolean(typeLine)

  // Corner symbols to overlay on header/footer rows
  const topLeft = symbols.find((s) => s.position === 'top-left')
  const topRight = symbols.find((s) => s.position === 'top-right')
  const bottomLeft = symbols.find((s) => s.position === 'bottom-left')
  const bottomRight = symbols.find((s) => s.position === 'bottom-right')

  const hasTopSymbols = Boolean(topLeft ?? topRight)
  const hasBottomSymbols = Boolean(bottomLeft ?? bottomRight)

  // Symbols are folded into header/footer rows for free — they only need
  // their own row when there is no header/footer to merge into.
  const symbolOnlyTopRow = hasTopSymbols && !hasHeader
  const symbolOnlyBottomRow = hasBottomSymbols && !hasFooter

  const artLines = asciiArt ? asciiArt.split('\n') : []
  const descLines = description ? wrapText(description, innerWidth) : []

  const {
    included,
    dropped,
    artLines: artBudget,
    descriptionLines: descBudget,
  } = allocateRegions(
    {
      header: { present: hasHeader || symbolOnlyTopRow, lineCost: 1 },
      typeLine: { present: hasTypeLine, lineCost: 1 },
      footer: { present: hasFooter || symbolOnlyBottomRow, lineCost: 1 },
      description: {
        present: descLines.length > 0,
        lineCost: descLines.length,
        variable: true,
      },
      art: {
        present: artLines.length > 0,
        lineCost: artLines.length,
        variable: true,
      },
    },
    innerHeight
  )

  warnDroppedRegions(cardLabel, size, innerHeight, dropped)

  const showHeader = included.has('header')
  const showTypeLine = included.has('typeLine')
  const showFooter = included.has('footer')

  // Build the header row, merging corner symbols if present.
  // Layout: [topLeft?][title…][cost?][topRight?]
  // The title is fitted into the remaining horizontal space.
  function renderHeaderRow() {
    if (!showHeader) return null

    if (!hasHeader && hasTopSymbols) {
      // Symbol-only fallback: no title/cost, just the present corner chars.
      // Absent corners render nothing (not a literal space) so the row stays clean.
      return (
        <Box width={innerWidth} justifyContent="space-between">
          {topLeft ? (
            <Text color={topLeft.color ?? textColor}>{topLeft.char}</Text>
          ) : null}
          {topRight ? (
            <Text color={topRight.color ?? textColor}>{topRight.char}</Text>
          ) : null}
        </Box>
      )
    }

    // Width of corner symbols: counted as code points, not UTF-16 units, so
    // surrogate-pair glyphs like 🜂 (U+1F702) measure as 1 column correctly.
    const topLeftW = topLeft ? displayWidth(topLeft.char) : 0
    const topRightW = topRight ? displayWidth(topRight.char) : 0

    // Width reserved on the right: cost + separator (if any) + topRight symbol (if any)
    const rightReserved =
      (cost ? displayWidth(cost) + 1 : 0) + (topRight ? topRightW : 0)
    // Width reserved on the left: topLeft symbol (if any)
    const leftReserved = topLeft ? topLeftW : 0
    const titleWidth = Math.max(0, innerWidth - leftReserved - rightReserved)

    return (
      <Box width={innerWidth} justifyContent="space-between">
        <Box>
          {topLeft ? (
            <Text color={topLeft.color ?? textColor}>{topLeft.char}</Text>
          ) : null}
          <Text bold color={textColor}>
            {fit(title ?? '', titleWidth)}
          </Text>
        </Box>
        <Box>
          {cost ? <Text color={textColor}>{cost}</Text> : null}
          {topRight ? (
            <Text color={topRight.color ?? textColor}>{topRight.char}</Text>
          ) : null}
        </Box>
      </Box>
    )
  }

  // Build the footer row, merging corner symbols if present.
  // Layout: [bottomLeft?][footerLeft?]…[footerRight?][bottomRight?]
  function renderFooterRow() {
    if (!showFooter) return null

    if (!hasFooter && hasBottomSymbols) {
      // Symbol-only fallback: no footerLeft/Right, just the present corner chars.
      // Absent corners render nothing (not a literal space).
      return (
        <Box width={innerWidth} justifyContent="space-between">
          {bottomLeft ? (
            <Text color={bottomLeft.color ?? textColor}>{bottomLeft.char}</Text>
          ) : null}
          {bottomRight ? (
            <Text color={bottomRight.color ?? textColor}>
              {bottomRight.char}
            </Text>
          ) : null}
        </Box>
      )
    }

    return (
      <Box width={innerWidth} justifyContent="space-between">
        <Box>
          {bottomLeft ? (
            <Text color={bottomLeft.color ?? textColor}>{bottomLeft.char}</Text>
          ) : null}
          {footerLeft ? (
            <Text bold color={textColor}>
              {footerLeft}
            </Text>
          ) : null}
        </Box>
        <Box>
          {footerRight ? (
            <Text dimColor color={textColor}>
              {footerRight}
            </Text>
          ) : null}
          {bottomRight ? (
            <Text color={bottomRight.color ?? textColor}>
              {bottomRight.char}
            </Text>
          ) : null}
        </Box>
      </Box>
    )
  }

  return (
    <>
      {renderHeaderRow()}

      {/* Body grows to fill remaining vertical space, pushing footer to bottom */}
      <Box flexDirection="column" flexGrow={1}>
        {artLines.slice(0, artBudget).map((line, i) => (
          <Text key={`art-${i}`} color={artColor}>
            {fit(line, innerWidth)}
          </Text>
        ))}

        {showTypeLine ? (
          <Text dimColor color={textColor}>
            {fit(typeLine!, innerWidth)}
          </Text>
        ) : null}

        {descLines.slice(0, descBudget).map((line, i) => (
          <Text key={`desc-${i}`} color={textColor}>
            {fit(line, innerWidth)}
          </Text>
        ))}
      </Box>

      {renderFooterRow()}
    </>
  )
}

/**
 * CustomCard renders a fully customizable card for non-standard card games.
 *
 * Two modes:
 * 1. **Structured** — provide title, cost, asciiArt, typeLine, description,
 *    footerLeft, footerRight, symbols. The component lays them out automatically.
 * 2. **Freeform** — provide `content` (ReactNode) for complete control.
 *
 * Supports custom card backs via the `back` prop, or falls back to DeckContext.
 *
 * Size presets: micro (5×3), mini (8×5), small (12×7), medium (18×11), large (24×15).
 * Override with explicit `width`/`height`.
 */
export function CustomCard({
  id,
  size = 'medium',
  width,
  height,
  title,
  cost,
  asciiArt,
  typeLine,
  description,
  footerLeft,
  footerRight,
  symbols = [],
  content,
  back,
  borderColor = 'white',
  textColor = 'white',
  artColor,
  faceUp = true,
  selected = false,
  rounded = true,
  effects,
}: CustomCardProps) {
  const context = useContext(DeckContext)
  const backArtwork = context?.backArtwork ?? defaultBackArtwork

  const [presetW, presetH] = SIZE_PRESETS[size] ?? SIZE_PRESETS.medium
  const cardWidth = width ?? presetW
  const cardHeight = height ?? presetH

  // Border takes 1 cell per side (2 total) on each axis
  const innerWidth = Math.max(1, cardWidth - 2)
  const innerHeight = Math.max(1, cardHeight - 2)

  if (!faceUp) {
    return (
      <CardBackFace
        cardWidth={cardWidth}
        cardHeight={cardHeight}
        back={back}
        fallbackBack={String(backArtwork.simple)}
        borderColor={borderColor}
        selected={selected}
        rounded={rounded}
      />
    )
  }

  const hasEffects = Array.isArray(effects) && effects.length > 0

  const cardStyle: BoxProps = {
    borderStyle: selected ? 'double' : rounded ? 'round' : 'single',
    borderColor: selected
      ? 'yellow'
      : hasEffects
        ? EFFECT_INDICATOR_COLOR
        : borderColor,
    width: cardWidth,
    height: cardHeight,
    flexDirection: 'column',
    overflow: 'hidden',
  }

  // Freeform mode
  if (content) {
    return <Box {...cardStyle}>{content}</Box>
  }

  // Structured layout mode
  return (
    <Box {...cardStyle}>
      <StructuredLayout
        cardLabel={title ?? id}
        size={size}
        title={title}
        cost={cost}
        asciiArt={asciiArt}
        typeLine={typeLine}
        description={description}
        footerLeft={footerLeft}
        footerRight={footerRight}
        symbols={symbols}
        innerWidth={innerWidth}
        innerHeight={innerHeight}
        textColor={textColor}
        artColor={artColor ?? textColor}
      />
    </Box>
  )
}

export default CustomCard
