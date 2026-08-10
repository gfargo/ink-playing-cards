import { render } from 'ink-testing-library'
import React, { useContext, useRef } from 'react'
import test from 'ava'
import { DeckContext, DeckProvider } from '../contexts/DeckContext.js'
import { GameContext, GameProvider } from '../contexts/GameContext.js'
import { usePlayers } from './usePlayers.js'

type CapturedState = {
  gamePlayers: string[] | undefined
  deckPlayers: string[] | undefined
  deckHands: Record<string, unknown> | undefined
}

function renderWithBothProviders(
  run: (players: ReturnType<typeof usePlayers>) => void,
  initialPlayers: string[] = []
) {
  const snapshots: CapturedState[] = []

  function Capture() {
    const players = usePlayers()
    const game = useContext(GameContext)
    const deck = useContext(DeckContext)
    const ran = useRef(false)
    if (!ran.current) {
      ran.current = true
      run(players)
    }

    snapshots.push({
      gamePlayers: game?.players,
      deckPlayers: deck?.players,
      deckHands: deck?.zones.hands,
    })
    return null
  }

  render(
    <GameProvider initialPlayers={initialPlayers}>
      <DeckProvider>
        <Capture />
      </DeckProvider>
    </GameProvider>
  )

  return snapshots
}

test('usePlayers throws when used outside both providers', (t) => {
  let caught: unknown

  function Probe() {
    try {
      usePlayers()
    } catch (error) {
      caught = error
    }

    return null
  }

  render(<Probe />)

  t.true(caught instanceof Error)
  t.is(
    (caught as Error).message,
    'usePlayers must be used within a GameProvider and/or a DeckProvider'
  )
})

test('usePlayers.addPlayer adds to both GameContext and DeckContext', (t) => {
  const snapshots = renderWithBothProviders(
    (players) => {
      players.addPlayer('charlie')
    },
    ['alice', 'bob']
  )
  const state = snapshots.at(-1)!
  t.deepEqual(state.gamePlayers, ['alice', 'bob', 'charlie'])
  t.deepEqual(state.deckPlayers, ['charlie'])
  t.deepEqual(state.deckHands?.['charlie'], [])
})

test('usePlayers.removePlayer removes from both GameContext and DeckContext', (t) => {
  const snapshots = renderWithBothProviders(
    (players) => {
      players.addPlayer('charlie')
      players.removePlayer('charlie')
    },
    ['alice', 'bob']
  )
  const state = snapshots.at(-1)!
  t.deepEqual(state.gamePlayers, ['alice', 'bob'])
  t.deepEqual(state.deckPlayers, [])
  t.is(state.deckHands?.['charlie'], undefined)
})

test('usePlayers.reorderPlayers reorders both GameContext and DeckContext', (t) => {
  const snapshots = renderWithBothProviders(
    (players) => {
      players.addPlayer('charlie')
      players.reorderPlayers(['charlie', 'alice', 'bob'])
    },
    ['alice', 'bob']
  )
  const state = snapshots.at(-1)!
  t.deepEqual(state.gamePlayers, ['charlie', 'alice', 'bob'])
  t.deepEqual(state.deckPlayers, ['charlie'])
})

test('usePlayers works with only a DeckProvider mounted', (t) => {
  const snapshots: CapturedState[] = []

  function Capture() {
    const players = usePlayers()
    const deck = useContext(DeckContext)
    const ran = useRef(false)
    if (!ran.current) {
      ran.current = true
      players.addPlayer('solo')
    }

    snapshots.push({
      gamePlayers: undefined,
      deckPlayers: deck?.players,
      deckHands: deck?.zones.hands,
    })
    return null
  }

  t.notThrows(() => {
    render(
      <DeckProvider>
        <Capture />
      </DeckProvider>
    )
  })

  const state = snapshots.at(-1)!
  t.deepEqual(state.deckPlayers, ['solo'])
})
