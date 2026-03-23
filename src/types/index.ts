import { type ReactNode } from 'react'

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

/**
 * Base properties shared by all card types.
 * Every card has a unique `id` for reliable identification in zones.
 */
export type BaseCardProps = {
  id: string
  effects?: CardEffect[]
  faceUp?: boolean
  selected?: boolean
  rounded?: boolean
}

/**
 * A standard playing card with suit and value.
 */
export type CardProps = BaseCardProps & {
  value: TCardValue
  suit: TSuit
  readonly theme?: AsciiTheme
}

/**
 * A freeform custom card for special game mechanics.
 */
export type CustomCardProps = BaseCardProps & {
  size?: 'small' | 'medium' | 'large'
  width?: number
  height?: number
  asciiArt?: string
  title?: string
  description?: string
  symbols?: Array<{
    char: string
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    color?: string
  }>
  borderColor?: string
  textColor?: string
  onClick?: () => void
  value?: TCardValue | string
  type?: string
  content?: ReactNode
}

/**
 * Union type for all cards. Every card has a guaranteed `id`.
 */
export type TCard = CardProps | CustomCardProps

/**
 * Type guard to check if a card is a standard playing card.
 */
export function isStandardCard(card: TCard): card is CardProps {
  return 'suit' in card && 'value' in card && typeof card.suit === 'string'
    && ['hearts', 'diamonds', 'clubs', 'spades'].includes(card.suit)
}

/**
 * Type guard to check if a card is a custom card.
 */
export function isCustomCard(card: TCard): card is CustomCardProps {
  return !isStandardCard(card)
}

/**
 * Card effect interface with typed game state.
 */
export type CardEffect = {
  apply(gameState: GameState, eventData: GameEventData): void
}

/**
 * Known game event types dispatched by the system.
 */
export type GameEventType =
  | 'CARDS_DRAWN'
  | 'CARDS_DEALT'
  | 'CARD_PLAYED'
  | 'CARD_DISCARDED'
  | 'DECK_SHUFFLED'
  | 'DECK_RESET'
  | 'DECK_CUT'
  | 'EFFECT_APPLIED'
  | string // Allow custom event types

/**
 * Typed event data for game events.
 */
export type GameEventData = {
  type: GameEventType
  playerId?: string
  card?: TCard
  cards?: TCard[]
  count?: number
  target?: unknown
  [key: string]: unknown // Allow custom data
}

/**
 * Game state passed to effects for evaluation.
 */
export type GameState = {
  currentPlayerId: string
  players: PlayerHand[]
  turn: number
  phase: string
  zones: {
    deck: TCard[]
    hands: Record<string, TCard[]>
    discardPile: TCard[]
    playArea: TCard[]
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
  }
  players: string[]
  backArtwork: BackArtwork
  eventManager: EventManagerInterface
  effectManager: EffectManagerInterface
  dispatch: React.Dispatch<DeckAction>
}

/**
 * Interface for the event manager (avoids circular imports with systems).
 */
export type EventManagerInterface = {
  addEventListener(eventType: string, listener: EventListenerInterface): void
  removeEventListener(eventType: string, listener: EventListenerInterface): void
  dispatchEvent(event: GameEventData): void
}

export type EventListenerInterface = {
  handleEvent(event: GameEventData): void
}

/**
 * Interface for the effect manager (avoids circular imports with systems).
 */
export type EffectManagerInterface = {
  applyCardEffects(card: TCard, gameState: GameState, eventData: GameEventData): void
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
  | { type: 'DRAW'; payload: { count: number; playerId: string } }
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

export type GameAction =
  | { type: 'SET_CURRENT_PLAYER'; payload: string }
  | { type: 'NEXT_TURN' }
  | { type: 'SET_PHASE'; payload: string }

/**
 * Available ASCII art themes for card faces
 */
export type AsciiTheme =
  | 'original'
  | 'geometric'
  | 'animal'
  | 'robot'
  | 'pixel'
  | 'medieval'

/**
 * Generates a unique card ID from suit and value.
 */
export function generateCardId(suit: TSuit, value: TCardValue): string {
  return `${suit}-${value}-${Math.random().toString(36).slice(2, 8)}`
}
