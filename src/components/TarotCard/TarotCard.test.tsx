import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { mulberry32 } from '../../utils/rng.js'
import { DrawCardEffect } from '../../systems/Effects.js'
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

test('effects prop forwards to CustomCard and renders an indicator', (t) => {
  const withEffects = render(
    <TarotCard
      id="fool-fx"
      arcana="major"
      majorIndex={0}
      effects={[new DrawCardEffect(1)]}
    />
  ).lastFrame()
  const withoutEffects = render(
    <TarotCard id="fool-fx" arcana="major" majorIndex={0} />
  ).lastFrame()
  t.not(withEffects, withoutEffects)
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

// ── Regression guards (OSS-1783) ─────────────────────────────────────

/**
 * Strip ANSI escape codes so we can inspect plain rendered text.
 */
function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replaceAll(/\u001B\[[\d;]*m/g, '')
}

test('Major Arcana: numeral appears exactly once, on the last inner row (bottom)', (t) => {
  // The Fool has numeral "0". It should appear once, in the footer (last row
  // before the border), never in the header (first row).
  const { lastFrame } = render(
    <TarotCard id="fool-reg" arcana="major" majorIndex={0} />
  )
  const frame = lastFrame() ?? ''
  const plain = stripAnsi(frame)
  const rows = plain.split('\n')

  // Count occurrences of "0" across the whole card
  const totalOccurrences = rows.filter((r) => r.includes('0')).length
  t.is(totalOccurrences, 1, 'numeral "0" should appear in exactly one row')

  // The numeral must be in the last inner row (second-to-last overall row)
  const lastInnerRow = rows.at(-2) ?? ''
  t.true(
    lastInnerRow.includes('0'),
    'numeral "0" should be on the last inner (footer) row'
  )

  // The header row (first inner row, index 1) must NOT contain the numeral
  const headerRow = rows[1] ?? ''
  t.false(headerRow.includes('0'), 'header row should not contain the numeral')
})

test('Major Arcana: multi-char numeral (XIII) appears once, on bottom row', (t) => {
  // Death has numeral "XIII".
  const { lastFrame } = render(
    <TarotCard id="death-reg" arcana="major" majorIndex={13} />
  )
  const frame = lastFrame() ?? ''
  const plain = stripAnsi(frame)
  const rows = plain.split('\n')

  const occurrences = rows.filter((r) => r.includes('XIII')).length
  t.is(occurrences, 1, 'numeral "XIII" should appear in exactly one row')

  const lastInnerRow = rows.at(-2) ?? ''
  t.true(
    lastInnerRow.includes('XIII'),
    '"XIII" should be on the last inner row'
  )
})

test('Major Arcana reversed: numeral still appears once at bottom', (t) => {
  // The Fool reversed: typeLine becomes "⟳ Reversed", numeral "0" stays in footer.
  const { lastFrame } = render(
    <TarotCard reversed id="fool-rev-reg" arcana="major" majorIndex={0} />
  )
  const frame = lastFrame() ?? ''
  const plain = stripAnsi(frame)
  const rows = plain.split('\n')

  const occurrences = rows.filter((r) => r.includes('0')).length
  t.is(
    occurrences,
    1,
    'numeral "0" should appear in exactly one row when reversed'
  )

  const lastInnerRow = rows.at(-2) ?? ''
  t.true(
    lastInnerRow.includes('0'),
    '"0" should be on the last inner row when reversed'
  )
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

test('createTarotDeck(rng) with the same seed produces identical IDs', (t) => {
  const a = createTarotDeck(mulberry32(3)).map((c) => c.id)
  const b = createTarotDeck(mulberry32(3)).map((c) => c.id)
  t.deepEqual(a, b)
})
