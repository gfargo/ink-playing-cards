import { useContext } from 'react'
import { GameContext } from '../contexts/GameContext.js'

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }

  const { currentPlayerId, players, turn, phase, dispatch } = context

  const setCurrentPlayer = (playerId: string) => {
    dispatch({ type: 'SET_CURRENT_PLAYER', payload: playerId })
  }

  const nextTurn = () => {
    dispatch({ type: 'NEXT_TURN' })
  }

  const setPhase = (nextPhase: string) => {
    dispatch({ type: 'SET_PHASE', payload: nextPhase })
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
