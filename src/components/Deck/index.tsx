import { Box } from 'ink'
import React from 'react'
import useDeck from '../../hooks/useDeck.js'
import Card from '../Card/index.js'

type DeckProperties = {
  readonly showTopCard?: boolean
  readonly style?: React.CSSProperties
}

function Deck({ showTopCard = false, style }: DeckProperties) {
  const { deck } = useDeck()

  const deckStyle = {
    padding: 1,
    borderStyle: 'single',
    ...style,
  }

  const renderTopCard = () => {
    if (deck.cards.length > 0) {
      // @ts-ignore
      return <Card {...deck.cards[0]} faceUp={showTopCard} />
    }

    //  Else if (customCards && customCards.length > 0) {
    //   return <CustomCard {...customCards[0]} faceUp={showTopCard} />
    // }
    return null
  }

  return (
    // @ts-ignore
    <Box flexDirection="column" alignItems="center" {...deckStyle}>
      {renderTopCard()}
      <Box marginTop={1}>
        <Card id="ace-spades" suit="spades" value="A" faceUp={false} />
      </Box>
    </Box>
  )
}

export default Deck
