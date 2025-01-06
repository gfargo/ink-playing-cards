import { Box, Text, type BoxProps } from 'ink'
import React from 'react'
import { useDeck } from '../../hooks/useDeck.js'
import {
  type CardProps,
  type TCardValue,
  type TSuit,
  type TSuitIcon,
} from '../../types/index.js'

type PipConfig = {
  left: number
  center: number
  right: number
}

type CardConfig = {
  width: number
  height: number
  padding: number
  pip?: PipConfig
}

// Constants for card dimensions and layouts
const CARD_DIMENSIONS: Record<'ascii' | 'simple' | 'minimal', CardConfig> = {
  ascii: {
    width: 15,
    height: 12,
    pip: { left: 2, center: 6, right: 10 },
    padding: 0,
  },
  simple: {
    width: 11,
    height: 9,
    pip: { left: 2, center: 4, right: 6 },
    padding: 0,
  },
  minimal: {
    width: 6,
    height: 5,
    padding: 0,
  },
}

export const SUIT_SYMBOL_MAP: Record<TSuit, TSuitIcon> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
} as const

// Utility functions
const spaces = (count: number) => ` `.repeat(Math.max(0, count))

const center = (text: string, width: number) => {
  const padding = Math.max(0, width - 2 - text.length) / 2
  return spaces(Math.floor(padding)) + text + spaces(Math.ceil(padding))
}

const left = (text: string, width: number) => {
  return text + spaces(Math.max(0, width - 2 - text.length))
}

const right = (text: string, width: number) => {
  return spaces(Math.max(0, width - 2 - text.length)) + text
}

// Card border functions
function createTopLine(
  rank: TCardValue,
  suit: TSuitIcon,
  width: number
): string {
  const leftPart = `${rank}${suit}`
  return left(leftPart, width)
}

function createBottomLine(
  rank: TCardValue,
  suit: TSuitIcon,
  width: number
): string {
  const rightPart = `${suit}${rank}`
  return right(rightPart, width)
}

// Pip layout configurations
type PipLayout = Array<[number, number]> // [row, col]

const createPipLayout = (
  rank: TCardValue,
  { left, center, right }: PipConfig
): PipLayout => {
  const layouts: Partial<Record<TCardValue, PipLayout>> = {
    '2': [
      [0, center],
      [4, center],
    ],
    '3': [
      [0, center],
      [2, center],
      [4, center],
    ],
    '4': [
      [0, left],
      [0, right],
      [4, left],
      [4, right],
    ],
    '5': [
      [0, left],
      [0, right],
      [2, center],
      [4, left],
      [4, right],
    ],
    '6': [
      [0, left],
      [0, right],
      [2, left],
      [2, right],
      [4, left],
      [4, right],
    ],
    '7': [
      [1, left],
      [1, right],
      [2, center],
      [3, left],
      [3, right],
      [4, center],
      [5, center],
    ],
    '8': [
      [1, left],
      [1, right],
      [2, center],
      [3, left],
      [3, right],
      [4, center],
      [5, left],
      [5, right],
    ],
    '9': [
      [1, left],
      [1, right],
      [2, center],
      [3, left],
      [3, right],
      [4, center],
      [5, left],
      [5, right],
      [5, center],
    ],
    '10': [
      [1, left],
      [1, right],
      [2, left],
      [2, right],
      [3, center],
      [3, center],
      [4, left],
      [4, right],
      [5, left],
      [5, right],
    ],
  }

  return layouts[rank] ?? []
}

// Special card art (face cards and ace)
const createSpecialArt = (
  rank: TCardValue,
  suit: TSuitIcon,
  width: number,
  variant: 'ascii' | 'simple'
): string[] => {
  const w = width

  if (variant === 'ascii') {
    const art: Partial<Record<TCardValue, string[]>> = {
      A: [
        center(`${suit}`, w),
        center(`${suit} ${suit}`, w),
        center(`${suit}${suit}${suit}`, w),
        center(`${suit} ${suit}`, w),
        center(`${suit}`, w),
      ],
      J: [
        center('(^ ^)', w),
        center(`(${suit})`, w),
        center('/|\\', w),
        center('/ \\', w),
      ],
      Q: [
        center('(o o)', w),
        center(`(${suit})`, w),
        center('\\|/', w),
        center(' | ', w),
      ],
      K: [
        center('\\^/', w),
        center(`(${suit})`, w),
        center('/|\\', w),
        center('/ \\', w),
      ],
    }
    return art[rank] ?? []
  }

  // Simple variant - more compact art
  const simpleArt: Partial<Record<TCardValue, string[]>> = {
    A: [center(`${suit}`, w), center(`${suit}`, w), center(`${suit}`, w)],
    J: [center(`J${suit}`, w), center('|', w), center('/', w)],
    Q: [center(`Q${suit}`, w), center('|', w), center('\\', w)],
    K: [center(`K${suit}`, w), center('|', w), center('Y', w)],
  }
  return simpleArt[rank] ?? []
}

// Create the complete card content
function createCardContent(
  rank: TCardValue,
  suit: TSuitIcon,
  variant: 'ascii' | 'simple' | 'minimal',
  config = CARD_DIMENSIONS[variant]
): string {
  const { width, height } = config

  // For minimal variant, just return a centered suit
  if (variant === 'minimal') {
    return `
${center(`${rank}${suit}`, width - (rank.length > 1 ? 2 : 0))}
`
  }

  const lines: string[] = []
  const isSpecialCard = ['A', 'J', 'Q', 'K'].includes(rank)

  // Add top border line
  lines.push(createTopLine(rank, suit, width))

  // Add middle content
  if (isSpecialCard) {
    while (lines.length < height / 2 - 3) {
      lines.push(spaces(width - 2))
    }

    const art = createSpecialArt(rank, suit, width, variant)
    lines.push(...art)
    // Pad to full height
    while (lines.length < height - 2 - 1) {
      lines.push(spaces(width - 2))
    }
  } else if (config.pip) {
    const pipLayout = createPipLayout(rank, config.pip)
    const middleLines = Array.from({ length: height - 4 }, () =>
      spaces(width - 2)
    )

    // Place pips
    for (const [row, col] of pipLayout) {
      if (row < middleLines.length && middleLines[row]) {
        const line = [...middleLines[row]]
        if (col < line.length) {
          line[col] = suit
          middleLines[row] = line.join('')
        }
      }
    }

    lines.push(...middleLines)
  } else {
    // For variants without pip configuration, add empty lines
    const middleLines = Array.from({ length: height - 4 }, () =>
      spaces(width - 2)
    )
    lines.push(...middleLines)
  }

  // Add bottom border line
  lines.push(createBottomLine(rank, suit, width))

  return lines.join('\n')
}

// Main Card component
export function Card({
  suit,
  value,
  faceUp = true,
  selected = false,
  rounded = true,
  variant = 'simple',
}: CardProps & { readonly variant?: 'ascii' | 'simple' | 'minimal' }) {
  const { backArtwork } = useDeck()
  const config = CARD_DIMENSIONS[variant]

  const cardStyle: BoxProps = {
    flexDirection: 'column',
    // AlignItems: 'center',
    // justifyContent: 'center',
    paddingX: config.padding,

    borderStyle: selected ? 'double' : rounded ? 'round' : 'single',
    borderColor: selected ? 'yellow' : 'white',

    height: config.height,
    width: config.width,
    overflow: 'hidden',
  }

  if (!faceUp) {
    return (
      <Box {...cardStyle}>
        <Box width="100%" height="100%">
          <Text>{backArtwork[variant]}</Text>
        </Box>
      </Box>
    )
  }

  const color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'white'
  const symbol = SUIT_SYMBOL_MAP[suit]
  const cardContent = createCardContent(value, symbol, variant)

  return (
    <Box {...cardStyle}>
      <Text color={color}>{cardContent}</Text>
    </Box>
  )
}

export default Card
