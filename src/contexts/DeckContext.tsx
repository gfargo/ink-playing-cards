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
  moveCard as moveCardCards,
  removeCard,
  shuffleCards,
  cutDeck as cutDeckCards,
} from '../systems/Zones.js'
import {
  type BackArtwork,
  type DeckAction,
  type DeckContextType,
  type GameEventData,
  type GameState,
  type TCard,
} from '../types/index.js'

type Zones = DeckContextType['zones']

/**
 * Build a mutable `GameState` working copy for effects to operate on.
 * Zone collections are shallow-cloned so effect mutations can never reach
 * the reducer's committed state. `turn`/`phase` aren't tracked by
 * `DeckContext` (they live in `GameContext`), so they default here.
 */
function buildEffectGameState(
  zones: Zones,
  players: string[],
  playerId: string
): GameState {
  return {
    currentPlayerId: playerId,
    players,
    turn: 0,
    phase: '',
    zones: {
      deck: [...zones.deck],
      hands: { ...zones.hands },
      discardPile: [...zones.discardPile],
      playArea: [...zones.playArea],
      custom: { ...zones.custom },
    },
  }
}

const BUILT_IN_ZONE_NAMES = new Set(['deck', 'discardPile', 'playArea'])

/**
 * Resolve a zone name to its card array. Built-in names map to their
 * dedicated field; any other name maps to `zones.custom[name]`.
 */
function resolveZone(zones: Zones, name: string): TCard[] {
  if (name === 'deck') return zones.deck
  if (name === 'discardPile') return zones.discardPile
  if (name === 'playArea') return zones.playArea
  return zones.custom[name] ?? []
}

/**
 * Return a new `zones` object with `name` set to `cards`. Built-in names
 * write to their dedicated field; any other name writes to `zones.custom`.
 */
function writeZone(zones: Zones, name: string, cards: TCard[]): Zones {
  if (name === 'deck') return { ...zones, deck: cards }
  if (name === 'discardPile') return { ...zones, discardPile: cards }
  if (name === 'playArea') return { ...zones, playArea: cards }
  return { ...zones, custom: { ...zones.custom, [name]: cards } }
}

function handleMoveCard(
  state: DeckContextType,
  payload: Extract<DeckAction, { type: 'MOVE_CARD' }>['payload']
): DeckContextType {
  const { cardId, from, to, position } = payload
  const fromCards = resolveZone(state.zones, from)
  const toCards = resolveZone(state.zones, to)
  const card = fromCards.find((c: TCard) => c.id === cardId)
  if (!card) return state
  const [newFrom, newTo] = moveCardCards(fromCards, toCards, cardId, position)
  const zonesAfterFrom = writeZone(state.zones, from, newFrom)
  const zonesAfterTo = writeZone(zonesAfterFrom, to, newTo)
  return {
    ...state,
    zones: zonesAfterTo,
    pendingEvents: [
      ...state.pendingEvents,
      { type: 'CARD_MOVED', card, from, to },
    ],
  }
}

function handleSetZone(
  state: DeckContextType,
  payload: Extract<DeckAction, { type: 'SET_ZONE' }>['payload']
): DeckContextType {
  const { name, cards } = payload
  if (BUILT_IN_ZONE_NAMES.has(name)) return state
  return {
    ...state,
    zones: { ...state.zones, custom: { ...state.zones.custom, [name]: cards } },
  }
}

function handleClearZone(
  state: DeckContextType,
  payload: Extract<DeckAction, { type: 'CLEAR_ZONE' }>['payload']
): DeckContextType {
  const { name } = payload
  if (BUILT_IN_ZONE_NAMES.has(name)) return state
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { [name]: _removed, ...remainingCustom } = state.zones.custom
  return {
    ...state,
    zones: { ...state.zones, custom: remainingCustom },
  }
}

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
  zones: { deck: [], hands: {}, discardPile: [], playArea: [], custom: {} },
  players: [],
  backArtwork: defaultBackArtwork,
  eventManager: new EventManager(),
  effectManager: new EffectManager(),
  pendingEvents: [],
  dispatch: () => null,
})

export const DeckContext = createContext<DeckContextType | undefined>(undefined)

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
        zones: {
          deck: newCards,
          hands: {},
          discardPile: [],
          playArea: [],
          custom: {},
        },
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
      const playedZones: Zones = {
        ...state.zones,
        hands: { ...state.zones.hands, [pcPid]: removeCard(pcHand, pcCid) },
        playArea: addCard(state.zones.playArea, pcCard),
      }
      const eventData: GameEventData = {
        type: 'CARD_PLAYED',
        playerId: pcPid,
        card: pcCard,
      }
      const working = buildEffectGameState(playedZones, state.players, pcPid)
      state.effectManager.applyCardEffects(pcCard, working, eventData)
      return {
        ...state,
        zones: working.zones,
        pendingEvents: [...state.pendingEvents, eventData],
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

    case 'MOVE_CARD': {
      return handleMoveCard(state, action.payload)
    }

    case 'SET_ZONE': {
      return handleSetZone(state, action.payload)
    }

    case 'CLEAR_ZONE': {
      return handleClearZone(state, action.payload)
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
