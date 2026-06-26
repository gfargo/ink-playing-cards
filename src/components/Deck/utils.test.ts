import test from 'ava'
import { type CardProps } from '../../types/index.js'
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
