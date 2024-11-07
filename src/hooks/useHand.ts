import { useContext } from 'react'
import DeckContext from '../contexts/DeckContext.js'
import { type Card } from '../types/index.js'

const useHand = (userId: string) => {
  const context = useContext(DeckContext)
  if (!context) {
    throw new Error('useHand must be used within a DeckProvider')
  }

  const { players, dispatch } = context

  const playerHand = players.find(
    (p: { userId: string }) => p.userId === userId
  )

  const drawCard = (count = 1) => {
    dispatch({ type: 'DRAW', payload: { count, playerId: userId } })
  }

  const playCard = (cardId: string) => {
    if (!playerHand) return
    const cardIndex = playerHand.cards.findIndex(
      (card: Card) => card.id === cardId
    )
    if (cardIndex === -1) return

    const newHand = [...playerHand.cards]
    const [playedCard] = newHand.splice(cardIndex, 1)

    if (!playedCard) {
      return
    }

    dispatch({
      type: 'PLAY_CARD',
      payload: { playerId: userId, card: playedCard },
    })
  }

  return {
    hand: playerHand ? playerHand.cards : [],
    drawCard,
    playCard,
  }
}

export default useHand
