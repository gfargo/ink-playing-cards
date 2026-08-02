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
 * Size presets for custom cards.
 */
export type CustomCardSize = 'micro' | 'mini' | 'small' | 'medium' | 'large'

/**
 * Corner symbol placement on a custom card.
 */
export type CustomCardSymbol = {
  char: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  color?: string
}

/**
 * Card back configuration for custom cards.
 */
export type CustomCardBack = {
  /** ASCII art for the card back */
  art?: string
  /** Single character/symbol for the card back */
  symbol?: string
  /** Color of the back content */
  color?: string
  /** Background label (e.g. game name) */
  label?: string
}

/**
 * A custom card with structured layout regions.
 *
 * Layout (full size):
 * ┌──────────────┐
 * │ Title   Cost │  ← header
 * │  [art area]  │  ← art (asciiArt string)
 * │ Type         │  ← typeLine
 * │ Description  │  ← body (description text)
 * │ text here... │
 * │ L/stat  R/st │  ← footer (footerLeft + footerRight)
 * └──────────────┘
 *
 * Small sizes don't have enough inner height for every region. Regions are
 * allocated by priority — header > typeLine > footer > description > art >
 * symbols — and whatever doesn't fit is dropped, with a dev-only console
 * warning naming the dropped regions (see `allocateRegions` in
 * `CustomCard/index.tsx`). Inner height per size: micro=1, mini=3, small=5,
 * medium=9, large=13.
 *
 * Pass `content` (ReactNode) for full freeform control instead.
 */
export type CustomCardProps = BaseCardProps & {
  /** Size preset — controls width/height. Overridden by explicit width/height. */
  size?: CustomCardSize
  /** Explicit width (overrides size preset) */
  width?: number
  /** Explicit height (overrides size preset) */
  height?: number

  // --- Structured layout regions ---
  /** Card title displayed at top-left of header */
  title?: string
  /** Cost/mana value displayed at top-right of header */
  cost?: string
  /** ASCII art string for the art region */
  asciiArt?: string
  /** Type line displayed between art and body (e.g. "Creature — Dragon") */
  typeLine?: string
  /** Description/rules text for the body region (auto-wraps) */
  description?: string
  /** Left-aligned footer text (e.g. power/toughness "3/4") */
  footerLeft?: string
  /** Right-aligned footer text (e.g. rarity, set symbol) */
  footerRight?: string
  /** Corner symbols */
  symbols?: CustomCardSymbol[]

  // --- Freeform mode ---
  /** Full custom ReactNode content — overrides all structured regions */
  content?: ReactNode

  // --- Card back ---
  /** Custom back design. When omitted, uses DeckContext back artwork. */
  back?: CustomCardBack

  // --- Styling ---
  /** Border color (Ink color string) */
  borderColor?: string
  /** Text color (Ink color string) */
  textColor?: string
  /** Color for the card art region */
  artColor?: string

  // --- Metadata (for game logic, not rendered directly) ---
  /** Card value for game logic (e.g. "7", "Skip", "Draw Two") */
  value?: TCardValue | string
  /** Card type for game logic (e.g. "Creature", "Action", "Wild") */
  type?: string
}

/**
 * Tarot suits for Minor Arcana cards.
 */
export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles'

/**
 * Minor Arcana values: Ace–10 plus court cards.
 */
export type TarotMinorValue =
  | 'Ace'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'Page'
  | 'Knight'
  | 'Queen'
  | 'King'

/**
 * Major Arcana index (0–21).
 */
export type MajorArcanaIndex =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21

/**
 * Props for a Major Arcana tarot card.
 */
export type TarotMajorProps = BaseCardProps & {
  arcana: 'major'
  /** Index 0–21 corresponding to The Fool through The World */
  majorIndex: MajorArcanaIndex
  /** Whether the card is reversed (upside-down reading) */
  reversed?: boolean
  /** Override the default ASCII art */
  asciiArt?: string
  /** Border color */
  borderColor?: string
  /** Text color */
  textColor?: string
  /** Art region color */
  artColor?: string
  /** Custom card back */
  back?: CustomCardBack
}

/**
 * Props for a Minor Arcana tarot card.
 */
export type TarotMinorProps = BaseCardProps & {
  arcana: 'minor'
  suit: TarotSuit
  value: TarotMinorValue
  /** Whether the card is reversed (upside-down reading) */
  reversed?: boolean
  /** Override the default ASCII art */
  asciiArt?: string
  /** Border color */
  borderColor?: string
  /** Text color */
  textColor?: string
  /** Art region color */
  artColor?: string
  /** Custom card back */
  back?: CustomCardBack
}

export type TarotCardProps = TarotMajorProps | TarotMinorProps

/**
 * Union type for all cards. Every card has a guaranteed `id`.
 */
export type TCard = CardProps | CustomCardProps | TarotCardProps

/**
 * Type guard to check if a card is a standard playing card.
 */
export function isStandardCard(card: TCard): card is CardProps {
  return (
    'suit' in card &&
    'value' in card &&
    typeof card.suit === 'string' &&
    ['hearts', 'diamonds', 'clubs', 'spades'].includes(card.suit)
  )
}

/**
 * Type guard to check if a card is a tarot card (Major or Minor Arcana).
 */
export function isTarotCard(card: TCard): card is TarotCardProps {
  return 'arcana' in card
}

/**
 * Type guard to check if a card is a custom card.
 */
export function isCustomCard(card: TCard): card is CustomCardProps {
  return !isStandardCard(card) && !isTarotCard(card)
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
  | 'CARD_MOVED'
  | 'DECK_SHUFFLED'
  | 'DECK_RESET'
  | 'DECK_CUT'
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
 * Name of a zone that `MOVE_CARD`/`SET_ZONE`/`CLEAR_ZONE` can address.
 * Built-in zone names resolve to their dedicated field; any other string
 * resolves to `zones.custom[name]`.
 */
export type ZoneName = 'deck' | 'discardPile' | 'playArea' | string

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

/**
 * Interface for the event manager (avoids circular imports with systems).
 */
export type EventManagerInterface = {
  addEventListener(eventType: string, listener: EventListenerInterface): void
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
