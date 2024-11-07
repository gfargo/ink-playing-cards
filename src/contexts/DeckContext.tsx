import React, {
  createContext,
  type ReactNode,
  useMemo,
  useReducer,
} from 'react'
import { EffectManager } from '../systems/Effects.js'
import { EventManager } from '../systems/Events.js'
import { Deck, DiscardPile, Hand, PlayArea } from '../systems/Zones.js'
import {
  type Card,
  type DeckAction,
  type DeckContextType,
} from '../types/index.js'

const defaultBackArtwork = '🂠'

const initialState: DeckContextType = {
  zones: {
    deck: new Deck(),
    hand: new Hand(),
    discardPile: new DiscardPile(),
    playArea: new PlayArea(),
  },
  players: [],
  backArtwork: defaultBackArtwork,
  eventManager: new EventManager(),
  effectManager: new EffectManager(),
  dispatch: () => null,
}

const DeckContext = createContext<DeckContextType>(initialState)

const deckReducer = (
  state: DeckContextType,
  action: DeckAction
): DeckContextType => {
  switch (action.type) {
    case 'SHUFFLE': {
      state.zones.deck.shuffle()
      return { ...state }
    }

    case 'DRAW': {
      const { playerId: drawPlayerId, count } = action.payload
      const drawnCards: Card[] = []
      for (let i = 0; i < count; i++) {
        const card = state.zones.deck.drawCard()
        if (card) {
          drawnCards.push(card)
          state.zones.hand.addCard(card)
        }
      }

      state.eventManager.dispatchEvent({
        type: 'CARDS_DRAWN',
        data: { playerId: drawPlayerId, cards: drawnCards },
      })
      return { ...state }
    }

    case 'RESET': {
      return {
        ...initialState,
        dispatch: state.dispatch,
      }
    }

    case 'SET_BACK_ARTWORK': {
      return {
        ...state,
        backArtwork: action.payload,
      }
    }

    case 'ADD_CUSTOM_CARD': {
      state.zones.deck.addCard(action.payload)
      return { ...state }
    }

    case 'REMOVE_CUSTOM_CARD': {
      state.zones.deck.removeCard(action.payload)
      return { ...state }
    }

    case 'CUT_DECK': {
      const cutIndex = action.payload
      const newDeck = new Deck([
        ...state.zones.deck.cards.slice(cutIndex),
        ...state.zones.deck.cards.slice(0, cutIndex),
      ])
      return {
        ...state,
        zones: { ...state.zones, deck: newDeck },
      }
    }

    case 'DEAL': {
      const { count: dealCount, playerIds } = action.payload
      for (const playerId of playerIds) {
        for (let i = 0; i < dealCount; i++) {
          const card = state.zones.deck.drawCard()
          if (card) {
            state.zones.hand.addCard(card)
          }
        }

        state.eventManager.dispatchEvent({
          type: 'CARDS_DEALT',
          data: { playerId, count: dealCount },
        })
      }

      return { ...state }
    }

    case 'PLAY_CARD': {
      const { playerId: playCardPlayerId, card } = action.payload
      state.zones.hand.removeCard(card)
      state.zones.playArea.addCard(card)
      state.eventManager.dispatchEvent({
        type: 'CARD_PLAYED',
        data: { playerId: playCardPlayerId, card },
      })
      return { ...state }
    }

    case 'DISCARD': {
      const { playerId: discardPlayerId, card: discardCard } = action.payload
      state.zones.playArea.removeCard(discardCard)
      state.zones.discardPile.addCard(discardCard)
      state.eventManager.dispatchEvent({
        type: 'CARD_DISCARDED',
        data: { playerId: discardPlayerId, card: discardCard },
      })
      return { ...state }
    }
  }
}

type DeckProviderProperties = {
  readonly children: ReactNode
  readonly initialCards?: Card[]
  readonly customReducer?: (
    state: DeckContextType,
    action: DeckAction
  ) => DeckContextType
}

export function DeckProvider({
  children,
  initialCards = [],
  customReducer,
}: DeckProviderProperties) {
  const [state, dispatch] = useReducer(customReducer ?? deckReducer, {
    ...initialState,
    zones: { ...initialState.zones, deck: new Deck(initialCards) },
  })

  const contextValue = useMemo(
    () => ({ ...state, dispatch }),
    [state, dispatch]
  )

  return (
    <DeckContext.Provider value={contextValue}>{children}</DeckContext.Provider>
  )
}

export default DeckContext
