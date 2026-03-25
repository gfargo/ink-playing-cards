import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { createTarotDeck } from './utils.js'
import { TarotCard } from './index.js'

// ── Major Arcana rendering ──────────────────────────────────────────

test('render Major Arcana: The Fool (0)', (t) => {
  const { lastFrame } = render(
    <TarotCard id="fool" arcana="major" majorIndex={0} />
  )
  t.snapshot(lastFrame())
})

test('render Major Arcana: The Magician (1)', (t) => {
  const { lastFrame } = render(
    <TarotCard id="magician" arcana="major" majorIndex={1} />
  )
  t.snapshot(lastFrame())
})

test('render Major Arcana: Death (13)', (t) => {
  const { lastFrame } = render(
    <TarotCard id="death" arcana="major" majorIndex={13} />
  )
  t.snapshot(lastFrame())
})

test('render Major Arcana: The World (21)', (t) => {
  const { lastFrame } = render(
    <TarotCard id="world" arcana="major" majorIndex={21} />
  )
  t.snapshot(lastFrame())
})

test('render Major Arcana reversed', (t) => {
  const { lastFrame } = render(
    <TarotCard reversed id="fool-rev" arcana="major" majorIndex={0} />
  )
  t.snapshot(lastFrame())
})

// ── Minor Arcana rendering ──────────────────────────────────────────

test('render Minor Arcana: Ace of Cups', (t) => {
  const { lastFrame } = render(
    <TarotCard id="ace-cups" arcana="minor" suit="cups" value="Ace" />
  )
  t.snapshot(lastFrame())
})

test('render Minor Arcana: 7 of Swords', (t) => {
  const { lastFrame } = render(
    <TarotCard id="7-swords" arcana="minor" suit="swords" value="7" />
  )
  t.snapshot(lastFrame())
})

test('render Minor Arcana: 10 of Pentacles', (t) => {
  const { lastFrame } = render(
    <TarotCard id="10-pent" arcana="minor" suit="pentacles" value="10" />
  )
  t.snapshot(lastFrame())
})

test('render Minor Arcana: Queen of Wands', (t) => {
  const { lastFrame } = render(
    <TarotCard id="queen-wands" arcana="minor" suit="wands" value="Queen" />
  )
  t.snapshot(lastFrame())
})

test('render Minor Arcana: Knight of Cups', (t) => {
  const { lastFrame } = render(
    <TarotCard id="knight-cups" arcana="minor" suit="cups" value="Knight" />
  )
  t.snapshot(lastFrame())
})

test('render Minor Arcana reversed', (t) => {
  const { lastFrame } = render(
    <TarotCard
      reversed
      id="3-wands-rev"
      arcana="minor"
      suit="wands"
      value="3"
    />
  )
  t.snapshot(lastFrame())
})

// ── Face down / selected ────────────────────────────────────────────

test('render face down tarot card', (t) => {
  const { lastFrame } = render(
    <TarotCard id="facedown" arcana="major" majorIndex={5} faceUp={false} />
  )
  t.snapshot(lastFrame())
})

test('render selected tarot card', (t) => {
  const { lastFrame } = render(
    <TarotCard
      selected
      id="selected"
      arcana="minor"
      suit="swords"
      value="King"
    />
  )
  t.snapshot(lastFrame())
})

// ── Custom styling ──────────────────────────────────────────────────

test('render with custom colors', (t) => {
  const { lastFrame } = render(
    <TarotCard
      id="custom-colors"
      arcana="major"
      majorIndex={15}
      borderColor="red"
      textColor="red"
      artColor="red"
    />
  )
  t.snapshot(lastFrame())
})

test('render with custom art override', (t) => {
  const { lastFrame } = render(
    <TarotCard
      id="custom-art"
      arcana="major"
      majorIndex={17}
      asciiArt={'  ★ ★ ★  \n ★   ★ \n  ★ ★ ★  '}
    />
  )
  t.snapshot(lastFrame())
})

// ── createTarotDeck utility ─────────────────────────────────────────

test('createTarotDeck returns 78 cards', (t) => {
  const deck = createTarotDeck()
  t.is(deck.length, 78)
})

test('createTarotDeck has 22 Major Arcana', (t) => {
  const deck = createTarotDeck()
  const majors = deck.filter((c) => c.arcana === 'major')
  t.is(majors.length, 22)
})

test('createTarotDeck has 56 Minor Arcana', (t) => {
  const deck = createTarotDeck()
  const minors = deck.filter((c) => c.arcana === 'minor')
  t.is(minors.length, 56)
})

test('createTarotDeck has 14 cards per suit', (t) => {
  const deck = createTarotDeck()
  const minors = deck.filter((c) => c.arcana === 'minor')
  for (const suit of ['wands', 'cups', 'swords', 'pentacles'] as const) {
    const suitCards = minors.filter((c) => c.suit === suit)
    t.is(suitCards.length, 14, `${suit} should have 14 cards`)
  }
})

test('createTarotDeck cards have unique IDs', (t) => {
  const deck = createTarotDeck()
  const ids = new Set(deck.map((c) => c.id))
  t.is(ids.size, 78)
})

test('createTarotDeck Major Arcana indices are 0–21', (t) => {
  const deck = createTarotDeck()
  const majors = deck.filter((c) => c.arcana === 'major')
  const indices = majors.map((c) => c.majorIndex).sort((a, b) => a - b)
  t.deepEqual(
    indices,
    Array.from({ length: 22 }, (_, i) => i)
  )
})
