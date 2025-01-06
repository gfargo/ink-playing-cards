import { Box, Text, type BoxProps } from 'ink'
import React from 'react'
import { type CardProps, type TCard } from '../../types/index.js'
import Card from '../Card/index.js'
import { MiniCard } from '../MiniCard/index.js'

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
  const displayCards = cards.slice(-maxDisplay)

  // Calculate overlap based on variant and custom spacing
  const getOverlap = () => {
    const baseOverlap = spacing.overlap ?? -2
    const scale = variant === 'mini' || variant === 'micro' ? 0.5 : 1

    return {
      marginLeft: baseOverlap * scale,
      marginTop: Math.abs(baseOverlap) * 0.5 * scale,
    }
  }

  const { marginLeft, marginTop } = getOverlap()

  // Get alignment style
  const getAlignmentStyle = (): BoxProps => {
    const alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch' = 
      alignment === 'start' ? 'flex-start' :
      alignment === 'end' ? 'flex-end' :
      'center'
    
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
            {variant === 'mini' || variant === 'micro' ? (
              <MiniCard
                suit={(card as CardProps).suit}
                value={(card as CardProps).value}
                faceUp={isFaceUp}
                variant={variant}
              />
            ) : (
              <Card
                suit={(card as CardProps).suit}
                value={(card as CardProps).value}
                faceUp={isFaceUp}
                variant={variant}
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
