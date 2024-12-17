import { Box, Text, type BoxProps } from 'ink'
import React from 'react'
import useDeck from '../../hooks/useDeck.js'
import {
  type TCardValue,
  type TSuit,
  type TSuitIcon,
  type CardProps,
} from '../../types/index.js'

export const SUIT_SYMBOL_MAP: Record<TSuit, TSuitIcon> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

// Const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Utilities
const spaces = (count: number) => ' '.repeat(count)

function topLine(rank: TCardValue, suit: TSuitIcon, width: number): string {
  const leftPart = `${rank} ${suit}`
  const rightSuit = suit
  const remainingSpaces = width - (leftPart.length + rightSuit.length)
  return leftPart + spaces(remainingSpaces) + rightSuit
}

function bottomLine(rank: TCardValue, suit: TSuitIcon, width: number): string {
  const rightPart = `${suit} ${rank}`
  const totalSpaces = width - rightPart.length
  return spaces(totalSpaces) + rightPart
}

function createPipLines(
  // @ts-ignore
  rank: TCardValue,
  suit: TSuitIcon,
  width: number,
  pipPositions: number[][]
): string[] {
  const lines = Array.from(
    {
      length:
        // eslint-disable-next-line unicorn/no-array-reduce
        pipPositions.reduce((max, pos) => Math.max(max, pos[0] ?? 0), 0) + 1,
    },
    () => spaces(width)
  )
  // Insert pips:
  // pipPositions is array of [lineIndex, colIndex]
  // Make sure the array covers all required lines. We'll assume pipPositions only covers the internal lines.
  let maxLine = 0
  for (const [posLine] of pipPositions) {
    if (posLine && posLine > maxLine) {
      maxLine = posLine
    }
  }

  for (const [posLine, posCol] of pipPositions) {
    // Skip invalid positions:
    if (!posLine || posLine < 0 || posLine > maxLine) {
      // Console.error('Invalid pip position:', posLine, posCol)
      continue
    }

    const arr = [...lines[posLine]!]
    arr[posCol!] = suit
    lines[posLine] = arr.join('')
  }

  // Pad lines if needed:
  while (lines.length <= maxLine) {
    lines.push(spaces(width))
  }

  return lines
}

/** Variant Configurations **/

type VariantConfig = {
  width: number
  height: number
  // Given a rank, return pip positions [lineIndex, colIndex] for the internal lines of that variant.
  pipPositionsForRank: (rank: TCardValue) => number[][]
  // Handle special ranks (A, J, Q, K).
  specialArt?: (rank: TCardValue, suit: TSuitIcon, width: number) => string[]
}

// ASCII Variant
const asciiConfig: VariantConfig = {
  width: 15,
  height: 11,
  pipPositionsForRank(rank: TCardValue): number[][] {
    // Using the previous large-card logic:
    const C = 7 // Center
    const L = 3
    const R = 11
    // LineIndex: 0..8 -> lines 2..10 internally
    // For clarity, in ascii variant we start counting internal lines at 0 = line2
    // We'll just reuse the previously defined logic. Adjust line indices to start at 0:
    switch (rank) {
      case '2': {
        return [
          [1, C],
          [7, C],
        ]
      }

      case '3': {
        return [
          [1, C],
          [4, C],
          [7, C],
        ]
      }

      case '4': {
        return [
          [1, L],
          [1, R],
          [7, L],
          [7, R],
        ]
      }

      case '5': {
        return [
          [1, L],
          [1, R],
          [4, C],
          [7, L],
          [7, R],
        ]
      }

      case '6': {
        return [
          [1, L],
          [1, R],
          [4, L],
          [4, R],
          [7, L],
          [7, R],
        ]
      }

      case '7': {
        return [
          [0, C],
          [1, L],
          [1, R],
          [4, L],
          [4, R],
          [7, L],
          [7, R],
        ]
      }

      case '8': {
        return [
          [0, C],
          [1, L],
          [1, R],
          [4, L],
          [4, R],
          [6, C],
          [7, L],
          [7, R],
        ]
      }

      case '9': {
        return [
          [0, C],
          [1, L],
          [1, R],
          [3, C],
          [4, L],
          [4, R],
          [6, C],
          [7, L],
          [7, R],
        ]
      }

      case '10': {
        return [
          [0, C],
          [1, L],
          [1, R],
          [2, L],
          [2, R],
          [3, C],
          [4, L],
          [4, R],
          [6, C],
          [7, L],
          [7, R],
        ]
      }

      default: {
        return []
      }
    }
  },
  specialArt(rank: TCardValue, suit: TSuitIcon, width: number): string[] {
    // For ASCII variant we had fancy art (omitted here for brevity, but reuse previous logic)
    // Just reuse the previously defined large ASCII art.
    if (rank === 'A') {
      return [
        spaces(width),
        '     ' + suit + '   ' + suit + '    ',
        '    ' + suit + '     ' + suit + '   ',
        '    ' + suit + '     ' + suit + '   ',
        '     ' + suit + '   ' + suit + '    ',
        '       ' + suit + '      ',
        spaces(width),
        spaces(width),
        spaces(width),
      ]
    }

    if (rank === 'J') {
      return [
        spaces(width),
        '    (\\   /)   ',
        '     ( o o )   ',
        '      (  ' + suit + '  )    ',
        '       \\|/     ',
        '       / \\     ',
        spaces(width),
        spaces(width),
        spaces(width),
      ]
    }

    if (rank === 'Q') {
      return [
        spaces(width),
        '    (\\   /)   ',
        '     ( ^ ^ )   ',
        '      (  ' + suit + '  )    ',
        '      (  v  )   ',
        '       \\ | /    ',
        spaces(width),
        spaces(width),
        spaces(width),
      ]
    }

    if (rank === 'K') {
      return [
        spaces(width),
        '    (\\___/)   ',
        '    (  ' + suit + '  )   ',
        '   (   ^   )  ',
        '    (  v  )   ',
        '     \\ | /    ',
        spaces(width),
        spaces(width),
        spaces(width),
      ]
    }

    return []
  },
}

// Simple Variant
// Smaller card: width=9, height=7
// We'll have fewer lines for pips. Let's say internal lines = 3 (lines 2..4).
// Adjust pip positions for a smaller layout.
const simpleConfig: VariantConfig = {
  width: 9,
  height: 7,
  pipPositionsForRank(rank: TCardValue): number[][] {
    // We'll choose a simpler layout. internal lines = 3 lines (index:0..2)
    // We'll place pips in a 3-wide pattern: L=2, C=4, R=6 for example.
    const C = 4
    const L = 2
    const R = 6
    switch (rank) {
      case '2': {
        return [
          [0, C],
          [2, C],
        ]
      }

      case '3': {
        return [
          [0, C],
          [1, C],
          [2, C],
        ]
      }

      case '4': {
        return [
          [0, L],
          [0, R],
          [2, L],
          [2, R],
        ]
      }

      case '5': {
        return [
          [0, L],
          [0, R],
          [1, C],
          [2, L],
          [2, R],
        ]
      }

      case '6': {
        return [
          [0, L],
          [0, R],
          [1, L],
          [1, R],
          [2, L],
          [2, R],
        ]
      }

      case '7': {
        return [
          [0, L],
          [0, R],
          [1, L],
          [1, R],
          [1, C],
          [2, L],
          [2, R],
        ]
      }

      case '8': {
        return [
          [0, L],
          [0, R],
          [1, L],
          [1, R],
          [1, C],
          [2, L],
          [2, R],
          [2, C],
        ]
      }

      case '9': {
        return [
          [0, L],
          [0, R],
          [0, C],
          [1, L],
          [1, R],
          [2, L],
          [2, R],
          [2, C],
        ]
      }

      case '10': {
        return [
          [0, L],
          [0, R],
          [0, C],
          [1, L],
          [1, R],
          [2, L],
          [2, R],
          [2, C],
        ]
      }

      default: {
        return []
      }
    }
  },
  // @ts-ignore
  specialArt(rank: TCardValue, suit: TSuitIcon, width: number): string[] {
    // Simple variant: just put a big symbol in center line for A/J/Q/K
    // We'll have 3 internal lines: index 0..2
    // Center line is index 1
    const centerLine = spaces(4) + suit + spaces(width - 5)
    return [spaces(width), centerLine, spaces(width)]
  },
}

// Minimal Variant
// Very small: width=5, height=6
// Minimal: Just rank & suit at top line, suit in center, rank at bottom line.
// No pips, no special art.
const minimalConfig: VariantConfig = {
  width: 6,
  height: 5,
  pipPositionsForRank: () => [],
}

// Build a card's text given the variant, rank, and suit
function makeCard(
  rank: TCardValue,
  suit: TSuitIcon,
  config: VariantConfig
): string {
  const { width, pipPositionsForRank, specialArt } = config
  const top = topLine(rank, suit, width)
  const bottom = bottomLine(rank, suit, width)

  let middle: string[]
  if (['J', 'Q', 'K', 'A'].includes(rank) && specialArt) {
    // Use special art if available:
    middle = specialArt(rank, suit, width)
  } else {
    const pips = pipPositionsForRank(rank)
    if (pips.length > 0) {
      middle = createPipLines(rank, suit, width, pips)
    } else {
      // No pips (e.g. minimal or rank that doesn't match)
      // Minimal just center a suit symbol in the middle line
      // For minimal, we have height=5, internal lines=3 (since top+bottom),
      // so line index for center = 1 (0-based internal)
      const centerLineIndex = Math.floor((config.height - 2) / 2)
      middle = Array.from({ length: config.height - 2 }, () => spaces(width))
      if (config === minimalConfig) {
        // Place suit in center
        const arr = [...(middle[centerLineIndex] ?? '')]
        arr[Math.floor(width / 2)] = suit
        middle[centerLineIndex] = arr.join('')
      }
    }
  }

  return [top, ...middle, bottom].join('\n')
}

function getVariantConfig(
  variant: 'simple' | 'ascii' | 'minimal'
): VariantConfig {
  if (variant === 'ascii') {
    return asciiConfig
  }

  if (variant === 'minimal') {
    return minimalConfig
  }

  return simpleConfig
}

// Const asciiCards: Record<string, TCard> = {
//   hearts: {},
//   diamonds: {},
//   clubs: {},
//   spades: {},
// };

// Prebuild asciiCards for ascii variant (optional, or we can build on the fly)
// for (const suit in suitSymbols) {
//   const symbol = suitSymbols[suit]!;
//   for (const rank of ranks) {
//     if (!asciiCards[suit]) {
//       asciiCards[suit] = {};
//     }
//     asciiCards[suit][rank] = makeCard(rank, symbol, asciiConfig);
// }

type ExtendedCardProps = {
  readonly variant?: 'simple' | 'ascii' | 'minimal'
} & CardProps

export function Card({
  suit,
  value,
  faceUp = true,
  variant = 'simple',
}: ExtendedCardProps) {
  const { backArtwork } = useDeck()

  const config = getVariantConfig(variant)

  // The box size depends on variant:
  // We'll provide just border and small dimension for minimal, etc.
  const cardStyle: BoxProps = {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingX: 1,
    borderStyle: 'single',
    height: config.height,
    width: config.width,
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
  const cardText = makeCard(value, symbol, config)

  return (
    <Box {...cardStyle}>
      <Text color={color}>{cardText}</Text>
    </Box>
  )
}

export default Card
