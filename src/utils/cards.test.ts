import test from 'ava'
import { generateCardId } from './cards.js'
import { mulberry32 } from './rng.js'

test('generateCardId follows the suit-value-random pattern', (t) => {
  const id = generateCardId('hearts', 'A')
  t.regex(id, /^hearts-A-[\da-z]+$/)
})

test('generateCardId with a seeded rng is reproducible', (t) => {
  const idA = generateCardId('spades', 'K', mulberry32(7))
  const idB = generateCardId('spades', 'K', mulberry32(7))
  t.is(idA, idB)
})

test('generateCardId with different seeds differs', (t) => {
  const idA = generateCardId('clubs', 'Q', mulberry32(1))
  const idB = generateCardId('clubs', 'Q', mulberry32(2))
  t.not(idA, idB)
})
