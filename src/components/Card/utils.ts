import { SYMBOL_SUIT_MAP } from '../../constants/card.js'
import {
  ANIMAL_FEATURES,
  GEOMETRIC_SYMBOLS,
  MEDIEVAL_FEATURES,
  PIXEL_FEATURES,
  SIMPLE_CARD_ART,
  THEME_MAP,
} from '../../constants/cardArt.js'
import { ROBOT_FEATURES, ROBOT_THEME } from '../../constants/robotTheme.js'
import type { AsciiTheme, TCardValue, TSuit, TSuitIcon } from '../../types/index.js'
import { renderCardArt } from '../../utils/cardArtRenderer.js'
import { center, left, right, spaces } from '../../utils/text.js'

/**
 * Get theme-specific replacements for a given suit
 */
function getThemeReplacements(theme: AsciiTheme, suit: TSuit): Record<string, string> {
  console.log('theme:', theme, 'suit:', suit)
  const replacements: Record<AsciiTheme, Record<string, string>> = {
    'geometric': {
      outline: GEOMETRIC_SYMBOLS[suit]?.outline ?? '',
      filled: GEOMETRIC_SYMBOLS[suit]?.filled ?? '',
    },
    'animal': {
      eyes: ANIMAL_FEATURES[suit]?.eyes ?? '',
      mouth: ANIMAL_FEATURES[suit]?.mouth ?? '',
      fur: ANIMAL_FEATURES[suit]?.fur ?? '',
      paw: ANIMAL_FEATURES[suit]?.paw ?? '',
    },
    'robot': {
      eyes: ROBOT_FEATURES[suit]?.eyes ?? '',
      data: ROBOT_FEATURES[suit]?.data ?? '',
      circuit: ROBOT_FEATURES[suit]?.circuit ?? '',
      core: ROBOT_FEATURES[suit]?.core ?? '',
    },
    'pixel': {
      crown: PIXEL_FEATURES[suit]?.crown ?? '',
      face: PIXEL_FEATURES[suit]?.face ?? '',
      base: PIXEL_FEATURES[suit]?.base ?? '',
    },
    'medieval': {
      class: MEDIEVAL_FEATURES[suit]?.class ?? '',
      crown: MEDIEVAL_FEATURES[suit]?.crown ?? '',
      deco: MEDIEVAL_FEATURES[suit]?.deco ?? '',
      base: MEDIEVAL_FEATURES[suit]?.base ?? '',
    },
    'original': {},
  }

  return replacements[theme] ?? {}
}

/**
 * Apply theme-specific replacements to a line of art
 */
function applyThemeReplacements(line: string, replacements: Record<string, string>): string {
  let result = line
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  }
  return result
}

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
  const leftPart = `${rank} ${suit}`
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
  const rightPart = `${suit} ${rank}`
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
 * Creates robot theme card art using the new renderer
 */
function createRobotArt(
  rank: TCardValue,
  suit: TSuitIcon,
  width: number
): string[] {
  if (rank in ROBOT_THEME) {
    const artDefinition = ROBOT_THEME[rank]!
    const features = ROBOT_FEATURES[SYMBOL_SUIT_MAP[suit]]
    return renderCardArt(artDefinition, width, {
      ...features,
      suit
    })
  }
  return []
}

/**
 * Creates special card art for face cards and aces
 * @param rank - The card rank (A, 2-10, J, Q, K)
 * @param suit - The card suit symbol
 * @param width - The width of the card
 * @param variant - The card variant (ascii or simple)
 * @param theme - The ASCII art theme to use
 * @returns An array of strings representing the card art
 */
export function createSpecialArt(
  rank: TCardValue,
  suit: TSuitIcon,
  width: number,
  variant: 'ascii' | 'simple',
  theme: AsciiTheme = 'original'
): string[] {
  const w = width

  if (variant === 'ascii') {
    // Use new renderer for robot theme
    if (theme === 'robot') {
      return createRobotArt(rank, suit, w)
    }

    const themeArt = THEME_MAP[theme]!
    const replacements = getThemeReplacements(theme, SYMBOL_SUIT_MAP[suit])

    const art = themeArt[rank]?.map(line => {
      // First replace the suit
      let processedLine = line.replace(/{suit}/g, suit)
      
      // Then apply theme-specific replacements
      processedLine = applyThemeReplacements(processedLine, replacements)
      
      return center(processedLine, w)
    })

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
  },
  theme: AsciiTheme = 'original'
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
    const art = createSpecialArt(rank, suit, width, variant, theme)

    while (lines.length < height / 2 - art.length / 2 - 2) {
      lines.push(spaces(width - 2))
    }

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