import type { TSuit, TCardValue } from '../../types/index.js'

/**
 * Unicode code points for playing cards
 * Base values for each suit:
 * Spades:   0x1F0A0
 * Hearts:   0x1F0B0
 * Diamonds: 0x1F0C0
 * Clubs:    0x1F0D0
 */
const SUIT_BASE = {
  spades: 0x1_f0_a0,
  hearts: 0x1_f0_b0,
  diamonds: 0x1_f0_c0,
  clubs: 0x1_f0_d0,
} as const

/**
 * Value offsets from the suit base for each card value
 */
const VALUE_OFFSET: Record<TCardValue, number> = {
  A: 0x1,
  '2': 0x2,
  '3': 0x3,
  '4': 0x4,
  '5': 0x5,
  '6': 0x6,
  '7': 0x7,
  '8': 0x8,
  '9': 0x9,
  '10': 0xa,
  J: 0xb,
  Q: 0xd,
  K: 0xe,
  JOKER: 0xf,
} as const

/**
 * Special card Unicode points
 */
export const SPECIAL_CARDS = {
  CARD_BACK: String.fromCodePoint(0x1_f0_a0),
  RED_JOKER: String.fromCodePoint(0x1_f0_bf),
  BLACK_JOKER: String.fromCodePoint(0x1_f0_cf),
  WHITE_JOKER: String.fromCodePoint(0x1_f0_df),
} as const

/**
 * Get the Unicode character for a specific card
 */
export function getCardUnicode(suit: TSuit, value: TCardValue): string {
  // Handle jokers
  if (value === 'JOKER') {
    return suit === 'hearts'
      ? SPECIAL_CARDS.RED_JOKER
      : suit === 'spades'
        ? SPECIAL_CARDS.BLACK_JOKER
        : SPECIAL_CARDS.WHITE_JOKER
  }

  // Regular cards
  const baseCodePoint = SUIT_BASE[suit]
  const offset = VALUE_OFFSET[value]
  return String.fromCodePoint(baseCodePoint + offset)
}
