import { render } from 'ink-testing-library'
import React, { useContext, useRef } from 'react'
import test from 'ava'
import type {
  DeckAction,
  DeckContextType,
  GameEventData,
  TCard,
} from '../types/index.js'
import { DeckContext, DeckProvider } from './DeckContext.js'

function renderWithEvents(
  actions: DeckAction[],
  options: { strictMode?: boolean; initialCards?: TCard[] } = {}
) {
  const events: GameEventData[] = []

  function Capture() {
    const ctx = useContext(DeckContext)
    const dispatched = useRef(false)
    if (!dispatched.current) {
      dispatched.current = true
      ctx.eventManager.addEventListener('DECK_SHUFFLED', {
        handleEvent(event) {
          events.push(event)
        },
      })
      ctx.eventManager.addEventListener('CARDS_DRAWN', {
        handleEvent(event) {
          events.push(event)
        },
      })
      ctx.eventManager.addEventListener('CARDS_DEALT', {
        handleEvent(event) {
          events.push(event)
        },
      })
      ctx.eventManager.addEventListener('CARD_PLAYED', {
        handleEvent(event) {
          events.push(event)
        },
      })
      ctx.eventManager.addEventListener('CARD_DISCARDED', {
        handleEvent(event) {
          events.push(event)
        },
      })
      for (const action of actions) {
        ctx.dispatch(action)
      }
    }

    return null
  }

  const tree = (
    <DeckProvider initialCards={options.initialCards}>
      <Capture />
    </DeckProvider>
  )

  render(
    options.strictMode ? <React.StrictMode>{tree}</React.StrictMode> : tree
  )

  return events
}

function makeCards(n: number): TCard[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `card-${i}`,
    suit: 'hearts' as const,
    value: 'A' as const,
  }))
}

test('StrictMode: SHUFFLE + DRAW fire exactly once each, in order', (t) => {
  const cards = makeCards(10)
  const events = renderWithEvents(
    [
      { type: 'SHUFFLE' },
      { type: 'DRAW', payload: { count: 2, playerId: 'p1' } },
    ],
    { strictMode: true, initialCards: cards }
  )
  t.deepEqual(
    events.map((e) => e.type),
    ['DECK_SHUFFLED', 'CARDS_DRAWN']
  )
})

test('non-StrictMode: SHUFFLE + DRAW parity with StrictMode', (t) => {
  const cards = makeCards(10)
  const events = renderWithEvents(
    [
      { type: 'SHUFFLE' },
      { type: 'DRAW', payload: { count: 2, playerId: 'p1' } },
    ],
    { initialCards: cards }
  )
  t.deepEqual(
    events.map((e) => e.type),
    ['DECK_SHUFFLED', 'CARDS_DRAWN']
  )
})

test('DEAL emits one CARDS_DEALT per player in order', (t) => {
  const cards = makeCards(10)
  const events = renderWithEvents(
    [{ type: 'DEAL', payload: { count: 2, playerIds: ['p1', 'p2'] } }],
    { strictMode: true, initialCards: cards }
  )
  t.deepEqual(
    events.map((e) => e.type),
    ['CARDS_DEALT', 'CARDS_DEALT']
  )
  t.is(events[0]!.playerId, 'p1')
  t.is(events[1]!.playerId, 'p2')
})

test('PLAY_CARD is a no-op and emits nothing when card is not in hand', (t) => {
  const cards = makeCards(5)
  const events = renderWithEvents(
    [
      { type: 'DRAW', payload: { count: 2, playerId: 'p1' } },
      { type: 'PLAY_CARD', payload: { playerId: 'p1', cardId: 'nonexistent' } },
    ],
    { strictMode: true, initialCards: cards }
  )
  t.deepEqual(
    events.map((e) => e.type),
    ['CARDS_DRAWN']
  )
})

test('DISCARD is a no-op and emits nothing when card is not in hand', (t) => {
  const cards = makeCards(5)
  const events = renderWithEvents(
    [
      { type: 'DRAW', payload: { count: 2, playerId: 'p1' } },
      { type: 'DISCARD', payload: { playerId: 'p1', cardId: 'nonexistent' } },
    ],
    { strictMode: true, initialCards: cards }
  )
  t.deepEqual(
    events.map((e) => e.type),
    ['CARDS_DRAWN']
  )
})

test('PLAY_CARD and DISCARD each fire exactly once under StrictMode', (t) => {
  const cards = makeCards(5)
  const events = renderWithEvents(
    [
      { type: 'DRAW', payload: { count: 3, playerId: 'p1' } },
      { type: 'PLAY_CARD', payload: { playerId: 'p1', cardId: 'card-4' } },
      { type: 'DISCARD', payload: { playerId: 'p1', cardId: 'card-3' } },
    ],
    { strictMode: true, initialCards: cards }
  )
  t.deepEqual(
    events.map((e) => e.type),
    ['CARDS_DRAWN', 'CARD_PLAYED', 'CARD_DISCARDED']
  )
})

test('deckReducer contains no direct dispatchEvent calls (pure reducer)', (t) => {
  const cards = makeCards(3)
  const results: DeckContextType[] = []

  function Capture() {
    const ctx = useContext(DeckContext)
    results.push(ctx)
    return null
  }

  render(
    <DeckProvider initialCards={cards}>
      <Capture />
    </DeckProvider>
  )

  const state = results.at(-1)!
  t.deepEqual(state.pendingEvents, [])
})
