import { Box, Text, type BoxProps } from 'ink'
import React from 'react'
import { isCustomCard, isStandardCard, type TCard } from '../../types/index.js'
import Card from '../Card/index.js'
import { CustomCard } from '../CustomCard/index.js'
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
        {displayCards.map((card, index) => {
          const std = isStandardCard(card)
          return (
            <Box
              key={card.id}
              marginLeft={
                stackDirection === 'horizontal' && index > 0 ? marginLeft : 0
              }
              marginTop={
                stackDirection === 'vertical' && index > 0 ? marginTop : 0
              }
            >
              {std ? (
                variant === 'mini' || variant === 'micro' ? (
                  <MiniCard
                    id={card.id}
                    suit={card.suit}
                    value={card.value}
                    faceUp={isFaceUp}
                    variant={variant}
                  />
                ) : (
                  <Card
                    id={card.id}
                    suit={card.suit}
                    value={card.value}
                    faceUp={isFaceUp}
                    variant={variant}
                  />
                )
              ) : isCustomCard(card) ? (
                <CustomCard {...card} faceUp={isFaceUp} />
              ) : null}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
