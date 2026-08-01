import { Box, type BoxProps, Text } from 'ink'
import React, { useContext } from 'react'
import { DeckContext, defaultBackArtwork } from '../../contexts/DeckContext.js'
import {
  type CustomCardBack,
  type CustomCardProps,
  type CustomCardSize,
  type CustomCardSymbol,
} from '../../types/index.js'
import { displayWidth } from '../../utils/text.js'

/**
 * Size presets: [width, height]
 */
const SIZE_PRESETS: Record<CustomCardSize, [number, number]> = {
  micro: [5, 3],
  mini: [8, 5],
  small: [12, 7],
  medium: [18, 11],
  large: [24, 15],
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
      while (remaining.length > maxWidth) {
        if (current.length > 0) {
          lines.push(current)
          current = ''
        }

        lines.push(remaining.slice(0, maxWidth))
        remaining = remaining.slice(maxWidth)
      }

      if (current.length === 0) {
        current = remaining
      } else if (current.length + 1 + remaining.length <= maxWidth) {
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
 * Pads or truncates a string to exactly `len` characters.
 */
function fit(str: string, len: number): string {
  if (len <= 0) return ''
  return str.length >= len ? str.slice(0, len) : str.padEnd(len)
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

  // Calculate how many lines are available for art + description.
  // Symbols are folded into header/footer rows — they no longer consume extra lines.
  // A symbol-only row is added only when there is no header/footer to merge into.
  const symbolOnlyTopRow = hasTopSymbols && !hasHeader
  const symbolOnlyBottomRow = hasBottomSymbols && !hasFooter

  // Fixed rows outside the flexGrow body (header and footer).
  const headerRows = hasHeader || symbolOnlyTopRow ? 1 : 0
  const footerRows = hasFooter || symbolOnlyBottomRow ? 1 : 0
  const bodyLines = Math.max(0, innerHeight - headerRows - footerRows)

  // TypeLine renders inside the body Box, so it consumes body budget, not header/footer rows.
  // availableLines = innerHeight − headerRows − footerRows − typeLine (all inside the body).
  const availableLines = Math.max(0, bodyLines - (hasTypeLine ? 1 : 0))

  // Split available space between art and description
  const artLines = asciiArt ? asciiArt.split('\n') : []
  const artLineCount = Math.min(artLines.length, availableLines)
  const descLines = description ? wrapText(description, innerWidth) : []
  const remainingForDesc = Math.max(0, availableLines - artLineCount)
  const descLineCount = Math.min(descLines.length, remainingForDesc)

  // Build the header row, merging corner symbols if present.
  // Layout: [topLeft?][title…][cost?][topRight?]
  // The title is fitted into the remaining horizontal space.
  function renderHeaderRow() {
    if (!hasHeader && !hasTopSymbols) return null

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
      (cost ? cost.length + 1 : 0) + (topRight ? topRightW : 0)
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
    if (!hasFooter && !hasBottomSymbols) return null

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
        {artLines.slice(0, artLineCount).map((line, i) => (
          <Text key={`art-${i}`} color={artColor}>
            {fit(line, innerWidth)}
          </Text>
        ))}

        {hasTypeLine ? (
          <Text dimColor color={textColor}>
            {fit(typeLine!, innerWidth)}
          </Text>
        ) : null}

        {descLines.slice(0, descLineCount).map((line, i) => (
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

  const cardStyle: BoxProps = {
    borderStyle: selected ? 'double' : rounded ? 'round' : 'single',
    borderColor: selected ? 'yellow' : borderColor,
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
