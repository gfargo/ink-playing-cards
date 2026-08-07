import type React from 'react'
import type { TCard, CustomCardProps } from './cards.js'
import type {
  GameEventData,
  EventManagerInterface,
  EffectManagerInterface,
} from './events.js'

/**
 * Name of a zone that `MOVE_CARD`/`SET_ZONE`/`CLEAR_ZONE` can address.
 * Built-in zone names resolve to their dedicated field; any other string
 * resolves to `zones.custom[name]`.
 */
// eslint-disable-next-line @typescript-eslint/ban-types -- `string & {}` preserves literal autocomplete while still accepting arbitrary zone names
export type ZoneName = 'deck' | 'discardPile' | 'playArea' | (string & {})

/**
 * Game state passed to effects for evaluation.
 */
export type GameState = {
  currentPlayerId: string
  players: string[]
  turn: number
  phase: string
  zones: {
    deck: TCard[]
    hands: Record<string, TCard[]>
    discardPile: TCard[]
    playArea: TCard[]
    custom: Record<string, TCard[]>
  }
}

export type PlayerHand = {
  userId: string
  cards: TCard[]
}

export type BackArtwork = {
  ascii: string
  simple: string
  minimal: string
}

/**
 * The shape of the DeckContext value.
 * Zones use immutable arrays — the reducer returns new zone instances on every action.
 */
export type DeckContextType = {
  zones: {
    deck: TCard[]
    hands: Record<string, TCard[]>
    discardPile: TCard[]
    playArea: TCard[]
    custom: Record<string, TCard[]>
  }
  players: string[]
  backArtwork: BackArtwork
  eventManager: EventManagerInterface
  effectManager: EffectManagerInterface
  pendingEvents: GameEventData[]
  dispatch: React.Dispatch<DeckAction>
}

export type GameContextType = {
  currentPlayerId: string
  players: string[]
  turn: number
  phase: string
  dispatch: React.Dispatch<GameAction>
}

export type DeckAction =
  | { type: 'SHUFFLE' }
  | {
      type: 'DRAW'
      payload: {
        count: number
        playerId: string
        reshuffleWhenEmpty?: boolean
      }
    }
  | { type: 'RESET'; payload?: { cards?: TCard[] } }
  | { type: 'SET_BACK_ARTWORK'; payload: Partial<BackArtwork> }
  | { type: 'ADD_CUSTOM_CARD'; payload: CustomCardProps }
  | { type: 'REMOVE_CUSTOM_CARD'; payload: { cardId: string } }
  | { type: 'CUT_DECK'; payload: number }
  | { type: 'DEAL'; payload: { count: number; playerIds: string[] } }
  | { type: 'PLAY_CARD'; payload: { playerId: string; cardId: string } }
  | { type: 'DISCARD'; payload: { playerId: string; cardId: string } }
  | { type: 'ADD_PLAYER'; payload: string }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'FLUSH_EVENTS'; payload: { count: number } }
  | {
      type: 'MOVE_CARD'
      payload: {
        cardId: string
        from: ZoneName
        to: ZoneName
        position?: 'top' | 'bottom' | number
      }
    }
  | { type: 'SET_ZONE'; payload: { name: string; cards: TCard[] } }
  | { type: 'CLEAR_ZONE'; payload: { name: string } }

export type GameAction =
  | { type: 'SET_CURRENT_PLAYER'; payload: string }
  | { type: 'NEXT_TURN' }
  | { type: 'SET_PHASE'; payload: string }
