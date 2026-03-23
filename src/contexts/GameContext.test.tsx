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
    const ctx = useContext(GameContext)
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

test('SET_PHASE changes game phase', (t) => {
  const results = renderWithProvider(
    [{ type: 'SET_PHASE', payload: 'playing' }],
    ['alice']
  )
  const state = results.at(-1)!
  t.is(state.phase, 'playing')
})
