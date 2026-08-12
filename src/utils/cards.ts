import type {
  TCard,
  CardProps,
  CustomCardProps,
  TarotCardProps,
  TSuit,
  TCardValue,
} from '../types/index.js'

/**
 * Type guard to check if a card is a standard playing card.
 */
export function isStandardCard(
  card: TCard
): card is CardProps & { id: string } {
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
export function isTarotCard(
  card: TCard
): card is TarotCardProps & { id: string } {
  return 'arcana' in card
}

/**
 * Type guard to check if a card is a custom card.
 */
export function isCustomCard(
  card: TCard
): card is CustomCardProps & { id: string } {
  return !isStandardCard(card) && !isTarotCard(card)
}

/**
 * Generates a unique card ID from suit and value.
 * `rng` defaults to `Math.random`; pass a seeded RNG (e.g. `mulberry32`)
 * for deterministic, reproducible IDs.
 */
export function generateCardId(
  suit: TSuit,
  value: TCardValue,
  rng: () => number = Math.random
): string {
  return `${suit}-${value}-${rng().toString(36).slice(2, 8)}`
}
