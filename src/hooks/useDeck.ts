import { useContext } from 'react'
import { DeckContext } from '../contexts/DeckContext.js'
import {
  type BackArtwork,
  type CustomCardProps,
  type TCard,
} from '../types/index.js'

export const useDeck = () => {
  const context = useContext(DeckContext)
  if (!context) {
    throw new Error('useDeck must be used within a DeckProvider')
  }

  const { zones, players, backArtwork, eventManager, effectManager, dispatch } =
    context

  const shuffle = () => {
    dispatch({ type: 'SHUFFLE' })
  }

  const draw = (count: number, playerId: string) => {
    dispatch({ type: 'DRAW', payload: { count, playerId } })
  }

  const reset = () => {
    dispatch({ type: 'RESET', payload: { deck } })
  }

  const setBackArtwork = (artwork: Partial<BackArtwork>) => {
    dispatch({ type: 'SET_BACK_ARTWORK', payload: artwork })
  }

  const addCustomCard = (card: CustomCardProps) => {
    dispatch({ type: 'ADD_CUSTOM_CARD', payload: card })
  }

  const removeCustomCard = (card: TCard) => {
    dispatch({ type: 'REMOVE_CUSTOM_CARD', payload: card })
  }

  const cutDeck = (index: number) => {
    dispatch({ type: 'CUT_DECK', payload: index })
  }

  const deal = (count: number, playerIds: string[]) => {
    dispatch({ type: 'DEAL', payload: { count, playerIds } })
  }

  return {
    deck: zones.deck,
    hand: zones.hand,
    discardPile: zones.discardPile,
    playArea: zones.playArea,
    players,
    backArtwork,
    eventManager,
    effectManager,
    shuffle,
    draw,
    reset,
    setBackArtwork,
    addCustomCard,
    removeCustomCard,
    cutDeck,
    deal,
  }
}
