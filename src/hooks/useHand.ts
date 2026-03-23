import { useContext } from 'react'
import { DeckContext } from '../contexts/DeckContext.js'
import { type TCard } from '../types/index.js'

export const useHand = (playerId: string) => {
  const context = useContext(DeckContext)
  if (!context) {
    throw new Error('useHand must be used within a DeckProvider')
  }

  const { zones, dispatch } = context

  const hand: TCard[] = zones.hands[playerId] ?? []

  const drawCard = (count = 1) => {
    dispatch({ type: 'DRAW', payload: { count, playerId } })
  }

  const playCard = (cardId: string) => {
    dispatch({ type: 'PLAY_CARD', payload: { playerId, cardId } })
  }

  const discard = (cardId: string) => {
    dispatch({ type: 'DISCARD', payload: { playerId, cardId } })
  }

  return {
    hand,
    drawCard,
    playCard,
    discard,
  }
}
