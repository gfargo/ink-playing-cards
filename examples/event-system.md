# Event System Example

The Event system in the Card Game Library for Ink allows you to create, dispatch, and listen to game events. This enables you to implement complex game logic and card interactions. This example demonstrates how to use the Event system.

## Basic Usage

```jsx
import React, { useEffect } from 'react'
import { Box, Text } from 'ink'
import { DeckProvider, useDeck, Card } from 'card-game-library-ink'

const EventExample = () => {
  const { deck, hand, draw, shuffle, eventManager } = useDeck()

  useEffect(() => {
    shuffle()

    // Add event listeners
    eventManager.addEventListener('CARD_DRAWN', handleCardDrawn)
    eventManager.addEventListener('CARD_PLAYED', handleCardPlayed)

    return () => {
      // Remove event listeners on cleanup
      eventManager.removeEventListener('CARD_DRAWN', handleCardDrawn)
      eventManager.removeEventListener('CARD_PLAYED', handleCardPlayed)
    }
  }, [])

  const handleCardDrawn = (event) => {
    console.log(`Card drawn: ${event.data.card.name}`)
  }

  const handleCardPlayed = (event) => {
    console.log(`Card played: ${event.data.card.name}`)
  }

  const drawCard = () => {
    const drawnCard = draw(1, 'player1')[0]
    eventManager.dispatchEvent({
      type: 'CARD_DRAWN',
      data: { card: drawnCard },
    })
  }

  const playCard = (card) => {
    hand.removeCard(card)
    eventManager.dispatchEvent({ type: 'CARD_PLAYED', data: { card } })
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
      <Text>Press 'D' to draw a card</Text>
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <EventExample />
  </DeckProvider>
)

export default App
```

This example demonstrates:

1. Creating and registering event listeners
2. Dispatching events when game actions occur
3. Handling events to implement game logic

The Event system allows for decoupled and extensible game mechanics. You can easily add new events and listeners to implement complex card interactions and game rules.
