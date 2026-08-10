import { Box, Text, type BoxProps } from 'ink'
import React from 'react'
import { type TCard } from '../../types/index.js'
import { AnyCard } from '../AnyCard/index.js'

/**
 * Rounds to the nearest integer while rounding half-integer magnitudes away
 * from zero (unlike `Math.round`, which rounds -0.5 to -0). Scaled overlap
 * values (e.g. mini/micro vertical overlap) can land exactly on a negative
 * half-integer; rounding toward zero there would silently cancel the
 * overlap the caller asked for instead of shrinking it to the smallest
 * representable step.
 */
function roundOverlap(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value))
}

type CardStackProperties = {
  readonly cards: TCard[]
  readonly name: string
  readonly isFaceUp?: boolean
  readonly maxDisplay?: number
  readonly variant?: 'simple' | 'ascii' | 'minimal' | 'mini' | 'micro'
  readonly stackDirection?: 'vertical' | 'horizontal'
  readonly spacing?: {
    overlap?: number
    margin?: number
  }
  readonly alignment?: 'start' | 'center' | 'end'
}

export function CardStack({
  cards,
  name,
  isFaceUp = false,
  maxDisplay = 3,
  variant = 'simple',
  stackDirection = 'vertical',
  spacing = { overlap: -2, margin: 1 },
  alignment = 'start',
}: CardStackProperties) {
  const displayLimit = Math.max(0, Math.floor(maxDisplay))
  const displayCards = displayLimit === 0 ? [] : cards.slice(-displayLimit)

  // Overlap is implemented as a negative margin that pulls a card up/left
  // over its predecessor. Each card only repaints cells within its own
  // width/height, so overlap renders cleanly for cards of equal width (the
  // common case: all cards in a stack normally share one `variant`/size).
  // Mixing card widths within a single stack (e.g. standard cards alongside
  // a wider custom card) can leave a sliver of the wider card's border
  // visible past the narrower card's edge — see the "mixed standard and
  // custom cards" snapshot below.
  const getOverlap = () => {
    const baseOverlap = spacing.overlap ?? -2
    const scale = variant === 'mini' || variant === 'micro' ? 0.5 : 1

    return {
      marginLeft: roundOverlap(baseOverlap * scale),
      marginTop: roundOverlap(baseOverlap * 0.5 * scale),
    }
  }

  const { marginLeft, marginTop } = getOverlap()

  const getAlignmentStyle = (): BoxProps => {
    const alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch' =
      alignment === 'start'
        ? 'flex-start'
        : alignment === 'end'
          ? 'flex-end'
          : 'center'

    return { alignItems }
  }

  return (
    <Box
      flexDirection="column"
      marginX={spacing.margin}
      marginY={spacing.margin}
      {...getAlignmentStyle()}
    >
      <Text>
        {name} ({cards.length})
      </Text>
      <Box flexDirection={stackDirection === 'horizontal' ? 'row' : 'column'}>
        {displayCards.map((card, index) => (
          <Box
            key={card.id}
            marginLeft={
              stackDirection === 'horizontal' && index > 0 ? marginLeft : 0
            }
            marginTop={
              stackDirection === 'vertical' && index > 0 ? marginTop : 0
            }
          >
            <AnyCard card={card} variant={variant} faceUp={isFaceUp} />
          </Box>
        ))}
      </Box>
    </Box>
  )
}
