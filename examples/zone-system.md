# Zone System Example

The Zone system in the Card Game Library for Ink allows you to manage different areas of the game, such as the deck, hand, discard pile, and play area. This example demonstrates how to use and interact with different zones.

## Basic Usage

```jsx
import React from 'react'
import { Box, Text } from 'ink'
import { DeckProvider, useDeck, Card } from 'card-game-library-ink'

const ZoneExample = () => {
  const { deck, hand, discardPile, playArea, draw, shuffle } = useDeck()

  React.useEffect(() => {
    shuffle()
    draw(5, 'player1')
  }, [])

  const playCard = (card) => {
    hand.removeCard(card)
    playArea.addCard(card)
  }

  const discardCard = (card) => {
    playArea.removeCard(card)
    discardPile.addCard(card)
  }

  return (
    <Box flexDirection="column">
      <Text>Deck: {deck.cards.length} cards</Text>
      <Text>Hand: {hand.cards.length} cards</Text>
      <Box>
        {hand.cards.map((card) => (
          <Card key={card.id} {...card} onClick={() => playCard(card)} />
        ))}
      </Box>
      <Text>Play Area: {playArea.cards.length} cards</Text>
      <Box>
        {playArea.cards.map((card) => (
          <Card key={card.id} {...card} onClick={() => discardCard(card)} />
        ))}
      </Box>
      <Text>Discard Pile: {discardPile.cards.length} cards</Text>
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <ZoneExample />
  </DeckProvider>
)

export default App
```

This example demonstrates:

1. Initializing different zones (deck, hand, play area, discard pile)
2. Moving cards between zones
3. Displaying the number of cards in each zone
4. Interacting with cards in different zones

The Zone system provides a flexible way to manage game state and card movement, allowing for easy implementation of various card game mechanics.
