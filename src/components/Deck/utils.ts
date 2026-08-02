import {
  type CardProps,
  type TCard,
  type TCardValue,
  type TSuit,
  generateCardId,
  isStandardCard,
} from '../../types/index.js'

/**
 * Creates a standard deck of 52 playing cards, each with a unique ID.
 * Optionally appends jokers (excluded by default to preserve the standard 52-card count).
 */
export function createStandardDeck(options?: { jokers?: number }): TCard[] {
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
      deck.push({ id: generateCardId(suit, value), suit, value })
    }
  }

  const jokerSuits: TSuit[] = ['hearts', 'spades']
  for (let i = 0; i < (options?.jokers ?? 0); i++) {
    const suit = jokerSuits[i % jokerSuits.length]!
    deck.push({ id: generateCardId(suit, 'JOKER'), suit, value: 'JOKER' })
  }

  return deck
}

/**
 * Creates a paired deck of cards for games like Memory.
 * Each value appears an even number of times. Cards are optionally shuffled.
 */
export function createPairedDeck(shufflePairs = true): TCard[] {
  const standardDeck = createStandardDeck()

  // Group cards by their value
  // eslint-disable-next-line unicorn/no-array-reduce
  const groupedByValue = standardDeck.reduce<Map<TCardValue, CardProps[]>>(
    (acc, card) => {
      if (isStandardCard(card)) {
        const { value } = card
        const cards = acc.get(value) ?? []
        cards.push({
          id: generateCardId(card.suit, value),
          value,
          suit: card.suit,
          faceUp: false,
          selected: false,
        })
        acc.set(value, cards)
      }

      return acc
    },
    new Map()
  )

  // Create array of pairs
  const pairs: Array<[CardProps, CardProps]> = []
  for (const [, cards] of groupedByValue) {
    while (cards.length >= 2) {
      const card1 = cards.pop()!
      const card2 = cards.pop()!
      pairs.push([
        { ...card1, faceUp: false },
        { ...card2, faceUp: false },
      ])
    }
  }

  // Randomize the order of pairs (as units) using Fisher-Yates
  if (shufflePairs) {
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pairs[i], pairs[j]] = [pairs[j]!, pairs[i]!]
    }
  }

  // Flatten pairs into sequential array
  return pairs.flat()
}
