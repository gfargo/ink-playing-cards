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
import type {
  AsciiTheme,
  TCardValue,
  TSuit,
  TSuitIcon,
} from '../../types/index.js'
import { renderCardArt } from '../../utils/cardArtRenderer.js'
import {
  applyReplacements,
  center,
  centerLabelBlock,
  left,
  right,
  spaces,
} from '../../utils/text.js'

/**
 * Get theme-specific replacements for a given suit
 */
function getThemeReplacements(
  theme: AsciiTheme,
  suit: TSuit
): Record<string, string> {
  // Console.log('theme:', theme, 'suit:', suit)
  const replacements: Record<AsciiTheme, Record<string, string>> = {
    geometric: {
      outline: GEOMETRIC_SYMBOLS[suit]?.outline ?? '',
      filled: GEOMETRIC_SYMBOLS[suit]?.filled ?? '',
    },
    animal: {
      eyes: ANIMAL_FEATURES[suit]?.eyes ?? '',
      mouth: ANIMAL_FEATURES[suit]?.mouth ?? '',
      fur: ANIMAL_FEATURES[suit]?.fur ?? '',
      paw: ANIMAL_FEATURES[suit]?.paw ?? '',
    },
    robot: {
      eyes: ROBOT_FEATURES[suit]?.eyes ?? '',
      data: ROBOT_FEATURES[suit]?.data ?? '',
      circuit: ROBOT_FEATURES[suit]?.circuit ?? '',
      core: ROBOT_FEATURES[suit]?.core ?? '',
    },
    pixel: {
      crown: PIXEL_FEATURES[suit]?.crown ?? '',
      face: PIXEL_FEATURES[suit]?.face ?? '',
      base: PIXEL_FEATURES[suit]?.base ?? '',
    },
    medieval: {
      class: MEDIEVAL_FEATURES[suit]?.class ?? '',
      crown: MEDIEVAL_FEATURES[suit]?.crown ?? '',
      deco: MEDIEVAL_FEATURES[suit]?.deco ?? '',
      base: MEDIEVAL_FEATURES[suit]?.base ?? '',
    },
    original: {},
  }

  return replacements[theme] ?? {}
}

/**
 * Creates the top line of a card with rank and suit
 */
export function createTopLine(
  rank: TCardValue,
  suit: string,
  width: number,
  variant: 'ascii' | 'simple' | 'minimal' = 'simple'
): string {
  if (variant === 'simple') {
    return left(rank, width - 2)
  }

  const leftPart = `${rank} ${suit}`
  return left(leftPart, width - 2)
}

/**
 * Creates the bottom line of a card with rank and suit
 */
export function createBottomLine(
  rank: TCardValue,
  suit: string,
  width: number,
  variant: 'ascii' | 'simple' | 'minimal' = 'simple'
): string {
  if (variant === 'simple') {
    return right(rank, width - 2)
  }

  const rightPart = `${suit} ${rank}`
  return right(rightPart, width - 2)
}

type PipColumn = 'left' | 'center' | 'right'

/**
 * Normalised (0-based) pip row/column table shared by all pip-based variants.
 * Row numbers are relative to the top of the pip area; each variant applies
 * its own row offset via `PIP_ROW_OFFSET`.
 */
const PIP_LAYOUTS: Partial<Record<TCardValue, Array<[number, PipColumn]>>> = {
  '2': [
    [0, 'center'],
    [4, 'center'],
  ],
  '3': [
    [0, 'center'],
    [2, 'center'],
    [4, 'center'],
  ],
  '4': [
    [0, 'left'],
    [0, 'right'],
    [4, 'left'],
    [4, 'right'],
  ],
  '5': [
    [0, 'left'],
    [0, 'right'],
    [2, 'center'],
    [4, 'left'],
    [4, 'right'],
  ],
  '6': [
    [0, 'left'],
    [0, 'right'],
    [2, 'left'],
    [2, 'right'],
    [4, 'left'],
    [4, 'right'],
  ],
  '7': [
    [0, 'left'],
    [0, 'right'],
    [2, 'left'],
    [2, 'right'],
    [3, 'center'],
    [4, 'left'],
    [4, 'right'],
  ],
  '8': [
    [0, 'left'],
    [0, 'right'],
    [1, 'center'],
    [2, 'left'],
    [2, 'right'],
    [3, 'center'],
    [4, 'left'],
    [4, 'right'],
  ],
  '9': [
    [0, 'left'],
    [0, 'center'],
    [0, 'right'],
    [2, 'left'],
    [2, 'center'],
    [2, 'right'],
    [4, 'left'],
    [4, 'center'],
    [4, 'right'],
  ],
  '10': [
    [0, 'left'],
    [0, 'center'],
    [0, 'right'],
    [1, 'center'],
    [2, 'left'],
    [2, 'right'],
    [3, 'center'],
    [4, 'left'],
    [4, 'center'],
    [4, 'right'],
  ],
}

const PIP_ROW_OFFSET: Record<'ascii' | 'simple', number> = {
  simple: 0,
  ascii: 2,
}

/**
 * Creates the pip layout for a given rank/variant by applying the variant's
 * row offset to the shared normalised pip table.
 */
export function createPipLayout(
  rank: TCardValue,
  variant: 'ascii' | 'simple',
  { left, center, right }: { left: number; center: number; right: number }
): Array<[number, number]> {
  const offset = PIP_ROW_OFFSET[variant]
  const columns: Record<PipColumn, number> = { left, center, right }

  return (PIP_LAYOUTS[rank] ?? []).map(([row, column]) => [
    row + offset,
    columns[column],
  ])
}

/**
 * Creates robot theme card art using the new renderer
 */
function createRobotArt(
  rank: TCardValue,
  suit: string,
  width: number
): string[] {
  if (rank in ROBOT_THEME) {
    const artDefinition = ROBOT_THEME[rank]!
    const features = ROBOT_FEATURES[SYMBOL_SUIT_MAP[suit as TSuitIcon]]
    return renderCardArt(artDefinition, width, {
      ...features,
      suit,
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
  suit: string,
  width: number,
  variant: 'ascii' | 'simple',
  theme: AsciiTheme = 'original'
): string[] {
  const w = width

  if (variant === 'ascii') {
    // Use new renderer for robot theme
    // Pass w - 2 (inner width) consistent with all other art branches, so
    // renderCardArt/padReplacement pads to the inner content width rather
    // than the full card width (which would produce a jagged right edge when
    // the surrounding spacer lines are width - 2).
    if (theme === 'robot') {
      return createRobotArt(rank, suit, w - 2)
    }

    const themeArt = THEME_MAP[theme]
    const replacements = getThemeReplacements(
      theme,
      SYMBOL_SUIT_MAP[suit as TSuitIcon]
    )

    const art = themeArt[rank]?.map((line) => {
      // First replace the suit
      let processedLine = line.replaceAll('{suit}', suit)

      // Then apply theme-specific replacements
      processedLine = applyReplacements(processedLine, replacements)

      return center(processedLine, w - 2)
    })

    return art ?? []
  }

  // Simple variant
  const art = SIMPLE_CARD_ART[rank]?.map((line) => {
    const processedLine = line.replaceAll('{suit}', suit)
    // For Ace and Joker, center the art
    if (rank === 'A' || rank === 'JOKER') {
      return center(processedLine, w - 2)
    }

    // For face cards (J, Q, K), right align the art
    return right(processedLine, w - 2)
  })
  return art ?? []
}

/**
 * Creates the complete card content including borders and pips/art
 */
export function createCardContent(
  rank: TCardValue,
  suit: string,
  variant: 'ascii' | 'simple' | 'minimal',
  config: {
    width: number
    height: number
    pip?: { left: number; center: number; right: number }
    padding: number
  },
  theme: AsciiTheme = 'original'
): string {
  const { width, height } = config

  // Minimal cards need explicit space-filled rows so overlapped stacks repaint
  // the cells from cards underneath them.
  if (variant === 'minimal') {
    // 'JOKER' + suit doesn't fit the minimal variant's narrow inner width, so
    // abbreviate it the same way other multi-char ranks (e.g. '10') stay short.
    const label = rank === 'JOKER' ? `JK${suit}` : `${rank}${suit}`
    return centerLabelBlock(label, width - 2, height - 2)
  }

  const lines: string[] = []
  const isSpecialCard = ['A', 'J', 'Q', 'K', 'JOKER'].includes(rank)

  // Add top border line
  lines.push(createTopLine(rank, suit, width, variant))

  // Add middle content
  if (isSpecialCard) {
    const art = createSpecialArt(rank, suit, width, variant, theme)

    while (lines.length < Math.ceil((height - art.length) / 2) - 2) {
      lines.push(spaces(width - 2))
    }

    lines.push(...art)

    // Pad to full height — contentRows is the fill target before the bottom label row
    const contentRows = height - 3
    while (lines.length < contentRows) {
      lines.push(spaces(width - 2))
    }
  } else if (config.pip) {
    const pipLayout = createPipLayout(
      rank,
      variant === 'simple' ? 'simple' : 'ascii',
      config.pip
    )
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
