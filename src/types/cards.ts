import { type BoxProps, type TextProps } from 'ink'
import { type ReactNode } from 'react'
import type { CardEffect } from './events.js'

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
  /**
   * Identifies this card for zone bookkeeping and list rendering (e.g.
   * `CardStack`/`CardGrid` React keys). Optional here since the leaf
   * render components (`Card`, `MiniCard`) don't need it — required on
   * `TCard`, since zones and hands do.
   */
  id?: string
  /**
   * Effects attached to this card. Consumed by `EffectManager.applyCardEffects`
   * on `PLAY_CARD` (game-state side). On the render side, a non-empty array on
   * a face-up card also drives a border-color indicator (`EFFECT_INDICATOR_COLOR`)
   * in `Card`, `MiniCard`, and `CustomCard` — ranked below the `selected`
   * highlight and skipped in monochrome themes.
   */
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
 * Fields shared by Major and Minor Arcana tarot card props.
 */
type TarotCommon = BaseCardProps & {
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
 * Props for a Major Arcana tarot card.
 */
export type TarotMajorProps = TarotCommon & {
  arcana: 'major'
  /** Index 0–21 corresponding to The Fool through The World */
  majorIndex: MajorArcanaIndex
}

/**
 * Props for a Minor Arcana tarot card.
 */
export type TarotMinorProps = TarotCommon & {
  arcana: 'minor'
  suit: TarotSuit
  value: TarotMinorValue
}

export type TarotCardProps = TarotMajorProps | TarotMinorProps

/**
 * Union type for all cards. `id` is required here (unlike on the individual
 * component props types) since zone bookkeeping and list rendering rely on it.
 */
export type TCard = (CardProps | CustomCardProps | TarotCardProps) & {
  id: string
}

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
 * Global card theme: suit colors, suit glyphs, border styles, and a
 * monochrome (no-color) mode for accessibility / dumb-terminal support.
 */
export type CardTheme = {
  suitColors: Record<TSuit, TextProps['color']>
  suitGlyphs: Record<TSuit, string>
  borderStyle: BoxProps['borderStyle']
  selectedBorderStyle: BoxProps['borderStyle']
  selectedColor: TextProps['color']
  monochrome: boolean
}
