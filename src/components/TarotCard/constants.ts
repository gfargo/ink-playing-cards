/**
 * Tarot card constants — Major Arcana definitions and ASCII art.
 */

/**
 * All 22 Major Arcana cards in order (0–XXI).
 */
export const MAJOR_ARCANA = [
  { numeral: '0', name: 'The Fool' },
  { numeral: 'I', name: 'The Magician' },
  { numeral: 'II', name: 'The High Priestess' },
  { numeral: 'III', name: 'The Empress' },
  { numeral: 'IV', name: 'The Emperor' },
  { numeral: 'V', name: 'The Hierophant' },
  { numeral: 'VI', name: 'The Lovers' },
  { numeral: 'VII', name: 'The Chariot' },
  { numeral: 'VIII', name: 'Strength' },
  { numeral: 'IX', name: 'The Hermit' },
  { numeral: 'X', name: 'Wheel of Fortune' },
  { numeral: 'XI', name: 'Justice' },
  { numeral: 'XII', name: 'The Hanged Man' },
  { numeral: 'XIII', name: 'Death' },
  { numeral: 'XIV', name: 'Temperance' },
  { numeral: 'XV', name: 'The Devil' },
  { numeral: 'XVI', name: 'The Tower' },
  { numeral: 'XVII', name: 'The Star' },
  { numeral: 'XVIII', name: 'The Moon' },
  { numeral: 'XIX', name: 'The Sun' },
  { numeral: 'XX', name: 'Judgement' },
  { numeral: 'XXI', name: 'The World' },
] as const

/**
 * Tarot suit icons for Minor Arcana.
 */
export const TAROT_SUIT_ICONS: Record<string, string> = {
  wands: '🜂',
  cups: '☽',
  swords: '⚔',
  pentacles: '⛤',
}

/**
 * Minor Arcana court card names.
 */
export const MINOR_COURT = ['Page', 'Knight', 'Queen', 'King'] as const

/**
 * Minor Arcana pip values (Ace through 10).
 */
export const MINOR_PIPS = [
  'Ace',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
] as const

/**
 * ASCII art for Major Arcana cards.
 * Each entry is a compact multi-line string sized for the default tarot card dimensions.
 */
export const MAJOR_ARCANA_ART: Record<string, string> = {
  'The Fool': [
    '    O    ',
    '   /|\\   ',
    '  / | \\  ',
    '   / \\   ',
    '  ~   ~  ',
    '  /\\_/\\  ',
    ' ( o.o ) ',
  ].join('\n'),
  'The Magician': [
    '    ∞    ',
    '   \\|/   ',
    '  --|--  ',
    '   /|\\   ',
    ' 🜂 ☽ ⚔ ⛤',
    '  ═════  ',
  ].join('\n'),
  'The High Priestess': [
    '  B   J  ',
    '  ║   ║  ',
    '   ☽☽☽   ',
    '  ╔═══╗  ',
    '  ║ ☾ ║  ',
    '  ╚═══╝  ',
  ].join('\n'),
  'The Empress': [
    '  ♀   ♀  ',
    '  ╔═══╗  ',
    '  ║ ♛ ║  ',
    '  ╚═══╝  ',
    ' ❀ ❀ ❀ ❀',
    '  ═════  ',
  ].join('\n'),
  'The Emperor': [
    '  ♂   ♂  ',
    '  ╔═══╗  ',
    '  ║ ♚ ║  ',
    '  ╚═══╝  ',
    '  ▓▓▓▓▓  ',
    '  ═════  ',
  ].join('\n'),
  'The Hierophant': [
    '   ╬╬╬   ',
    '  ╔═══╗  ',
    '  ║ ✝ ║  ',
    '  ╚═══╝  ',
    '  ♱   ♱  ',
    '  ═════  ',
  ].join('\n'),
  'The Lovers': [
    '   ☀☀☀   ',
    '  ♡   ♡  ',
    '  \\   /  ',
    '   \\ /   ',
    '    ♥    ',
    '  ═════  ',
  ].join('\n'),
  'The Chariot': [
    '   ★★★   ',
    '  ╔═══╗  ',
    '  ║ ⚡ ║  ',
    '  ╚═╦═╝  ',
    '  ◄ ║ ►  ',
    '  ○   ○  ',
  ].join('\n'),
  Strength: [
    '    ∞    ',
    '   /|\\   ',
    '  / | \\  ',
    '  ╔═══╗  ',
    '  ║ 🦁║  ',
    '  ╚═══╝  ',
  ].join('\n'),
  'The Hermit': [
    '   ☆☆☆   ',
    '    ╱    ',
    '   ╱     ',
    '  ╱  ☼   ',
    '  │      ',
    '  ═════  ',
  ].join('\n'),
  'Wheel of Fortune': [
    '  ╭───╮  ',
    '  │ ☉ │  ',
    '  ╰─┬─╯  ',
    '  ╭─┴─╮  ',
    '  │ ⟳ │  ',
    '  ╰───╯  ',
  ].join('\n'),
  Justice: [
    '   ⚖⚖⚖   ',
    '  ╔═══╗  ',
    '  ║ ⚖ ║  ',
    '  ╚═══╝  ',
    '  │   │  ',
    '  ═════  ',
  ].join('\n'),
  'The Hanged Man': [
    '  ═════  ',
    '    │    ',
    '   ╱│╲   ',
    '    │    ',
    '   ╱ ╲   ',
    '  △   △  ',
  ].join('\n'),
  Death: [
    '   ☠☠☠   ',
    '  ╔═══╗  ',
    '  ║ ☠ ║  ',
    '  ╚═══╝  ',
    '  ⚰   ⚰  ',
    '  ═════  ',
  ].join('\n'),
  Temperance: [
    '   △△△   ',
    '  ╱   ╲  ',
    '  │ ≈ │  ',
    '  ╲   ╱  ',
    '   ╲ ╱   ',
    '    ▽    ',
  ].join('\n'),
  'The Devil': [
    '   ⛧⛧⛧   ',
    '  ╔═══╗  ',
    '  ║ ⛧ ║  ',
    '  ╚═══╝  ',
    '  ⛓   ⛓  ',
    '  ═════  ',
  ].join('\n'),
  'The Tower': [
    '   ⚡⚡⚡   ',
    '  ╔═══╗  ',
    '  ║ ▓ ║  ',
    '  ║ ▓ ║  ',
    '  ╚═══╝  ',
    '  ▓▓▓▓▓  ',
  ].join('\n'),
  'The Star': [
    '   ★★★   ',
    '    ☆    ',
    '  ☆   ☆  ',
    '    ☆    ',
    '  ≈≈≈≈≈  ',
    '  ═════  ',
  ].join('\n'),
  'The Moon': [
    '   ☾☾☾   ',
    '    ☾    ',
    '  ╱   ╲  ',
    '  │ ≈ │  ',
    '  ╲   ╱  ',
    '  ═════  ',
  ].join('\n'),
  'The Sun': [
    '   ☀☀☀   ',
    '  ╲ ☀ ╱  ',
    '  ─ ☀ ─  ',
    '  ╱ ☀ ╲  ',
    '  ❀ ❀ ❀  ',
    '  ═════  ',
  ].join('\n'),
  Judgement: [
    '   ♱♱♱   ',
    '  ╔═══╗  ',
    '  ║ ♱ ║  ',
    '  ╚═══╝  ',
    '  △ △ △  ',
    '  ═════  ',
  ].join('\n'),
  'The World': [
    '  ╭───╮  ',
    '  │ ◯ │  ',
    '  │╱ ╲│  ',
    '  │╲ ╱│  ',
    '  │ ◯ │  ',
    '  ╰───╯  ',
  ].join('\n'),
}
