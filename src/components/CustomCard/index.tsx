import { Box, type BoxProps, Text } from 'ink'
import React, { useContext } from 'react'
import { DeckContext, defaultBackArtwork } from '../../contexts/DeckContext.js'
import {
  type CustomCardBack,
  type CustomCardProps,
  type CustomCardSize,
  type CustomCardSymbol,
} from '../../types/index.js'

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
 */
function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if (current.length === 0) {
      current = word
    } else if (current.length + 1 + word.length <= maxWidth) {
      current += ' ' + word
    } else {
      lines.push(current)
      current = word
    }
  }

  if (current) {
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
 * Renders corner symbols onto the card by overlaying them on the first/last lines.
 */
function CornerSymbols({
  symbols,
  position,
  innerWidth,
  textColor,
}: {
  readonly symbols: CustomCardSymbol[]
  readonly position: 'top' | 'bottom'
  readonly innerWidth: number
  readonly textColor: string
}) {
  const left = symbols.find((s) => s.position === `${position}-left`)
  const right = symbols.find((s) => s.position === `${position}-right`)
  if (!left && !right) return null

  return (
    <Box width={innerWidth} justifyContent="space-between">
      <Text color={left?.color ?? textColor}>{left?.char ?? ' '}</Text>
      <Text color={right?.color ?? textColor}>{right?.char ?? ' '}</Text>
    </Box>
  )
}

/**
 * Renders the structured card layout with header, art, typeLine, body, footer regions.
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
  const hasSymbols = symbols.length > 0
  const hasHeader = Boolean(title ?? cost)
  const hasFooter = Boolean(footerLeft ?? footerRight)
  const hasTypeLine = Boolean(typeLine)

  // Calculate how many lines are available for art + description
  let usedLines = 0
  if (hasSymbols) usedLines += 1 // Top symbols
  if (hasHeader) usedLines += 1
  if (hasTypeLine) usedLines += 1
  if (hasFooter) usedLines += 1
  if (hasSymbols) usedLines += 1 // Bottom symbols

  const availableLines = Math.max(0, innerHeight - usedLines)

  // Split available space between art and description
  const artLines = asciiArt ? asciiArt.split('\n') : []
  const artLineCount = Math.min(artLines.length, availableLines)
  const descLines = description ? wrapText(description, innerWidth) : []
  const remainingForDesc = Math.max(0, availableLines - artLineCount)
  const descLineCount = Math.min(descLines.length, remainingForDesc)

  return (
    <>
      {hasSymbols ? (
        <CornerSymbols
          symbols={symbols}
          position="top"
          innerWidth={innerWidth}
          textColor={textColor}
        />
      ) : null}

      {hasHeader ? (
        <Box width={innerWidth} justifyContent="space-between">
          <Text bold color={textColor}>
            {fit(title ?? '', cost ? innerWidth - cost.length - 1 : innerWidth)}
          </Text>
          {cost ? <Text color={textColor}>{cost}</Text> : null}
        </Box>
      ) : null}

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

      {hasFooter ? (
        <Box width={innerWidth} justifyContent="space-between">
          <Text bold color={textColor}>
            {footerLeft ?? ''}
          </Text>
          <Text dimColor color={textColor}>
            {footerRight ?? ''}
          </Text>
        </Box>
      ) : null}

      {hasSymbols ? (
        <CornerSymbols
          symbols={symbols}
          position="bottom"
          innerWidth={innerWidth}
          textColor={textColor}
        />
      ) : null}
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

  // Border takes 2 chars on each side
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
