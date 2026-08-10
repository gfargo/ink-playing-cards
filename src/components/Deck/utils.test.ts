import test from 'ava'
import { type CardProps } from '../../types/index.js'
import { mulberry32 } from '../../utils/rng.js'
import { createStandardDeck, createPairedDeck } from './utils.js'

function isCardProps(c: unknown): c is CardProps {
  return typeof c === 'object' && c !== null && 'suit' in c && 'value' in c
}

// ---- createStandardDeck ----

test('createStandardDeck returns 52 cards', (t) => {
  t.is(createStandardDeck().length, 52)
})

test('createStandardDeck contains all 4 suits × 13 values', (t) => {
  const deck = createStandardDeck()
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const
  const values = [
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
  ] as const
  for (const suit of suits) {
    for (const value of values) {
      t.true(
        deck
          .filter((c): c is CardProps => isCardProps(c))
          .some((c) => c.suit === suit && c.value === value),
        `missing ${suit}-${value}`
      )
    }
  }
})

test('createStandardDeck has no duplicate ids', (t) => {
  const deck = createStandardDeck()
  const ids = deck.map((c) => c.id)
  t.is(new Set(ids).size, ids.length)
})

test('createStandardDeck({ jokers: 0 }) returns 52 cards', (t) => {
  t.is(createStandardDeck({ jokers: 0 }).length, 52)
})

test('createStandardDeck({ jokers: 2 }) returns 54 cards, 2 of which are jokers', (t) => {
  const deck = createStandardDeck({ jokers: 2 })
  t.is(deck.length, 54)
  const jokers = deck.filter(
    (c): c is CardProps => isCardProps(c) && c.value === 'JOKER'
  )
  t.is(jokers.length, 2)
})

test('createStandardDeck({ jokers: n }) has no duplicate ids', (t) => {
  const deck = createStandardDeck({ jokers: 3 })
  const ids = deck.map((c) => c.id)
  t.is(new Set(ids).size, ids.length)
})

test('createStandardDeck({ rng }) with the same seed produces identical decks', (t) => {
  const a = createStandardDeck({ rng: mulberry32(99) })
  const b = createStandardDeck({ rng: mulberry32(99) })
  t.deepEqual(a, b)
})

// ---- createPairedDeck ----

test('createPairedDeck returns 52 cards (13 values × 4 suits → 2 pairs each = 26 pairs)', (t) => {
  t.is(createPairedDeck().length, 52)
})

test('createPairedDeck(false) also returns 52 cards', (t) => {
  t.is(createPairedDeck(false).length, 52)
})

test('createPairedDeck has even multiplicity per value', (t) => {
  const deck = createPairedDeck()
  const counts = new Map<string, number>()
  for (const card of deck) {
    if (isCardProps(card)) {
      const key = card.value
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  for (const [value, count] of counts) {
    t.is(count % 2, 0, `value ${value} has odd count ${count}`)
  }
})

test('createPairedDeck(false) is deterministic across two calls', (t) => {
  const toKey = (c: unknown) => (isCardProps(c) ? c.value + c.suit : String(c))
  const a = createPairedDeck(false).map((c) => toKey(c))
  const b = createPairedDeck(false).map((c) => toKey(c))
  t.deepEqual(a, b)
})

test('createPairedDeck matched cards share the same suit (visually identical)', (t) => {
  const deck = createPairedDeck(false)
  const counts = new Map<string, number>()
  for (const card of deck) {
    if (isCardProps(card)) {
      const key = `${card.value}-${card.suit}`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  for (const [key, count] of counts) {
    t.is(count, 2, `${key} should appear exactly twice (same suit and value)`)
  }
})

test('createPairedDeck(true) does not always keep matched pairs in adjacent slots', (t) => {
  const deck = createPairedDeck(true)
  let adjacentMatches = 0
  for (let i = 0; i < deck.length; i += 2) {
    const a = deck[i]
    const b = deck[i + 1]
    if (
      isCardProps(a) &&
      isCardProps(b) &&
      a.value === b.value &&
      a.suit === b.suit
    ) {
      adjacentMatches++
    }
  }

  t.true(
    adjacentMatches < 26,
    'every matched pair landed in adjacent slots after shuffling — cards are not being shuffled individually'
  )
})

test('createPairedDeck(true, rng) with the same seed produces identical decks', (t) => {
  const a = createPairedDeck(true, mulberry32(11))
  const b = createPairedDeck(true, mulberry32(11))
  t.deepEqual(a, b)
})
