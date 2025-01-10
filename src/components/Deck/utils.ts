import {
  CardProps,
  type TCard,
  type TCardValue,
  type TSuit,
} from '../../types/index.js'

/**
 * Creates a standard deck of playing cards.
 *
 * @returns {TCard[]} An array representing a standard deck of 52 playing cards.
 *
 * The deck consists of 4 suits: 'hearts', 'diamonds', 'clubs', and 'spades'.
 * Each suit contains 13 values: '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', and 'A'.
 */
export function createStandardDeck(): TCard[] {
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
      deck.push({ suit, value })
    }
  }

  return deck
}

/**
 * Creates a paired deck of cards.
 *
 * This function generates a standard deck of cards, groups them by their value,
 * and creates pairs of cards ensuring each value appears an even number of times.
 * Optionally, the pairs can be shuffled.
 *
 * @param {boolean} [shufflePairs=true] - Whether to shuffle the deck after pairing.
 * @returns {TCard[]} - An array of card pairs in sequential order.
 */
export function createPairedDeck(shufflePairs = true): TCard[] {
  const standardDeck = createStandardDeck()

  // Group cards by their value
  const groupedByValue = standardDeck.reduce<Map<TCardValue, CardProps[]>>(
    (acc, card) => {
      if ('value' in card && 'suit' in card) {
        const value = card.value as TCardValue
        const cards = acc.get(value) || []
        cards.push({
          value,
          suit: card.suit as TSuit,
          faceUp: false,
          selected: false,
        })
        acc.set(value, cards)
      }
      return acc
    },
    new Map()
  )

  // Create array of pairs, ensuring each value appears an even number of times
  const pairs: [CardProps, CardProps][] = []
  groupedByValue.forEach((cards) => {
    // Create as many pairs as possible from the available cards
    while (cards.length >= 2) {
      const card1 = cards.pop()!
      const card2 = cards.pop()!
      pairs.push([
        { ...card1, faceUp: false },
        { ...card2, faceUp: false },
      ])
    }
  })

  // Randomize the order of pairs
  if (shufflePairs) {
    pairs.sort(() => Math.random() - 0.5)
  }

  // Flatten pairs into sequential array: [card1, card1, card2, card2, ...]
  return pairs.flatMap((pair) => pair)
}
