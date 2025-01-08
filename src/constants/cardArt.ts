import type { TCardValue } from '../types/index.js'

/**
 * ASCII art for special cards (face cards and ace) in ASCII variant.
 * Art will be centered within the card.
 * The {suit} placeholder will be replaced with the actual suit symbol.
 */
export const ASCII_CARD_ART: Partial<Record<TCardValue, string[]>> = {
  A: [
    '{suit}',
    '{suit} {suit}',
    '{suit}{suit}{suit}',
    '{suit} {suit}',
    '{suit}',
  ],
  J: ['(^ ^)', '({suit})', '/|\\', '/ \\'],
  Q: ['(o o)', '({suit})', '\\|/', ' | '],
  K: ['\\^/', '({suit})', '/|\\', '/ \\'],
}

/**
 * Simple art for special cards (face cards and ace) in simple variant.
 * Ace art will be centered, face cards will be right-aligned.
 * The {suit} placeholder will be replaced with the actual suit symbol.
 */
export const SIMPLE_CARD_ART: Partial<Record<TCardValue, string[]>> = {
  // Ace is centered
  A: ['', '', '{suit}', '', ''],
  // Face cards are right-aligned
  J: [
    'ww', // Top of head
    '{)', // Face with suit
    '{suit}   %', // Upper body
    '%', // Lower body
    '__%%[', // Base
  ],
  Q: [
    'ww', // Crown
    '{(', // Face with suit
    '{suit}  %%', // Upper dress
    '%%%', // Middle dress
    '_%%%O', // Base dress
  ],
  K: [
    'WW', // Crown
    '{)', // Face with suit
    '{suit}  %%', // Upper body
    '%%%', // Lower body
    '_%%%>', // Base
  ],
}
