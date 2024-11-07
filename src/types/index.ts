import { type ReactNode } from 'react'
import { type EffectManager } from '../systems/Effects.js'
import { type EventManager } from '../systems/Events.js'
import {
  type Deck,
  type DiscardPile,
  type Hand,
  type PlayArea,
} from '../systems/Zones.js'

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Value =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'

export type CardProps = {
  id: string
  value: Value
  suit: Suit
  faceUp?: boolean
  style?: React.CSSProperties
  effects?: CardEffect[]
}

export type CustomCardProps = {
  id: string
  value: Value
  type: string
  content: ReactNode
  faceUp?: boolean
  style?: React.CSSProperties
  effects?: CardEffect[]
}

export type Card = CardProps | CustomCardProps

export type CardEffect = {
  apply(gameState: any, eventData: any): void
}

export type PlayerHand = {
  userId: string
  cards: Card[]
}

export type DeckContextType = {
  zones: {
    deck: Deck
    hand: Hand
    discardPile: DiscardPile
    playArea: PlayArea
  }
  players: PlayerHand[]
  backArtwork: ReactNode
  eventManager: EventManager
  effectManager: EffectManager
  dispatch: React.Dispatch<DeckAction>
}

export type GameContextType = {
  currentPlayerId: string
  players: string[]
  dispatch: React.Dispatch<GameAction>
}

export type DeckAction =
  | { type: 'SHUFFLE' }
  | { type: 'DRAW'; payload: { count: number; playerId: string } }
  | { type: 'RESET' }
  | { type: 'SET_BACK_ARTWORK'; payload: ReactNode }
  | { type: 'ADD_CUSTOM_CARD'; payload: CustomCardProps }
  | { type: 'REMOVE_CUSTOM_CARD'; payload: Card }
  | { type: 'CUT_DECK'; payload: number }
  | { type: 'DEAL'; payload: { count: number; playerIds: string[] } }
  | { type: 'PLAY_CARD'; payload: { playerId: string; card: Card } }
  | { type: 'DISCARD'; payload: { playerId: string; card: Card } }

export type GameAction =
  | { type: 'ADD_PLAYER'; payload: string }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'SET_CURRENT_PLAYER'; payload: string }
