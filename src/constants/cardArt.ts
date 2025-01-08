import type { AsciiTheme, TCardValue, TSuit } from '../types/index.js'

/**
 * ASCII art for special cards (face cards and ace) in ASCII variant.
 * Art will be centered within the card.
 * The {suit} placeholder will be replaced with the actual suit symbol.
 */
export const ORIGINAL_ASCII_CARD_ART: Partial<Record<TCardValue, string[]>> = {
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
 * Animal Kingdom theme ASCII art for face cards.
 * Each suit represents a different family of animals:
 * - Hearts: Big Cats (Lion, Tiger, etc.)
 * - Diamonds: Birds (Eagle, Swan, etc.)
 * - Clubs: Forest Animals (Wolf, Bear, etc.)
 * - Spades: Mystical Creatures
 */
export const ANIMAL_CARD_ART: Partial<Record<TCardValue, string[]>> = {
  A: [
    '  {suit}  ',
    ' {eyes} ',
    '{mouth}',
    ' \\|/ ',
    '  V  ',
  ],
  K: [
    ' ^{eyes}^ ',  // King - Majestic animal
    ' ┌{fur}┐ ',   // Mane/Feathers/Fur
    ' │{suit}│ ',  // Body with suit
    ' └{paw}┘ ',   // Paws/Claws
  ],
  Q: [
    ' /{eyes}\\ ',  // Queen - Graceful animal
    '╭{fur}╮',     // Elegant features
    '│{suit}│',    // Body with suit
    '╰{paw}╯',     // Graceful stance
  ],
  J: [
    ' ({eyes}) ',  // Jack - Young animal
    ' ┌{fur}┐ ',   // Playful features
    ' │{suit}│ ',  // Body with suit
    ' └{paw}┘ ',   // Small paws
  ],
}

/**
 * Abstract Geometric theme ASCII art for face cards.
 * Each suit uses different geometric shapes:
 * - Hearts: Diamonds (◇, ◆)
 * - Diamonds: Circles (○, ●)
 * - Clubs: Squares (□, ■)
 * - Spades: Triangles (▲, ▼)
 */
export const GEOMETRIC_CARD_ART: Partial<Record<TCardValue, string[]>> = {
  A: [
    '  ╱╲  ',
    ' ╱ {suit}╲ ',
    '╱────╲',
    '‾‾‾‾',
  ],
  K: [
    '┌─{outline}─┐',   // Crown
    '│{filled}│',      // Center piece
    '├{outline}┤',     // Middle section
    '└{filled}┘',      // Base
  ],
  Q: [
    '╭{outline}╮',     // Elegant top
    '│{filled}│',      // Center with fill
    '├{outline}┤',     // Decorated middle
    '╰{filled}╯',      // Curved base
  ],
  J: [
    '┌{outline}┐',     // Simple top
    '│{filled}│',      // Center piece
    '├{outline}┤',     // Middle bar
    '└{filled}┘',      // Base
  ],
}

/**
 * Pixel art style theme
 */
export const PIXEL_CARD_ART: Partial<Record<TCardValue, string[]>> = {
  A: [
    '▀▄▀▄▀',
    '▄{suit}▄',
    '▀▄▀▄▀',
    '▄▀▄▀▄',
  ],
  K: [
    '▄▀{crown}▀▄',  // Pixelated crown
    '█{face}█',     // Face pixels
    '▀{suit}▀',     // Body with suit
    '█{base}█',     // Base pixels
  ],
  Q: [
    '▀▄{crown}▄▀',  // Crown pixels
    '█{face}█',     // Face details
    '▄{suit}▄',     // Body with suit
    '▀{base}▀',     // Base pixels
  ],
  J: [
    '▄▀{crown}▀▄',  // Simple crown
    '█{face}█',     // Basic face
    '▀{suit}▀',     // Body with suit
    '█{base}█',     // Base pixels
  ],
}

/**
 * Medieval/Fantasy theme using pure ASCII/box-drawing characters
 */
export const MEDIEVAL_CARD_ART: Partial<Record<TCardValue, string[]>> = {
  A: [
    '╔═╤═╗',        // Castle-like top
    '║{deco}║',     // Decorative frame
    '║{suit}║',     // Centered suit
    '║{deco}║',     // Decorative frame
    '╚═╧═╝',        // Castle-like bottom
  ],
  K: [
    '╔═╦═╗',        // King's crown
    '║{crown}║',    // Crown design
    '║{suit}║',     // Royal suit
    '║{class}║',    // Class emblem
    '╚{base}╝',     // Ornate base
  ],
  Q: [
    '╔╤═╤╗',        // Queen's crown peaks
    '╠═╪═╣',        // Crown band
    '║{suit}║',     // Royal suit
    '║{class}║',    // Class emblem
    '╚{base}╝',     // Ornate base
  ],
  J: [
    '╔╤═╤╗',        // Knight's helm
    '║{crown}║',    // Helm design
    '║{suit}║',     // Royal suit
    '║{class}║',    // Class emblem
    '╚{base}╝',     // Ornate base
  ],
}

/**
 * Map of geometric symbols for each suit
 */
export const GEOMETRIC_SYMBOLS: Record<TSuit, { outline: string; filled: string }> = {
  hearts: { outline: '◇', filled: '◆' },
  diamonds: { outline: '○', filled: '●' },
  clubs: { outline: '□', filled: '■' },
  spades: { outline: '▲', filled: '▼' },
}

/**
 * Map of animal characteristics for each suit
 */
export const ANIMAL_FEATURES: Record<TSuit, { eyes: string; mouth: string; fur: string; paw: string }> = {
  hearts: {
    eyes: 'owo',      // Lion features
    mouth: '(=w=)',
    fur: '=^-^=',     // Mane pattern
    paw: '(uwu)',     // Paw prints
  },
  diamonds: {
    eyes: '>v<',      // Bird features
    mouth: '(>v<)',
    fur: '~^v^~',     // Wing pattern
    paw: '{>v<}',     // Talon marks
  },
  clubs: {
    eyes: 'ÒwÓ',      // Wolf features
    mouth: '(^w^)',
    fur: '~òwó~',     // Fur pattern
    paw: '[owo]',     // Paw prints
  },
  spades: {
    eyes: '◇w◇',      // Dragon features
    mouth: '{◇w◇}',
    fur: '=◇w◇=',     // Scale pattern
    paw: '<◇w◇>',     // Claw marks
  },
}

/**
 * Map of pixel art features for each suit
 */
export const PIXEL_FEATURES: Record<TSuit, { crown: string; face: string; base: string }> = {
  hearts: {
    crown: '♥',    // Heart crown
    face: '▀▄▀',   // Face pixels
    base: '▄▀▄',   // Base pixels
  },
  diamonds: {
    crown: '♦',    // Diamond crown
    face: '▄▀▄',   // Face pixels
    base: '▀▄▀',   // Base pixels
  },
  clubs: {
    crown: '♣',    // Club crown
    face: '▀█▀',   // Face pixels
    base: '█▀█',   // Base pixels
  },
  spades: {
    crown: '♠',    // Spade crown
    face: '█▄█',   // Face pixels
    base: '▀█▀',   // Base pixels
  },
}

/**
 * Map of medieval features for each suit using ASCII/box-drawing characters
 */
export const MEDIEVAL_FEATURES: Record<TSuit, {
  class: string;
  crown: string;
  deco: string;
  base: string;
}> = {
  hearts: {
    class: '>=<',        // Warrior - sword
    crown: '\\^/',       // King's crown
    deco: '>=<',         // Shield pattern
    base: '/=\\',        // Base pattern
  },
  diamonds: {
    class: '*^*',        // Mage - stars
    crown: '/|\\',       // Wizard's hat
    deco: '*~*',         // Magic pattern
    base: '\\|/',        // Base pattern
  },
  clubs: {
    class: '(+)',        // Druid - nature
    crown: '{o}',        // Nature crown
    deco: '(~)',         // Leaf pattern
    base: '{-}',         // Base pattern
  },
  spades: {
    class: '/-\\',       // Rogue - dagger
    crown: '[^]',        // Hood
    deco: '/|\\',        // Shadow pattern
    base: '\\-/',        // Base pattern
  },
}

// Theme mapping
export const THEME_MAP: Record<AsciiTheme, Partial<Record<TCardValue, string[]>>> = {
  'original': ORIGINAL_ASCII_CARD_ART,
  'geometric': GEOMETRIC_CARD_ART,
  'animal': ANIMAL_CARD_ART,
  'pixel': PIXEL_CARD_ART,
  'medieval': MEDIEVAL_CARD_ART,
  'robot': {},
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
    'ww',      // Top of head
    '{)',      // Face with suit
    '{suit}   %', // Upper body
    '%',       // Lower body
    '__%%[',   // Base
  ],
  Q: [
    'ww',      // Crown
    '{(',      // Face with suit
    '{suit}  %%', // Upper dress
    '%%%',     // Middle dress
    '_%%%O',   // Base dress
  ],
  K: [
    'WW',      // Crown
    '{)',      // Face with suit
    '{suit}  %%', // Upper body
    '%%%',     // Lower body
    '_%%%>',   // Base
  ],
}
