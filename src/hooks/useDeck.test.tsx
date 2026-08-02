import { render } from 'ink-testing-library'
import React, { useRef } from 'react'
import test from 'ava'
import { DeckProvider } from '../contexts/DeckContext.js'
import type { TCard } from '../types/index.js'
import { useDeck } from './useDeck.js'

test('useDeck throws when used outside a DeckProvider', (t) => {
  let caught: unknown

  function Probe() {
    try {
      useDeck()
    } catch (error) {
      caught = error
    }

    return null
  }

  render(<Probe />)

  t.true(caught instanceof Error)
  t.is((caught as Error).message, 'useDeck must be used within a DeckProvider')
})

function makeCards(n: number): TCard[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `card-${i}`,
    suit: 'hearts' as const,
    value: 'A' as const,
  }))
}

test('useDeck exposes moveCard/setZone/clearZone/getZone/customZones', (t) => {
  const snapshots: Array<ReturnType<typeof useDeck>> = []

  function Capture() {
    const deck = useDeck()
    const step = useRef(0)
    if (step.current === 0) {
      step.current = 1
      deck.setZone('tableau', makeCards(2))
    } else if (step.current === 1 && deck.customZones['tableau']) {
      step.current = 2
      deck.moveCard('card-0', 'tableau', 'foundation')
    }

    snapshots.push(deck)
    return null
  }

  render(
    <DeckProvider initialCards={makeCards(3)}>
      <Capture />
    </DeckProvider>
  )

  const final = snapshots.at(-1)!
  t.deepEqual(
    final.getZone('tableau').map((c) => c.id),
    ['card-1']
  )
  t.deepEqual(
    final.getZone('foundation').map((c) => c.id),
    ['card-0']
  )
  t.is(final.customZones['tableau']!.length, 1)
})
