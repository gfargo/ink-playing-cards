import {
  type CardProps,
  type TCard,
  type TCardValue,
  type TSuit,
} from '../../types/index.js'
import { generateCardId } from '../../utils/cards.js'

/**
 * Creates a standard deck of 52 playing cards, each with a unique ID.
 * Optionally appends jokers (excluded by default to preserve the standard 52-card count).
 * `rng` defaults to `Math.random`; pass a seeded RNG for deterministic IDs.
 */
export function createStandardDeck(options?: {
  jokers?: number
  rng?: () => number
}): TCard[] {
  const rng = options?.rng ?? Math.random
  const suits: TSuit[] = ['hearts', 'diamonds', 'clubs', 'spades']
  const values: TCardValue[] = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
    'A',
  ]
  const deck: TCard[] = []

  for (const suit of suits) {
    for (const value of values) {
      deck.push({ id: generateCardId(suit, value, rng), suit, value })
    }
  }

  const jokerSuits: TSuit[] = ['hearts', 'spades']
  for (let i = 0; i < (options?.jokers ?? 0); i++) {
    const suit = jokerSuits[i % jokerSuits.length]!
    deck.push({ id: generateCardId(suit, 'JOKER', rng), suit, value: 'JOKER' })
  }

  return deck
}

/**
 * Creates a paired deck of cards for games like Memory/Concentration.
 * Each value appears twice per suit it's dealt in (two matched pairs per
 * value, one per half-deck), and both cards in a pair share the same suit
 * (so face-up they look identical). Cards are optionally shuffled as
 * individual cards (not as pair units), so matched pairs don't predictably
 * land in adjacent slots.
 *
 * A 52-card deck only has room for 2 pairs (4 cards) per value, so each
 * value is necessarily limited to 2 of the 4 suits — a 4-suit spread per
 * value would require doubling the deck to 104 cards. To still spread suit
 * variety across the deck as a whole, the two suits used per value cycle
 * through all 6 unordered suit combinations (not just 4 adjacent-suit
 * rotations), so every suit pairing appears somewhere in the deck.
 * `rng` defaults to `Math.random`; pass a seeded RNG for deterministic
 * IDs and shuffle order.
 */
export function createPairedDeck(
  shufflePairs = true,
  rng: () => number = Math.random
): TCard[] {
  const values: TCardValue[] = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
    'A',
  ]
  const suits: TSuit[] = ['hearts', 'diamonds', 'clubs', 'spades']
  const suitPairs: Array<[TSuit, TSuit]> = []
  for (let i = 0; i < suits.length; i++) {
    for (let j = i + 1; j < suits.length; j++) {
      suitPairs.push([suits[i]!, suits[j]!])
    }
  }

  // Each value gets two matched pairs, built from two half-decks (a suit
  // pair drawn from all 6 possible suit combinations, cycled across
  // values) rather than mixing all four suits together, so every matched
  // pair is visually identical (same suit and value).
  const deck: Array<CardProps & { id: string }> = []
  for (const [index, value] of values.entries()) {
    const [suitA, suitB] = suitPairs[index % suitPairs.length]!
    for (const suit of [suitA, suitB]) {
      for (let copy = 0; copy < 2; copy++) {
        deck.push({
          id: generateCardId(suit, value, rng),
          value,
          suit,
          faceUp: false,
          selected: false,
        })
      }
    }
  }

  // Shuffle individual cards (not pair units) using Fisher-Yates, so matched
  // pairs are scattered across the deck rather than always adjacent.
  if (shufflePairs) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[deck[i], deck[j]] = [deck[j]!, deck[i]!]
    }
  }

  return deck
}
