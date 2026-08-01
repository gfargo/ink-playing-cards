import { Box, Text, type BoxProps } from 'ink'
import React from 'react'
import { type TCard } from '../../types/index.js'
import { AnyCard } from '../AnyCard/index.js'

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

  const getOverlap = () => {
    const baseOverlap = spacing.overlap ?? -2
    const scale = variant === 'mini' || variant === 'micro' ? 0.5 : 1

    return {
      marginLeft: baseOverlap * scale,
      marginTop: Math.abs(baseOverlap) * 0.5 * scale,
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
