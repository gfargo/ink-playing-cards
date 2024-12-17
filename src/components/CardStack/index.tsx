import { Box, Text } from 'ink'
import React from 'react'
import { type CardProps, type TCard } from '../../types/index.js'
import Card from '../Card/index.js'

type CardStackProperties = {
  readonly cards: TCard[]
  readonly name: string
  readonly isFaceUp?: boolean
  readonly maxDisplay?: number
  // Readonly onCardClick?: (card: TCard) => void
  readonly variant?: 'simple' | 'ascii' | 'minimal'
  readonly stackDirection?: 'vertical' | 'horizontal'
}

export function CardStack({
  cards,
  name,
  isFaceUp = false,
  maxDisplay = 3,
  variant = 'simple',
  stackDirection = 'vertical',
}: // OnCardClick,
CardStackProperties) {
  const displayCards = cards.slice(-maxDisplay)

  const getOverlap = () => {
    switch (variant) {
      case 'ascii': {
        return { marginLeft: -10, marginTop: 2 }
      }

      case 'simple': {
        return { marginLeft: -6, marginTop: 1 }
      }

      case 'minimal': {
        return { marginLeft: -2, marginTop: 0 }
      }
    }
  }

  const { marginLeft, marginTop } = getOverlap()

  return (
    <Box flexDirection="column" alignItems="center">
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
            <Card
              suit={(card as CardProps).suit}
              value={(card as CardProps).value}
              faceUp={isFaceUp}
              variant={variant}
            />
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default CardStack
