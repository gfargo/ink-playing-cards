import { Box } from 'ink'
import React, { useMemo } from 'react'
import useDeck from '../../hooks/useDeck.js'
import {
  type CardProps,
  type TCardValue,
  type TSuit,
} from '../../types/index.js'
import Card from '../Card/index.js'

type DeckProperties = {
  readonly showTopCard?: boolean
  readonly style?: React.CSSProperties
  readonly variant?: 'simple' | 'ascii' | 'minimal'
  readonly placeholderCard?: { suit: TSuit; value: TCardValue }
}

function Deck({
  showTopCard,
  style,
  variant = 'simple',
  placeholderCard = { suit: 'hearts', value: 'A' },
}: DeckProperties) {
  const { deck } = useDeck()

  const deckStyle = {
    padding: 1,
    borderStyle: 'single',
    ...style,
  }

  const renderTopCard = useMemo(() => {
    if (deck.cards.length > 0) {
      const topCard = deck.cards[0] as CardProps
      if (topCard?.suit === undefined || topCard.value === undefined) {
        console.error('Invalid top card:', topCard)
        return null
      }

      return (
        <Card
          suit={topCard.suit}
          value={topCard.value}
          faceUp={showTopCard}
          variant={variant}
        />
      )
    }

    //  Else if (customCards && customCards.length > 0) {
    //   return <CustomCard {...customCards[0]} faceUp={showTopCard} variant={variant} />
    // }
    return null
  }, [deck.cards, showTopCard, variant])

  return (
    // @ts-ignore
    <Box flexDirection="column" alignItems="center" {...deckStyle}>
      {renderTopCard}
      <Box marginTop={1}>
        <Card
          suit={placeholderCard.suit}
          value={placeholderCard.value}
          faceUp={!showTopCard}
          variant={variant}
        />
      </Box>
    </Box>
  )
}

export default Deck
