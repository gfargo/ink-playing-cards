import { render } from 'ink-testing-library'
import React, { useRef } from 'react'
import test from 'ava'
import { GameProvider } from '../contexts/GameContext.js'
import { useGame } from './useGame.js'

function renderWithProvider(
  run: (game: ReturnType<typeof useGame>) => void,
  initialPlayers: string[] = []
) {
  const snapshots: Array<ReturnType<typeof useGame>> = []

  function Capture() {
    const game = useGame()
    const ran = useRef(false)
    if (!ran.current) {
      ran.current = true
      run(game)
    }

    snapshots.push(game)
    return null
  }

  render(
    <GameProvider initialPlayers={initialPlayers}>
      <Capture />
    </GameProvider>
  )

  return snapshots
}

test('useGame throws when used outside a GameProvider', (t) => {
  let caught: unknown

  function Probe() {
    try {
      useGame()
    } catch (error) {
      caught = error
    }

    return null
  }

  render(<Probe />)

  t.true(caught instanceof Error)
  t.is((caught as Error).message, 'useGame must be used within a GameProvider')
})

test('useGame exposes default state', (t) => {
  const snapshots = renderWithProvider(() => null)
  const state = snapshots.at(-1)!
  t.is(state.currentPlayerId, '')
  t.deepEqual(state.players, [])
  t.is(state.turn, 0)
  t.is(state.phase, 'setup')
})

test('useGame.setCurrentPlayer dispatches SET_CURRENT_PLAYER', (t) => {
  const snapshots = renderWithProvider(
    (game) => {
      game.setCurrentPlayer('bob')
    },
    ['alice', 'bob']
  )
  const state = snapshots.at(-1)!
  t.is(state.currentPlayerId, 'bob')
})

test('useGame.nextTurn advances to the next player and increments turn', (t) => {
  const snapshots = renderWithProvider(
    (game) => {
      game.nextTurn()
    },
    ['alice', 'bob', 'charlie']
  )
  const state = snapshots.at(-1)!
  t.is(state.currentPlayerId, 'bob')
  t.is(state.turn, 1)
})

test('useGame.setPhase dispatches SET_PHASE', (t) => {
  const snapshots = renderWithProvider(
    (game) => {
      game.setPhase('playing')
    },
    ['alice']
  )
  const state = snapshots.at(-1)!
  t.is(state.phase, 'playing')
})

test('useGame.addPlayer dispatches ADD_PLAYER', (t) => {
  const snapshots = renderWithProvider(
    (game) => {
      game.addPlayer('charlie')
    },
    ['alice', 'bob']
  )
  const state = snapshots.at(-1)!
  t.deepEqual(state.players, ['alice', 'bob', 'charlie'])
})

test('useGame.removePlayer dispatches REMOVE_PLAYER', (t) => {
  const snapshots = renderWithProvider(
    (game) => {
      game.removePlayer('bob')
    },
    ['alice', 'bob']
  )
  const state = snapshots.at(-1)!
  t.deepEqual(state.players, ['alice'])
})

test('useGame.reorderPlayers dispatches REORDER_PLAYERS', (t) => {
  const snapshots = renderWithProvider(
    (game) => {
      game.reorderPlayers(['bob', 'alice'])
    },
    ['alice', 'bob']
  )
  const state = snapshots.at(-1)!
  t.deepEqual(state.players, ['bob', 'alice'])
})
