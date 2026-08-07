import { useContext } from 'react'
import { GameContext } from '../contexts/GameContext.js'

export const useGame = () => {
  const { currentPlayerId, players, turn, phase, dispatch } =
    useContext(GameContext)

  const setCurrentPlayer = (playerId: string) => {
    dispatch({ type: 'SET_CURRENT_PLAYER', payload: playerId })
  }

  const nextTurn = () => {
    dispatch({ type: 'NEXT_TURN' })
  }

  const setPhase = (phase: string) => {
    dispatch({ type: 'SET_PHASE', payload: phase })
  }

  return {
    currentPlayerId,
    players,
    turn,
    phase,
    dispatch,
    setCurrentPlayer,
    nextTurn,
    setPhase,
  }
}
