import type { TextProps } from 'ink'
import type { CardTheme, TSuit, TSuitIcon } from '../types/index.js'

/**
 * Defines the dimensions and layout configuration for different card variants
 */
export const CARD_DIMENSIONS = {
  ascii: {
    width: 15,
    height: 13,
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
} as const

/**
 * Maps suit names to their corresponding Unicode symbols
 */
export const SUIT_SYMBOL_MAP: Record<TSuit, TSuitIcon> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
} as const

export const SYMBOL_SUIT_MAP: Record<TSuitIcon, TSuit> = {
  '♥': 'hearts',
  '♦': 'diamonds',
  '♣': 'clubs',
  '♠': 'spades',
} as const

const RED_SUITS = new Set<TSuit>(['hearts', 'diamonds'])

/**
 * Returns the Ink text color for a given suit.
 *
 * Red suits (hearts, diamonds) → 'red'.
 * Black suits (clubs, spades) → 'white' (white renders correctly on dark terminals).
 *
 * When a `theme` is supplied, its `suitColors` map is used instead, and
 * `monochrome` forces the terminal default (undefined) regardless of suit.
 */
export function getSuitColor(
  suit: TSuit,
  theme?: Pick<CardTheme, 'suitColors' | 'monochrome'>
): TextProps['color'] {
  if (theme) {
    return theme.monochrome ? undefined : theme.suitColors[suit]
  }

  return RED_SUITS.has(suit) ? 'red' : 'white'
}
