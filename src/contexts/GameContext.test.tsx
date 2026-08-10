import { render } from 'ink-testing-library'
import React, { useContext, useRef } from 'react'
import test from 'ava'
import type { GameAction, GameContextType } from '../types/index.js'
import { GameContext, GameProvider } from './GameContext.js'

type CapturedState = Pick<
  GameContextType,
  'currentPlayerId' | 'players' | 'turn' | 'phase'
>

function renderWithProvider(
  actions: GameAction[],
  initialPlayers: string[] = []
) {
  const results: CapturedState[] = []

  function Capture() {
    const ctx = useContext(GameContext)!
    const dispatched = useRef(false)
    if (!dispatched.current) {
      dispatched.current = true
      for (const action of actions) {
        ctx.dispatch(action)
      }
    }

    results.push({
      currentPlayerId: ctx.currentPlayerId,
      players: ctx.players,
      turn: ctx.turn,
      phase: ctx.phase,
    })
    return null
  }

  render(
    <GameProvider initialPlayers={initialPlayers}>
      <Capture />
    </GameProvider>
  )

  return results
}

test('GameProvider initializes with default state', (t) => {
  const results = renderWithProvider([])
  const state = results.at(-1)!
  t.is(state.currentPlayerId, '')
  t.deepEqual(state.players, [])
  t.is(state.turn, 0)
  t.is(state.phase, 'setup')
})

test('GameProvider initializes with players', (t) => {
  const results = renderWithProvider([], ['alice', 'bob'])
  const state = results.at(-1)!
  t.is(state.currentPlayerId, 'alice')
  t.deepEqual(state.players, ['alice', 'bob'])
})

test('SET_CURRENT_PLAYER changes current player', (t) => {
  const results = renderWithProvider(
    [{ type: 'SET_CURRENT_PLAYER', payload: 'bob' }],
    ['alice', 'bob']
  )
  const state = results.at(-1)!
  t.is(state.currentPlayerId, 'bob')
})

test('NEXT_TURN advances to next player and increments turn', (t) => {
  const results = renderWithProvider(
    [{ type: 'NEXT_TURN' }],
    ['alice', 'bob', 'charlie']
  )
  const state = results.at(-1)!
  t.is(state.currentPlayerId, 'bob')
  t.is(state.turn, 1)
})

test('NEXT_TURN wraps around to first player', (t) => {
  const results = renderWithProvider(
    [{ type: 'SET_CURRENT_PLAYER', payload: 'charlie' }, { type: 'NEXT_TURN' }],
    ['alice', 'bob', 'charlie']
  )
  const state = results.at(-1)!
  t.is(state.currentPlayerId, 'alice')
})

test('NEXT_TURN with an empty player roster leaves state unchanged', (t) => {
  const results = renderWithProvider([{ type: 'NEXT_TURN' }], [])
  const state = results.at(-1)!
  t.is(state.currentPlayerId, '')
  t.deepEqual(state.players, [])
  t.is(state.turn, 0)
})

test('SET_PHASE changes game phase', (t) => {
  const results = renderWithProvider(
    [{ type: 'SET_PHASE', payload: 'playing' }],
    ['alice']
  )
  const state = results.at(-1)!
  t.is(state.phase, 'playing')
})

test('unknown action type preserves existing state', (t) => {
  const results = renderWithProvider(
    [
      { type: 'SET_PHASE', payload: 'playing' },
      { type: 'TOTALLY_UNKNOWN' } as unknown as GameAction,
    ],
    ['alice', 'bob']
  )
  const state = results.at(-1)!
  t.is(state.phase, 'playing')
  t.is(state.currentPlayerId, 'alice')
  t.deepEqual(state.players, ['alice', 'bob'])
  t.is(state.turn, 0)
})

test('HYDRATE replaces currentPlayerId/players/turn/phase from a snapshot', (t) => {
  const results = renderWithProvider(
    [
      {
        type: 'HYDRATE',
        payload: {
          version: 1,
          zones: {
            deck: [],
            hands: {},
            discardPile: [],
            playArea: [],
            custom: {},
          },
          players: ['remote-1', 'remote-2'],
          backArtwork: { ascii: '', simple: '', minimal: '' },
          currentPlayerId: 'remote-2',
          turn: 7,
          phase: 'playing',
        },
      },
    ],
    ['alice', 'bob']
  )
  const state = results.at(-1)!
  t.is(state.currentPlayerId, 'remote-2')
  t.deepEqual(state.players, ['remote-1', 'remote-2'])
  t.is(state.turn, 7)
  t.is(state.phase, 'playing')
})

test('ADD_PLAYER appends a new player', (t) => {
  const results = renderWithProvider(
    [{ type: 'ADD_PLAYER', payload: 'charlie' }],
    ['alice', 'bob']
  )
  const state = results.at(-1)!
  t.deepEqual(state.players, ['alice', 'bob', 'charlie'])
})

test('ADD_PLAYER is idempotent', (t) => {
  const results = renderWithProvider(
    [
      { type: 'ADD_PLAYER', payload: 'alice' },
      { type: 'ADD_PLAYER', payload: 'alice' },
    ],
    ['alice', 'bob']
  )
  const state = results.at(-1)!
  t.deepEqual(state.players, ['alice', 'bob'])
})

test('ADD_PLAYER sets currentPlayerId when the roster was empty', (t) => {
  const results = renderWithProvider(
    [{ type: 'ADD_PLAYER', payload: 'alice' }],
    []
  )
  const state = results.at(-1)!
  t.is(state.currentPlayerId, 'alice')
  t.deepEqual(state.players, ['alice'])
})

test('REMOVE_PLAYER drops a player', (t) => {
  const results = renderWithProvider(
    [{ type: 'REMOVE_PLAYER', payload: 'bob' }],
    ['alice', 'bob', 'charlie']
  )
  const state = results.at(-1)!
  t.deepEqual(state.players, ['alice', 'charlie'])
  t.is(state.currentPlayerId, 'alice')
})

test('REMOVE_PLAYER of the current player resets currentPlayerId to the next valid player', (t) => {
  const results = renderWithProvider(
    [{ type: 'REMOVE_PLAYER', payload: 'alice' }],
    ['alice', 'bob']
  )
  const state = results.at(-1)!
  t.is(state.currentPlayerId, 'bob')
})

test('REMOVE_PLAYER of the last player resets currentPlayerId to empty string', (t) => {
  const results = renderWithProvider(
    [{ type: 'REMOVE_PLAYER', payload: 'alice' }],
    ['alice']
  )
  const state = results.at(-1)!
  t.is(state.currentPlayerId, '')
  t.deepEqual(state.players, [])
})

test('REORDER_PLAYERS changes turn order and NEXT_TURN follows it', (t) => {
  const results = renderWithProvider(
    [
      { type: 'REORDER_PLAYERS', payload: ['charlie', 'alice', 'bob'] },
      { type: 'NEXT_TURN' },
    ],
    ['alice', 'bob', 'charlie']
  )
  const state = results.at(-1)!
  t.deepEqual(state.players, ['charlie', 'alice', 'bob'])
  // `currentPlayerId` started as 'alice' (index 1 in the new order), so
  // NEXT_TURN should advance to 'bob'.
  t.is(state.currentPlayerId, 'bob')
})

test('REORDER_PLAYERS with a non-permutation payload is a no-op', (t) => {
  const results = renderWithProvider(
    [{ type: 'REORDER_PLAYERS', payload: ['alice', 'dave'] }],
    ['alice', 'bob']
  )
  const state = results.at(-1)!
  t.deepEqual(state.players, ['alice', 'bob'])
})

test('HYDRATE defaults turn/phase/currentPlayerId when the snapshot omits game fields', (t) => {
  const results = renderWithProvider(
    [
      {
        type: 'HYDRATE',
        payload: {
          version: 1,
          zones: {
            deck: [],
            hands: {},
            discardPile: [],
            playArea: [],
            custom: {},
          },
          players: ['remote-1'],
          backArtwork: { ascii: '', simple: '', minimal: '' },
        },
      },
    ],
    ['alice', 'bob']
  )
  const state = results.at(-1)!
  t.is(state.currentPlayerId, 'remote-1')
  t.deepEqual(state.players, ['remote-1'])
  t.is(state.turn, 0)
  t.is(state.phase, 'setup')
})
