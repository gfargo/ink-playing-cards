import { ASCII_CARD_ART, SIMPLE_CARD_ART } from '../../constants/cardArt.js'
import type { TCardValue, TSuitIcon } from '../../types/index.js'
import { center, left, right, spaces } from '../../utils/text.js'

/**
 * Creates the top line of a card with rank and suit
 */
export function createTopLine(
  rank: TCardValue,
  suit: TSuitIcon,
  width: number,
  variant: 'ascii' | 'simple' | 'minimal' = 'simple'
): string {
  if (variant === 'simple') {
    return left(rank, width)
  }
  const leftPart = `${rank}${suit}`
  return left(leftPart, width)
}

/**
 * Creates the bottom line of a card with rank and suit
 */
export function createBottomLine(
  rank: TCardValue,
  suit: TSuitIcon,
  width: number,
  variant: 'ascii' | 'simple' | 'minimal' = 'simple'
): string {
  if (variant === 'simple') {
    return right(rank, width)
  }
  const rightPart = `${suit}${rank}`
  return right(rightPart, width)
}

/**
 * Creates the pip layout for ASCII variant cards
 */
export function createAsciiPipLayout(
  rank: TCardValue,
  { left, center, right }: { left: number; center: number; right: number }
): Array<[number, number]> {
  const layouts: Partial<Record<TCardValue, Array<[number, number]>>> = {
    '2': [
      [2, center],
      [6, center],
    ],
    '3': [
      [2, center],
      [4, center],
      [6, center],
    ],
    '4': [
      [2, left],
      [2, right],
      [6, left],
      [6, right],
    ],
    '5': [
      [2, left],
      [2, right],
      [4, center],
      [6, left],
      [6, right],
    ],
    '6': [
      [2, left],
      [2, right],
      [4, left],
      [4, right],
      [6, left],
      [6, right],
    ],
    '7': [
      [2, left],
      [2, right],
      [4, left],
      [4, right],
      [5, center],
      [6, left],
      [6, right],
    ],
    '8': [
      [2, left],
      [2, right],
      [3, center],
      [4, left],
      [4, right],
      [5, center],
      [6, left],
      [6, right],
    ],
    '9': [
      [2, left],
      [2, center],
      [2, right],
      [4, left],
      [4, center],
      [4, right],
      [6, left],
      [6, center],
      [6, right],
    ],
    '10': [
      [2, left],
      [2, center],
      [2, right],
      [3, center],
      [4, left],
      [4, right],
      [5, center],
      [6, left],
      [6, center],
      [6, right],
    ],
  }

  return layouts[rank] ?? []
}

/**
 * Creates the pip layout for simple variant cards
 */
export function createSimplePipLayout(
  rank: TCardValue,
  { left, center, right }: { left: number; center: number; right: number }
): Array<[number, number]> {
  const layouts: Partial<Record<TCardValue, Array<[number, number]>>> = {
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
      [0, left],
      [0, right],
      [2, left],
      [2, right],
      [3, center],
      [4, left],
      [4, right],
    ],
    '8': [
      [0, left],
      [0, right],
      [1, center],
      [2, left],
      [2, right],
      [3, center],
      [4, left],
      [4, right],
    ],
    '9': [
      [0, left],
      [0, center],
      [0, right],
      [2, left],
      [2, center],
      [2, right],
      [4, left],
      [4, center],
      [4, right],
    ],
    '10': [
      [0, left],
      [0, center],
      [0, right],
      [1, center],
      [2, left],
      [2, right],
      [3, center],
      [4, left],
      [4, center],
      [4, right],
    ],
  }

  return layouts[rank] ?? []
}

/**
 * Creates special card art for face cards and aces
 */
export function createSpecialArt(
  rank: TCardValue,
  suit: TSuitIcon,
  width: number,
  variant: 'ascii' | 'simple'
): string[] {
  const w = width

  if (variant === 'ascii') {
    const art = ASCII_CARD_ART[rank]?.map(line => 
      center(line.replace(/{suit}/g, suit), w)
    )
    return art ?? []
  }

  // Simple variant
  const art = SIMPLE_CARD_ART[rank]?.map(line => {
    const processedLine = line.replace(/{suit}/g, suit)
    // For Ace, center the art
    if (rank === 'A') {
      return center(processedLine, w)
    }
    // For face cards (J, Q, K), right align the art
    return right(processedLine, w)
  })
  return art ?? []
}

/**
 * Creates the complete card content including borders and pips/art
 */
export function createCardContent(
  rank: TCardValue,
  suit: TSuitIcon,
  variant: 'ascii' | 'simple' | 'minimal',
  config = {
    width: 11,
    height: 9,
    pip: { left: 2, center: 4, right: 6 },
    padding: 0,
  }
): string {
  const { width, height } = config

  // For minimal variant, just return a centered suit
  if (variant === 'minimal') {
    return `\n${center(`${rank}${suit}`, width - (rank.length > 1 ? 2 : 0))}\n`
  }

  const lines: string[] = []
  const isSpecialCard = ['A', 'J', 'Q', 'K'].includes(rank)

  // Add top border line
  lines.push(createTopLine(rank, suit, width, variant))

  // Add middle content
  if (isSpecialCard) {
    while (lines.length < height / 2 - 4) {
      lines.push(spaces(width - 2))
    }

    const art = createSpecialArt(rank, suit, width, variant)
    lines.push(...art)
    
    // Pad to full height
    while (lines.length < height - 2 - 1) {
      lines.push(spaces(width - 2))
    }
  } else if (config.pip) {
    const pipLayout =
      variant === 'simple'
        ? createSimplePipLayout(rank, config.pip)
        : createAsciiPipLayout(rank, config.pip)
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
  lines.push(createBottomLine(rank, suit, width, variant))

  return lines.join('\n')
}