import React from 'react'
import { isCustomCard, isStandardCard, type TCard } from '../../types/index.js'
import Card from '../Card/index.js'
import { CustomCard } from '../CustomCard/index.js'
import { MiniCard } from '../MiniCard/index.js'

type AnyCardProps = {
  readonly card: TCard
  readonly variant?: 'simple' | 'ascii' | 'minimal' | 'mini' | 'micro'
  readonly faceUp?: boolean
}

/**
 * AnyCard is the single dispatch point for rendering any TCard value.
 *
 * Dispatch rules:
 * - Standard card + mini/micro variant → MiniCard
 * - Standard card + other variant    → Card
 * - Custom card                       → CustomCard (variant is ignored, as CustomCard
 *                                       manages its own size via the `size` prop)
 * - Otherwise                         → null
 *
 * This component does NOT include any wrapper Box — the caller is responsible for
 * positioning/spacing, so snapshots of existing consumers are unaffected.
 *
 * TODO(B18/F2): add a tarot branch here once TarotCardProps is merged into TCard.
 */
export function AnyCard({
  card,
  variant = 'simple',
  faceUp = false,
}: AnyCardProps) {
  if (isStandardCard(card)) {
    if (variant === 'mini' || variant === 'micro') {
      return (
        <MiniCard
          id={card.id}
          suit={card.suit}
          value={card.value}
          faceUp={faceUp}
          variant={variant}
        />
      )
    }

    return (
      <Card
        id={card.id}
        suit={card.suit}
        value={card.value}
        faceUp={faceUp}
        variant={variant}
      />
    )
  }

  if (isCustomCard(card)) {
    return <CustomCard {...card} faceUp={faceUp} />
  }

  return null
}
