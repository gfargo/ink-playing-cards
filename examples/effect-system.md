# Effect System Example

The Effect system in the Card Game Library for Ink allows you to define and apply effects to cards. This is useful for implementing card abilities, spells, or any game-specific rules. This example demonstrates how to use the Effect system.

## Basic Usage

```jsx
import React, { useState } from 'react'
import { Box, Text } from 'ink'
import { DeckProvider, useDeck, Card } from 'card-game-library-ink'

// Define some effects
const healEffect = {
  apply: (gameState, amount) => {
    gameState.playerHealth += amount
  },
}

const damageEffect = {
  apply: (gameState, amount) => {
    gameState.opponentHealth -= amount
  },
}

const drawCardEffect = {
  apply: (gameState) => {
    gameState.drawCard()
  },
}

// Create custom cards with effects
const createCard = (name, effect, amount = 0) => ({
  id: `card-${name}`,
  name,
  effect,
  amount,
})

const EffectExample = () => {
  const { deck, hand, draw, shuffle, effectManager } = useDeck()
  const [playerHealth, setPlayerHealth] = useState(20)
  const [opponentHealth, setOpponentHealth] = useState(20)

  React.useEffect(() => {
    // Initialize deck with custom cards
    const customDeck = [
      createCard('Heal', healEffect, 3),
      createCard('Damage', damageEffect, 2),
      createCard('Draw', drawCardEffect),
      // Add more cards...
    ]
    shuffle(customDeck)
    draw(5, 'player1')
  }, [])

  const playCard = (card) => {
    const gameState = {
      playerHealth,
      opponentHealth,
      drawCard: () => draw(1, 'player1'),
    }

    effectManager.applyCardEffects(card, gameState, { amount: card.amount })

    setPlayerHealth(gameState.playerHealth)
    setOpponentHealth(gameState.opponentHealth)

    hand.removeCard(card)
  }

  return (
    <Box flexDirection="column">
      <Text>Player Health: {playerHealth}</Text>
      <Text>Opponent Health: {opponentHealth}</Text>
      <Text>Hand:</Text>
      <Box>
        {hand.cards.map((card) => (
          <Card key={card.id} {...card} onClick={() => playCard(card)} />
        ))}
      </Box>
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <EffectExample />
  </DeckProvider>
)

export default App
```

This example demonstrates:

1. Defining custom effects (heal, damage, draw card)
2. Creating cards with associated effects
3. Applying effects when cards are played
4. Updating game state based on effect outcomes

The Effect system provides a flexible way to implement card abilities and game mechanics. You can easily create new effects and combine them to create complex card interactions.
