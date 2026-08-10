import type { TCard } from './cards.js'
import type { GameState } from './state.js'

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
  | 'CARD_MOVED'
  | 'DECK_SHUFFLED'
  | 'DECK_RESET'
  | 'DECK_CUT'
  | 'DECK_EXHAUSTED'
  | 'EFFECT_APPLIED'
  | string // Allow custom event types

/**
 * Typed event data for game events.
 */
export type GameEventData = {
  [key: string]: unknown // Allow custom data
  type: GameEventType
  playerId?: string
  card?: TCard
  cards?: TCard[]
  count?: number
  target?: unknown
}

/**
 * Options for registering an event listener.
 */
export type EventListenerOptions = {
  /** If true, the listener is automatically removed after it fires once. */
  once?: boolean
}

/**
 * Interface for the event manager (avoids circular imports with systems).
 */
export type EventManagerInterface = {
  addEventListener(
    eventType: string,
    listener: EventListenerInterface,
    options?: EventListenerOptions
  ): void
  removeEventListener(eventType: string, listener: EventListenerInterface): void
  dispatchEvent(event: GameEventData): void
  removeAllListeners(): void
}

export type EventListenerInterface = {
  handleEvent(event: GameEventData): void
}

/**
 * Interface for the effect manager (avoids circular imports with systems).
 */
export type EffectManagerInterface = {
  applyCardEffects(
    card: TCard,
    gameState: GameState,
    eventData: GameEventData
  ): void
}
