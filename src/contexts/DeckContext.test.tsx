import { render } from 'ink-testing-library'
import React, { useContext, useRef } from 'react'
import test from 'ava'
import type {
  CustomCardProps,
  DeckAction,
  DeckContextType,
  TCard,
} from '../types/index.js'
import { DeckContext, DeckProvider } from './DeckContext.js'

type CapturedState = Pick<DeckContextType, 'zones' | 'players'>

function renderWithProvider(actions: DeckAction[], initialCards?: TCard[]) {
  const results: CapturedState[] = []

  function Capture() {
    const ctx = useContext(DeckContext)
    const dispatched = useRef(false)
    if (!dispatched.current) {
      dispatched.current = true
      for (const action of actions) {
        ctx.dispatch(action)
      }
    }

    results.push({
      zones: ctx.zones,
      players: ctx.players,
    })
    return null
  }

  render(
    <DeckProvider initialCards={initialCards}>
      <Capture />
    </DeckProvider>
  )

  return results
}

function makeCards(n: number): TCard[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `card-${i}`,
    suit: 'hearts' as const,
    value: 'A' as const,
  }))
}

test('DeckProvider initializes with standard 52-card deck by default', (t) => {
  const results = renderWithProvider([])
  const state = results.at(-1)!
  t.is(state.zones.deck.length, 52)
})

test('DeckProvider initializes with custom cards', (t) => {
  const cards = makeCards(5)
  const results = renderWithProvider([], cards)
  const state = results.at(-1)!
  t.is(state.zones.deck.length, 5)
})

test('SHUFFLE action preserves deck size', (t) => {
  const cards = makeCards(20)
  const results = renderWithProvider([{ type: 'SHUFFLE' }], cards)
  const state = results.at(-1)!
  t.is(state.zones.deck.length, 20)
})

test('DRAW action moves cards from deck to player hand', (t) => {
  const cards = makeCards(10)
  const results = renderWithProvider(
    [{ type: 'DRAW', payload: { count: 3, playerId: 'p1' } }],
    cards
  )
  const state = results.at(-1)!
  t.is(state.zones.deck.length, 7)
  t.is(state.zones.hands['p1']!.length, 3)
})

test('DRAW action auto-registers player', (t) => {
  const cards = makeCards(5)
  const results = renderWithProvider(
    [{ type: 'DRAW', payload: { count: 1, playerId: 'newPlayer' } }],
    cards
  )
  const state = results.at(-1)!
  t.true(state.players.includes('newPlayer'))
})

test('RESET action restores deck and clears hands', (t) => {
  const cards = makeCards(5)
  const results = renderWithProvider(
    [
      { type: 'DRAW', payload: { count: 2, playerId: 'p1' } },
      { type: 'RESET' },
    ],
    cards
  )
  const state = results.at(-1)!
  t.is(state.zones.deck.length, 52)
  t.deepEqual(state.zones.hands, {})
})

test('RESET with custom cards', (t) => {
  const initial = makeCards(10)
  const resetCards = makeCards(3)
  const results = renderWithProvider(
    [{ type: 'RESET', payload: { cards: resetCards } }],
    initial
  )
  const state = results.at(-1)!
  t.is(state.zones.deck.length, 3)
})

test('CUT_DECK action reorders deck', (t) => {
  const cards = makeCards(5)
  const results = renderWithProvider([{ type: 'CUT_DECK', payload: 2 }], cards)
  const state = results.at(-1)!
  t.is(state.zones.deck.length, 5)
  t.is(state.zones.deck[0]!.id, 'card-2')
})

test('DEAL action distributes cards to multiple players', (t) => {
  const cards = makeCards(10)
  const results = renderWithProvider(
    [{ type: 'DEAL', payload: { count: 2, playerIds: ['p1', 'p2'] } }],
    cards
  )
  const state = results.at(-1)!
  t.is(state.zones.deck.length, 6)
  t.is(state.zones.hands['p1']!.length, 2)
  t.is(state.zones.hands['p2']!.length, 2)
})

test('PLAY_CARD moves card from hand to play area', (t) => {
  const cards = makeCards(5)
  const results = renderWithProvider(
    [
      { type: 'DRAW', payload: { count: 3, playerId: 'p1' } },
      { type: 'PLAY_CARD', payload: { playerId: 'p1', cardId: 'card-4' } },
    ],
    cards
  )
  const state = results.at(-1)!
  t.is(state.zones.hands['p1']!.length, 2)
  t.is(state.zones.playArea.length, 1)
  t.is(state.zones.playArea[0]!.id, 'card-4')
})

test('DISCARD moves card from hand to discard pile', (t) => {
  const cards = makeCards(5)
  const results = renderWithProvider(
    [
      { type: 'DRAW', payload: { count: 2, playerId: 'p1' } },
      { type: 'DISCARD', payload: { playerId: 'p1', cardId: 'card-4' } },
    ],
    cards
  )
  const state = results.at(-1)!
  t.is(state.zones.hands['p1']!.length, 1)
  t.is(state.zones.discardPile.length, 1)
  t.is(state.zones.discardPile[0]!.id, 'card-4')
})

test('ADD_PLAYER registers a new player with empty hand', (t) => {
  const cards = makeCards(5)
  const results = renderWithProvider(
    [{ type: 'ADD_PLAYER', payload: 'alice' }],
    cards
  )
  const state = results.at(-1)!
  t.true(state.players.includes('alice'))
  t.deepEqual(state.zones.hands['alice'], [])
})

test('ADD_PLAYER is idempotent', (t) => {
  const cards = makeCards(5)
  const results = renderWithProvider(
    [
      { type: 'ADD_PLAYER', payload: 'alice' },
      { type: 'ADD_PLAYER', payload: 'alice' },
    ],
    cards
  )
  const state = results.at(-1)!
  const count = state.players.filter((p: string) => p === 'alice').length
  t.is(count, 1)
})

test('REMOVE_PLAYER removes player and their hand', (t) => {
  const cards = makeCards(10)
  const results = renderWithProvider(
    [
      { type: 'DRAW', payload: { count: 3, playerId: 'alice' } },
      { type: 'REMOVE_PLAYER', payload: 'alice' },
    ],
    cards
  )
  const state = results.at(-1)!
  t.false(state.players.includes('alice'))
  t.is(state.zones.hands['alice'], undefined)
})

test('ADD_CUSTOM_CARD adds card to deck', (t) => {
  const cards = makeCards(3)
  const custom: CustomCardProps = { id: 'custom-1', title: 'Wild' }
  const results = renderWithProvider(
    [{ type: 'ADD_CUSTOM_CARD', payload: custom }],
    cards
  )
  const state = results.at(-1)!
  t.is(state.zones.deck.length, 4)
  t.is(state.zones.deck.at(-1)!.id, 'custom-1')
})

test('REMOVE_CUSTOM_CARD removes card from deck', (t) => {
  const cards = makeCards(5)
  const results = renderWithProvider(
    [{ type: 'REMOVE_CUSTOM_CARD', payload: { cardId: 'card-2' } }],
    cards
  )
  const state = results.at(-1)!
  t.is(state.zones.deck.length, 4)
  t.false(state.zones.deck.some((c: TCard) => c.id === 'card-2'))
})

test('PLAY_CARD is no-op when card not in hand', (t) => {
  const cards = makeCards(5)
  const results = renderWithProvider(
    [
      { type: 'DRAW', payload: { count: 2, playerId: 'p1' } },
      { type: 'PLAY_CARD', payload: { playerId: 'p1', cardId: 'nonexistent' } },
    ],
    cards
  )
  const state = results.at(-1)!
  t.is(state.zones.hands['p1']!.length, 2)
  t.is(state.zones.playArea.length, 0)
})

test('DISCARD is no-op when card not in hand', (t) => {
  const cards = makeCards(5)
  const results = renderWithProvider(
    [
      { type: 'DRAW', payload: { count: 2, playerId: 'p1' } },
      { type: 'DISCARD', payload: { playerId: 'p1', cardId: 'nonexistent' } },
    ],
    cards
  )
  const state = results.at(-1)!
  t.is(state.zones.hands['p1']!.length, 2)
  t.is(state.zones.discardPile.length, 0)
})
