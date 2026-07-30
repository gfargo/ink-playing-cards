import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { createStandardDeck } from '../components/Deck/utils.js'
import { EffectManager } from '../systems/Effects.js'
import { EventManager } from '../systems/Events.js'
import {
  addCard,
  drawCards,
  removeCard,
  shuffleCards,
  cutDeck as cutDeckCards,
} from '../systems/Zones.js'
import {
  type BackArtwork,
  type DeckAction,
  type DeckContextType,
  type GameEventData,
  type TCard,
} from '../types/index.js'

const BACK_ART: Record<'simple' | 'ascii' | 'minimal', string> = {
  simple: ['? ? ? ?', ' ? ? ? ', '? ? ? ?', ' ? ? ? ', '? ? ? ?'].join('\n'),
  ascii: [
    '╔═══════╗',
    '║ ░░░░░ ║',
    '║ ░░░░░ ║',
    '║ ░░░░░ ║',
    '║ ░░░░░ ║',
    '║ ░░░░░ ║',
    '║ ░░░░░ ║',
    '║ ░░░░░ ║',
    '╚═══════╝',
  ].join('\n'),
  minimal: '?',
}

export const defaultBackArtwork: BackArtwork = {
  ascii: BACK_ART.ascii,
  simple: BACK_ART.simple,
  minimal: BACK_ART.minimal,
}

const createInitialState = (): DeckContextType => ({
  zones: { deck: [], hands: {}, discardPile: [], playArea: [] },
  players: [],
  backArtwork: defaultBackArtwork,
  eventManager: new EventManager(),
  effectManager: new EffectManager(),
  pendingEvents: [],
  dispatch: () => null,
})

export const DeckContext = createContext<DeckContextType>(createInitialState())

const deckReducer = (
  state: DeckContextType,
  action: DeckAction
): DeckContextType => {
  switch (action.type) {
    case 'SHUFFLE': {
      const newDeck = shuffleCards(state.zones.deck)
      return {
        ...state,
        zones: { ...state.zones, deck: newDeck },
        pendingEvents: [...state.pendingEvents, { type: 'DECK_SHUFFLED' }],
      }
    }

    case 'DRAW': {
      const { playerId, count } = action.payload
      const [drawn, remaining] = drawCards(state.zones.deck, count)
      const currentHand = state.zones.hands[playerId] ?? []
      const newHands = {
        ...state.zones.hands,
        [playerId]: [...currentHand, ...drawn],
      }
      const newPlayers = state.players.includes(playerId)
        ? state.players
        : [...state.players, playerId]
      return {
        ...state,
        zones: { ...state.zones, deck: remaining, hands: newHands },
        players: newPlayers,
        pendingEvents: [
          ...state.pendingEvents,
          { type: 'CARDS_DRAWN', playerId, cards: drawn },
        ],
      }
    }

    case 'RESET': {
      const newCards = action.payload?.cards ?? createStandardDeck()
      return {
        ...state,
        zones: { deck: newCards, hands: {}, discardPile: [], playArea: [] },
        players: [],
        pendingEvents: [...state.pendingEvents, { type: 'DECK_RESET' }],
      }
    }

    case 'SET_BACK_ARTWORK': {
      return {
        ...state,
        backArtwork: { ...state.backArtwork, ...action.payload },
      }
    }

    case 'ADD_CUSTOM_CARD': {
      return {
        ...state,
        zones: {
          ...state.zones,
          deck: addCard(state.zones.deck, action.payload),
        },
      }
    }

    case 'REMOVE_CUSTOM_CARD': {
      return {
        ...state,
        zones: {
          ...state.zones,
          deck: removeCard(state.zones.deck, action.payload.cardId),
        },
      }
    }

    case 'CUT_DECK': {
      const newDeck = cutDeckCards(state.zones.deck, action.payload)
      return {
        ...state,
        zones: { ...state.zones, deck: newDeck },
        pendingEvents: [...state.pendingEvents, { type: 'DECK_CUT' }],
      }
    }

    case 'DEAL': {
      const { count: dealCount, playerIds } = action.payload
      let currentDeck = state.zones.deck
      const newHands = { ...state.zones.hands }
      let newPlayers = [...state.players]
      const dealtEvents: GameEventData[] = []
      for (const playerId of playerIds) {
        const [drawn, remaining] = drawCards(currentDeck, dealCount)
        currentDeck = remaining
        newHands[playerId] = [...(newHands[playerId] ?? []), ...drawn]
        if (!newPlayers.includes(playerId)) {
          newPlayers = [...newPlayers, playerId]
        }

        dealtEvents.push({
          type: 'CARDS_DEALT',
          playerId,
          cards: drawn,
          count: dealCount,
        })
      }

      return {
        ...state,
        zones: { ...state.zones, deck: currentDeck, hands: newHands },
        players: newPlayers,
        pendingEvents: [...state.pendingEvents, ...dealtEvents],
      }
    }

    case 'PLAY_CARD': {
      const { playerId: pcPid, cardId: pcCid } = action.payload
      const pcHand = state.zones.hands[pcPid] ?? []
      const pcCard = pcHand.find((c: TCard) => c.id === pcCid)
      if (!pcCard) return state
      return {
        ...state,
        zones: {
          ...state.zones,
          hands: { ...state.zones.hands, [pcPid]: removeCard(pcHand, pcCid) },
          playArea: addCard(state.zones.playArea, pcCard),
        },
        pendingEvents: [
          ...state.pendingEvents,
          { type: 'CARD_PLAYED', playerId: pcPid, card: pcCard },
        ],
      }
    }

    case 'DISCARD': {
      const { playerId: dPid, cardId: dCid } = action.payload
      const dHand = state.zones.hands[dPid] ?? []
      const dCard = dHand.find((c: TCard) => c.id === dCid)
      if (!dCard) return state
      return {
        ...state,
        zones: {
          ...state.zones,
          hands: { ...state.zones.hands, [dPid]: removeCard(dHand, dCid) },
          discardPile: addCard(state.zones.discardPile, dCard),
        },
        pendingEvents: [
          ...state.pendingEvents,
          { type: 'CARD_DISCARDED', playerId: dPid, card: dCard },
        ],
      }
    }

    case 'ADD_PLAYER': {
      if (state.players.includes(action.payload)) return state
      return {
        ...state,
        players: [...state.players, action.payload],
        zones: {
          ...state.zones,
          hands: { ...state.zones.hands, [action.payload]: [] },
        },
      }
    }

    case 'REMOVE_PLAYER': {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { [action.payload]: _removed, ...remainingHands } =
        state.zones.hands
      return {
        ...state,
        players: state.players.filter((p: string) => p !== action.payload),
        zones: { ...state.zones, hands: remainingHands },
      }
    }

    case 'FLUSH_EVENTS': {
      return {
        ...state,
        pendingEvents: state.pendingEvents.slice(action.payload.count),
      }
    }

    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    default: {
      return state
    }
  }
}

type DeckProviderProperties = {
  readonly children: ReactNode
  readonly initialCards?: TCard[]
  readonly customReducer?: (
    state: DeckContextType,
    action: DeckAction
  ) => DeckContextType
}

export function DeckProvider({
  children,
  initialCards,
  customReducer,
}: DeckProviderProperties) {
  const [state, dispatch] = useReducer(
    customReducer ?? deckReducer,
    initialCards,
    (cards) => {
      const base = createInitialState()
      return {
        ...base,
        zones: {
          ...base.zones,
          deck: cards ?? createStandardDeck(),
        },
      }
    }
  )
  useEffect(() => {
    const events = state.pendingEvents ?? []
    if (events.length === 0) return
    for (const event of events) state.eventManager.dispatchEvent(event)
    dispatch({ type: 'FLUSH_EVENTS', payload: { count: events.length } })
  }, [state.pendingEvents, state.eventManager])

  const contextValue = useMemo(
    () => ({ ...state, dispatch }),
    [state, dispatch]
  )
  return (
    <DeckContext.Provider value={contextValue}>{children}</DeckContext.Provider>
  )
}
