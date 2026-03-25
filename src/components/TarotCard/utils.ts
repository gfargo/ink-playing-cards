import { MAJOR_ARCANA, MINOR_COURT, MINOR_PIPS } from './constants.js'
import {
  type MajorArcanaIndex,
  type TarotCardProps,
  type TarotMinorValue,
  type TarotSuit,
} from './index.js'

const TAROT_SUITS: TarotSuit[] = ['wands', 'cups', 'swords', 'pentacles']

const ALL_MINOR_VALUES: TarotMinorValue[] = [
  ...MINOR_PIPS,
  ...MINOR_COURT,
] as TarotMinorValue[]

/**
 * Creates a standard 78-card tarot deck.
 *
 * - 22 Major Arcana (The Fool through The World)
 * - 56 Minor Arcana (Ace–10 + Page/Knight/Queen/King × 4 suits)
 *
 * IDs follow the pattern:
 * - Major: `major-<index>-<rand>` (e.g. `major-0-a1b2c3`)
 * - Minor: `minor-<suit>-<value>-<rand>` (e.g. `minor-cups-Queen-x9y8z7`)
 *
 * @returns Array of 78 TarotCardProps (without `id` randomness baked in — each call produces unique IDs)
 */
export function createTarotDeck(): TarotCardProps[] {
  const cards: TarotCardProps[] = []
  const rand = () => Math.random().toString(36).slice(2, 8)

  // 22 Major Arcana
  for (let i = 0; i < MAJOR_ARCANA.length; i++) {
    cards.push({
      id: `major-${i}-${rand()}`,
      arcana: 'major',
      majorIndex: i as MajorArcanaIndex,
    })
  }

  // 56 Minor Arcana (14 cards × 4 suits)
  for (const suit of TAROT_SUITS) {
    for (const value of ALL_MINOR_VALUES) {
      cards.push({
        id: `minor-${suit}-${value}-${rand()}`,
        arcana: 'minor',
        suit,
        value,
      })
    }
  }

  return cards
}
