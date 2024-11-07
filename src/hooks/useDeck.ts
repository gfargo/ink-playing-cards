import { useContext } from 'react'
import DeckContext from '../contexts/DeckContext.js'
import { type Card, type CustomCardProps } from '../types/index.js'

const useDeck = () => {
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
    dispatch({ type: 'RESET' })
  }

  const setBackArtwork = (artwork: React.ReactNode) => {
    dispatch({ type: 'SET_BACK_ARTWORK', payload: artwork })
  }

  const addCustomCard = (card: CustomCardProps) => {
    dispatch({ type: 'ADD_CUSTOM_CARD', payload: card })
  }

  const removeCustomCard = (card: Card) => {
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

export default useDeck
