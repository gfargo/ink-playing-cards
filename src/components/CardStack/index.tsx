import { Box, Text } from 'ink'
import React from 'react'
import { type Card } from '../../types/index.js'

type CardStackProperties = {
  readonly cards: Card[]
  readonly name: string
  readonly isFaceUp?: boolean
  readonly maxDisplay?: number
  readonly onCardClick?: (card: Card) => void
}

export function CardStack({
  cards,
  name,
  isFaceUp = false,
  maxDisplay = 3,
  onCardClick,
}: CardStackProperties) {
  const displayCards = cards.slice(-maxDisplay)

  console.log('TODO: implenet onclick', onCardClick)

  return (
    <Box flexDirection="column" alignItems="center">
      <Text>
        {name} ({cards.length})
      </Text>
      <Box>
        {displayCards.map((card, index) => (
          <Box
            key={card.id}
            marginLeft={index > 0 ? -2 : 0}
            marginTop={Number(index)}
          >
            {isFaceUp ? (
              <Text backgroundColor="white" color="black">
                {card.value}
              </Text>
            ) : (
              <Text backgroundColor="gray">🂠</Text>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default CardStack
