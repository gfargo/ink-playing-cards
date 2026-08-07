import test from 'ava'
import type { DeckAction, DeckContextType, TCard } from '../types/index.js'
import { EffectManager } from './Effects.js'
import { EventManager } from './Events.js'
import { withHistory } from './History.js'

/**
 * A tiny stand-in reducer exercising the same shapes `withHistory` wraps in
 * production (`DeckContext`'s `deckReducer`): a state-changing action, a
 * no-op action, and a `FLUSH_EVENTS` pass-through.
 */
function testReducer(
  state: DeckContextType,
  action: DeckAction
): DeckContextType {
  switch (action.type) {
    case 'DRAW': {
      const { playerId, count } = action.payload
      const drawn = state.zones.deck.slice(-count)
      const remaining = state.zones.deck.slice(0, -count)
      const hand = state.zones.hands[playerId] ?? []
      return {
        ...state,
        zones: {
          ...state.zones,
          deck: remaining,
          hands: { ...state.zones.hands, [playerId]: [...hand, ...drawn] },
        },
        pendingEvents: [
          ...state.pendingEvents,
          { type: 'CARDS_DRAWN', playerId, cards: drawn },
        ],
      }
    }

    case 'PLAY_CARD': {
      // Simulates a no-op: nothing in hand matches, so return state as-is.
      return state
    }

    case 'FLUSH_EVENTS': {
      return { ...state, pendingEvents: [] }
    }

    default: {
      return state
    }
  }
}

function makeCard(id: string): TCard {
  return { id, suit: 'hearts', value: 'A' }
}

function makeState(deckSize: number): DeckContextType {
  const deck = Array.from({ length: deckSize }, (_, i) => makeCard(`card-${i}`))
  return {
    zones: { deck, hands: {}, discardPile: [], playArea: [], custom: {} },
    players: [],
    backArtwork: { ascii: '', simple: '', minimal: '' },
    eventManager: new EventManager(),
    effectManager: new EffectManager(),
    pendingEvents: [],
    dispatch: () => null,
    history: { past: [], future: [] },
  }
}

test('undo after DRAW restores deck/hand', (t) => {
  const reducer = withHistory(testReducer)
  const initial = makeState(5)
  const afterDraw = reducer(initial, {
    type: 'DRAW',
    payload: { count: 2, playerId: 'p1' },
  })
  t.is(afterDraw.zones.deck.length, 3)
  t.is(afterDraw.zones.hands['p1']!.length, 2)

  const afterUndo = reducer(afterDraw, { type: 'UNDO' })
  t.is(afterUndo.zones.deck.length, 5)
  t.is(afterUndo.zones.hands['p1'], undefined)
})

test('redo re-applies the undone action', (t) => {
  const reducer = withHistory(testReducer)
  const initial = makeState(5)
  const afterDraw = reducer(initial, {
    type: 'DRAW',
    payload: { count: 2, playerId: 'p1' },
  })
  const afterUndo = reducer(afterDraw, { type: 'UNDO' })
  const afterRedo = reducer(afterUndo, { type: 'REDO' })
  t.is(afterRedo.zones.deck.length, 3)
  t.is(afterRedo.zones.hands['p1']!.length, 2)
})

test('undo/redo do not replay pendingEvents', (t) => {
  const reducer = withHistory(testReducer)
  const initial = makeState(5)
  const afterDraw = reducer(initial, {
    type: 'DRAW',
    payload: { count: 2, playerId: 'p1' },
  })
  const afterFlush = reducer(afterDraw, {
    type: 'FLUSH_EVENTS',
    payload: { count: afterDraw.pendingEvents.length },
  })
  const afterUndo = reducer(afterFlush, { type: 'UNDO' })
  t.deepEqual(afterUndo.pendingEvents, [])
  const afterRedo = reducer(afterUndo, { type: 'REDO' })
  t.deepEqual(afterRedo.pendingEvents, [])
})

test('FLUSH_EVENTS is not recorded as a history step', (t) => {
  const reducer = withHistory(testReducer)
  const initial = makeState(5)
  const afterDraw = reducer(initial, {
    type: 'DRAW',
    payload: { count: 2, playerId: 'p1' },
  })
  const afterFlush = reducer(afterDraw, {
    type: 'FLUSH_EVENTS',
    payload: { count: afterDraw.pendingEvents.length },
  })
  // A single UNDO should reverse the DRAW, not the (unrecorded) FLUSH_EVENTS.
  const afterUndo = reducer(afterFlush, { type: 'UNDO' })
  t.is(afterUndo.zones.deck.length, 5)
  t.is(afterUndo.history!.past.length, 0)
})

test('a no-op action (reducer returns same reference) is not recorded', (t) => {
  const reducer = withHistory(testReducer)
  const initial = makeState(5)
  const afterNoop = reducer(initial, {
    type: 'PLAY_CARD',
    payload: { playerId: 'p1', cardId: 'missing' },
  })
  t.is(afterNoop.history!.past.length, 0)
})

test('history is bounded by limit, dropping the oldest entries', (t) => {
  const reducer = withHistory(testReducer, { limit: 2 })
  let state = makeState(10)
  for (let i = 0; i < 3; i++) {
    state = reducer(state, {
      type: 'DRAW',
      payload: { count: 1, playerId: 'p1' },
    })
  }

  t.is(state.history!.past.length, 2)
})

test('a new action after undo clears the redo stack', (t) => {
  const reducer = withHistory(testReducer)
  const initial = makeState(5)
  const afterDraw1 = reducer(initial, {
    type: 'DRAW',
    payload: { count: 1, playerId: 'p1' },
  })
  const afterUndo = reducer(afterDraw1, { type: 'UNDO' })
  t.is(afterUndo.history!.future.length, 1)

  const afterDraw2 = reducer(afterUndo, {
    type: 'DRAW',
    payload: { count: 1, playerId: 'p1' },
  })
  t.is(afterDraw2.history!.future.length, 0)
})

test('UNDO is a no-op when there is nothing to undo', (t) => {
  const reducer = withHistory(testReducer)
  const initial = makeState(5)
  const afterUndo = reducer(initial, { type: 'UNDO' })
  t.is(afterUndo, initial)
})

test('REDO is a no-op when there is nothing to redo', (t) => {
  const reducer = withHistory(testReducer)
  const initial = makeState(5)
  const afterRedo = reducer(initial, { type: 'REDO' })
  t.is(afterRedo, initial)
})

test('CLEAR_HISTORY resets past and future', (t) => {
  const reducer = withHistory(testReducer)
  const initial = makeState(5)
  const afterDraw = reducer(initial, {
    type: 'DRAW',
    payload: { count: 1, playerId: 'p1' },
  })
  const afterUndo = reducer(afterDraw, { type: 'UNDO' })
  t.is(afterUndo.history!.future.length, 1)
  const cleared = reducer(afterUndo, { type: 'CLEAR_HISTORY' })
  t.is(cleared.history!.past.length, 0)
  t.is(cleared.history!.future.length, 0)
})

test('history tracking is a no-op passthrough when disabled', (t) => {
  const reducer = withHistory(testReducer)
  const initial = { ...makeState(5), history: undefined }
  const afterDraw = reducer(initial, {
    type: 'DRAW',
    payload: { count: 1, playerId: 'p1' },
  })
  t.is(afterDraw.history, undefined)
  const afterUndo = reducer(afterDraw, { type: 'UNDO' })
  t.is(afterUndo, afterDraw)
})
