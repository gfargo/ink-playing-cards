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

test('useDeck.reorderPlayers dispatches REORDER_PLAYERS', (t) => {
  const snapshots: Array<ReturnType<typeof useDeck>> = []

  function Capture() {
    const deck = useDeck()
    const step = useRef(0)
    if (step.current === 0) {
      step.current = 1
      deck.addPlayer('alice')
    } else if (step.current === 1 && deck.players.includes('alice')) {
      step.current = 2
      deck.addPlayer('bob')
    } else if (step.current === 2 && deck.players.includes('bob')) {
      step.current = 3
      deck.reorderPlayers(['bob', 'alice'])
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
  t.deepEqual(final.players, ['bob', 'alice'])
})

test('useDeck undo/redo reverse and replay a draw when history is enabled', (t) => {
  const snapshots: Array<ReturnType<typeof useDeck>> = []

  function Capture() {
    const deck = useDeck()
    const step = useRef(0)
    if (step.current === 0) {
      step.current = 1
      deck.draw(2, 'p1')
    } else if (step.current === 1 && deck.hands['p1']?.length === 2) {
      step.current = 2
      deck.undo()
    } else if (step.current === 2 && deck.hands['p1'] === undefined) {
      step.current = 3
      deck.redo()
    }

    snapshots.push(deck)
    return null
  }

  render(
    <DeckProvider enableHistory initialCards={makeCards(5)}>
      <Capture />
    </DeckProvider>
  )

  const final = snapshots.at(-1)!
  t.is(final.hands['p1']!.length, 2)
  t.is(final.deck.length, 3)
})

test('useDeck canUndo/canRedo reflect history state', (t) => {
  const snapshots: Array<ReturnType<typeof useDeck>> = []

  function Capture() {
    const deck = useDeck()
    const step = useRef(0)
    if (step.current === 0) {
      step.current = 1
      deck.draw(1, 'p1')
    } else if (step.current === 1 && deck.canUndo) {
      step.current = 2
      deck.undo()
    }

    snapshots.push(deck)
    return null
  }

  render(
    <DeckProvider enableHistory initialCards={makeCards(5)}>
      <Capture />
    </DeckProvider>
  )

  const beforeUndo = snapshots.find((s) => s.hands['p1']?.length === 1)!
  t.true(beforeUndo.canUndo)
  t.false(beforeUndo.canRedo)

  const final = snapshots.at(-1)!
  t.false(final.canUndo)
  t.true(final.canRedo)
})

test('useDeck undo/redo are no-ops when history is disabled', (t) => {
  const snapshots: Array<ReturnType<typeof useDeck>> = []

  function Capture() {
    const deck = useDeck()
    const step = useRef(0)
    if (step.current === 0) {
      step.current = 1
      deck.draw(1, 'p1')
    } else if (step.current === 1) {
      step.current = 2
      deck.undo()
    }

    snapshots.push(deck)
    return null
  }

  render(
    <DeckProvider initialCards={makeCards(5)}>
      <Capture />
    </DeckProvider>
  )

  const final = snapshots.at(-1)!
  t.false(final.canUndo)
  t.false(final.canRedo)
  t.is(final.hands['p1']!.length, 1)
})
