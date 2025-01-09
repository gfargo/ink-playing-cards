import type { TSuit, TSuitIcon } from '../types/index.js'

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
