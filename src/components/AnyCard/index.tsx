import React from 'react'
import { type TCard } from '../../types/index.js'
import { isCustomCard, isStandardCard, isTarotCard } from '../../utils/cards.js'
import { useResponsiveVariant } from '../../hooks/useResponsiveVariant.js'
import { type CardVariant } from '../../utils/responsive.js'
import Card from '../Card/index.js'
import { CustomCard } from '../CustomCard/index.js'
import { MiniCard } from '../MiniCard/index.js'
import { TarotCard } from '../TarotCard/index.js'

type AnyCardProps = {
  readonly card: TCard
  readonly variant?: CardVariant | 'responsive'
  readonly faceUp?: boolean
}

/**
 * AnyCard is the single dispatch point for rendering any TCard value.
 *
 * Dispatch rules:
 * - Standard card + mini/micro variant → MiniCard
 * - Standard card + other variant    → Card
 * - Tarot card                        → TarotCard (variant is ignored, fixed size)
 * - Custom card                       → CustomCard (variant is ignored, as CustomCard
 *                                       manages its own size via the `size` prop)
 * - Otherwise                         → null
 *
 * This component does NOT include any wrapper Box — the caller is responsible for
 * positioning/spacing, so snapshots of existing consumers are unaffected.
 */
export function AnyCard({
  card,
  variant = 'simple',
  faceUp = false,
}: AnyCardProps) {
  const responsiveVariant = useResponsiveVariant()
  const resolved = variant === 'responsive' ? responsiveVariant : variant

  if (isStandardCard(card)) {
    if (resolved === 'mini' || resolved === 'micro') {
      return (
        <MiniCard
          id={card.id}
          suit={card.suit}
          value={card.value}
          faceUp={faceUp}
          variant={resolved}
        />
      )
    }

    return (
      <Card
        id={card.id}
        suit={card.suit}
        value={card.value}
        faceUp={faceUp}
        variant={resolved}
      />
    )
  }

  if (isTarotCard(card)) {
    return <TarotCard {...card} faceUp={faceUp} />
  }

  if (isCustomCard(card)) {
    return <CustomCard {...card} faceUp={faceUp} />
  }

  return null
}
