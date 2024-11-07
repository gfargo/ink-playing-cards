# Custom Cards Example

This example demonstrates how to create and use custom cards with the Card Game Library for Ink. We'll create a simple game with unique card types and effects.

## Implementation

```jsx
import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { DeckProvider, useDeck, Card } from 'card-game-library-ink'

// Custom card factory functions
const createCreature = (name, power, toughness, effect = null) => ({
  id: `creature-${name}`,
  type: 'Creature',
  name,
  power,
  toughness,
  effect,
})

const createSpell = (name, effect) => ({
  id: `spell-${name}`,
  type: 'Spell',
  name,
  effect,
})

const createArtifact = (name, effect) => ({
  id: `artifact-${name}`,
  type: 'Artifact',
  name,
  effect,
})

// Game effects
const damageEffect = (amount) => (gameState) => {
  gameState.opponentHealth -= amount
}

const healEffect = (amount) => (gameState) => {
  gameState.playerHealth += amount
}

const drawCardEffect = (amount) => (gameState) => {
  gameState.drawCards(amount)
}

const CustomCardGame = () => {
  const { deck, hand, shuffle, draw, effectManager } = useDeck()
  const [playerHealth, setPlayerHealth] = useState(20)
  const [opponentHealth, setOpponentHealth] = useState(20)

  useEffect(() => {
    // Create a custom deck
    const customDeck = [
      createCreature('Goblin', 2, 1),
      createCreature('Dragon', 5, 5, damageEffect(2)),
      createSpell('Fireball', damageEffect(3)),
      createSpell('Healing Light', healEffect(4)),
      createArtifact('Crystal Ball', drawCardEffect(2)),
      // Add more custom cards...
    ]
    shuffle(customDeck)
    draw(5, 'player1')
  }, [])

  const playCard = (card) => {
    const gameState = {
      playerHealth,
      opponentHealth,
      drawCards: (amount) => draw(amount, 'player1'),
    }

    if (card.effect) {
      effectManager.applyCardEffects(card, gameState)
    }

    setPlayerHealth(gameState.playerHealth)
    setOpponentHealth(gameState.opponentHealth)

    hand.removeCard(card)
  }

  const renderCard = (card) => (
    <Box key={card.id} flexDirection="column" borderStyle="single" padding={1}>
      <Text>{card.name}</Text>
      <Text>{card.type}</Text>
      {card.type === 'Creature' && (
        <Text>
          Power: {card.power} / Toughness: {card.toughness}
        </Text>
      )}
    </Box>
  )

  return (
    <Box flexDirection="column">
      <Text>Player Health: {playerHealth}</Text>
      <Text>Opponent Health: {opponentHealth}</Text>
      <Text>Hand:</Text>
      <Box flexWrap="wrap">
        {hand.cards.map((card) => (
          <Box key={card.id} marginRight={1} marginBottom={1}>
            {renderCard(card)}
            <Text onPress={() => playCard(card)}>Play</Text>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <CustomCardGame />
  </DeckProvider>
)

export default App
```

This example showcases:

1. Creating custom card types (Creature, Spell, Artifact)
2. Defining card-specific effects
3. Building a custom deck with various card types
4. Rendering custom cards with type-specific information
5. Applying card effects when played

The custom card system allows for great flexibility in creating unique game mechanics and card interactions. You can easily extend this system to include more complex card types, effects, and game rules.
