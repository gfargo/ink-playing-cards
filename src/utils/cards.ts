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
 * Generates a unique card ID from suit and value.
 */
export function generateCardId(suit: TSuit, value: TCardValue): string {
  return `${suit}-${value}-${Math.random().toString(36).slice(2, 8)}`
}
