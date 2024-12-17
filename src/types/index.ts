import { type ReactNode } from 'react'
import { type EffectManager } from '../systems/Effects.js'
import { type EventManager } from '../systems/Events.js'
import {
  type Deck,
  type DiscardPile,
  type Hand,
  type PlayArea,
} from '../systems/Zones.js'

export type TSuitIcon = '♥' | '♦' | '♣' | '♠'

export type TCardValue =
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
  | 'A'
  | 'JOKER'

export type TSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades'

export type CardProps = {
  id?: string
  value: TCardValue
  suit: TSuit
  faceUp?: boolean
  effects?: CardEffect[]
}

export type CustomCardProps = {
  id: string
  value: TCardValue | string
  type: string
  content: ReactNode
  faceUp?: boolean
  effects?: CardEffect[]
}

export type TCard = CardProps | CustomCardProps

export type CardEffect = {
  apply(gameState: any, eventData: any): void
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

export type DeckContextType = {
  zones: {
    deck: Deck
    hand: Hand
    discardPile: DiscardPile
    playArea: PlayArea
  }
  players: PlayerHand[]
  backArtwork: BackArtwork
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
  | { type: 'SET_BACK_ARTWORK'; payload: Partial<BackArtwork> }
  | { type: 'ADD_CUSTOM_CARD'; payload: CustomCardProps }
  | { type: 'REMOVE_CUSTOM_CARD'; payload: TCard }
  | { type: 'CUT_DECK'; payload: number }
  | { type: 'DEAL'; payload: { count: number; playerIds: string[] } }
  | { type: 'PLAY_CARD'; payload: { playerId: string; card: TCard } }
  | { type: 'DISCARD'; payload: { playerId: string; card: TCard } }

export type GameAction =
  | { type: 'ADD_PLAYER'; payload: string }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'SET_CURRENT_PLAYER'; payload: string }