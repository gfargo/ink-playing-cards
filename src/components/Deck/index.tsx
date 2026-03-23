import { Box, type BoxProps } from 'ink'
import React, { useMemo } from 'react'
import { useDeck } from '../../hooks/useDeck.js'
import {
  isStandardCard,
  type TCardValue,
  type TSuit,
} from '../../types/index.js'
import Card from '../Card/index.js'

type DeckProperties = {
  readonly showTopCard?: boolean
  readonly style?: BoxProps
  readonly variant?: 'simple' | 'ascii' | 'minimal'
  readonly placeholderCard?: { suit: TSuit; value: TCardValue }
}

export function Deck({
  showTopCard,
  style,
  variant = 'simple',
  placeholderCard = { suit: 'hearts', value: 'A' },
}: DeckProperties) {
  const { deck } = useDeck()

  const deckStyle: BoxProps = {
    padding: 1,
    borderStyle: 'single',
    ...style,
  }

  const renderTopCard = useMemo(() => {
    if (deck.length > 0) {
      const topCard = deck.at(-1)
      if (!topCard || !isStandardCard(topCard)) {
        return null
      }

      return (
        <Card
          id={topCard.id}
          suit={topCard.suit}
          value={topCard.value}
          faceUp={showTopCard}
          variant={variant}
        />
      )
    }

    return null
  }, [deck, showTopCard, variant])

  return (
    <Box flexDirection="column" alignItems="center" {...deckStyle}>
      {renderTopCard}
      <Box marginTop={1}>
        <Card
          id="placeholder"
          suit={placeholderCard.suit}
          value={placeholderCard.value}
          faceUp={!showTopCard}
          variant={variant}
        />
      </Box>
    </Box>
  )
}
