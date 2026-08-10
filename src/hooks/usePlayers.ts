import { useContext } from 'react'
import { DeckContext } from '../contexts/DeckContext.js'
import { GameContext } from '../contexts/GameContext.js'

/**
 * Single entry point for mutating the player roster when both `GameContext`
 * and `DeckContext` are mounted — dispatches `ADD_PLAYER`/`REMOVE_PLAYER`/
 * `REORDER_PLAYERS` to every provider that's present, so the two rosters
 * can never drift apart. Degrades gracefully if only one provider (or
 * neither) is mounted; it dispatches to whichever context(s) it finds and
 * throws only if neither is present.
 */
export const usePlayers = () => {
  const game = useContext(GameContext)
  const deck = useContext(DeckContext)

  if (!game && !deck) {
    throw new Error(
      'usePlayers must be used within a GameProvider and/or a DeckProvider'
    )
  }

  const addPlayer = (playerId: string) => {
    game?.dispatch({ type: 'ADD_PLAYER', payload: playerId })
    deck?.dispatch({ type: 'ADD_PLAYER', payload: playerId })
  }

  const removePlayer = (playerId: string) => {
    game?.dispatch({ type: 'REMOVE_PLAYER', payload: playerId })
    deck?.dispatch({ type: 'REMOVE_PLAYER', payload: playerId })
  }

  const reorderPlayers = (playerIds: string[]) => {
    game?.dispatch({ type: 'REORDER_PLAYERS', payload: playerIds })
    deck?.dispatch({ type: 'REORDER_PLAYERS', payload: playerIds })
  }

  return {
    players: game?.players ?? deck?.players ?? [],
    addPlayer,
    removePlayer,
    reorderPlayers,
  }
}
