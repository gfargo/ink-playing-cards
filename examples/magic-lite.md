# Magic: The Gathering Lite Example

This example demonstrates how to implement a simplified version of Magic: The Gathering using the Card Game Library for Ink. This implementation showcases the use of custom cards, effects, and multiple zones.

## Game Rules (Simplified)

1. Each player starts with 20 life points and draws 7 cards.
2. Players take turns. Each turn consists of:
   - Draw a card
   - Play lands (limit one per turn)
   - Cast spells or summon creatures
   - Attack with creatures
3. Creatures have power (attack) and toughness (health).
4. The game ends when a player's life points reach 0 or they can't draw a card.

## Implementation

```jsx
import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { DeckProvider, useDeck, Card, Zone } from 'card-game-library-ink'

// Custom card types
const createLand = (name, manaType) => ({
  id: `land-${name}`,
  type: 'Land',
  name,
  manaType,
  effect: (gameState) => {
    gameState.currentPlayer.mana[manaType]++
  },
})

const createCreature = (name, manaCost, power, toughness) => ({
  id: `creature-${name}`,
  type: 'Creature',
  name,
  manaCost,
  power,
  toughness,
  canAttack: false,
})

const createSpell = (name, manaCost, effect) => ({
  id: `spell-${name}`,
  type: 'Spell',
  name,
  manaCost,
  effect,
})

const MagicLite = () => {
  const { deck, shuffle, draw } = useDeck()
  const [player1, setPlayer1] = useState({
    life: 20,
    mana: {},
    hand: [],
    battlefield: [],
  })
  const [player2, setPlayer2] = useState({
    life: 20,
    mana: {},
    hand: [],
    battlefield: [],
  })
  const [currentPlayer, setCurrentPlayer] = useState(player1)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    // Initialize deck with custom cards
    const customDeck = [
      createLand('Forest', 'green'),
      createLand('Mountain', 'red'),
      createCreature('Goblin', { red: 1 }, 1, 1),
      createCreature('Elf', { green: 1 }, 1, 1),
      createSpell('Lightning Bolt', { red: 1 }, (gameState) => {
        gameState.opponent.life -= 3
      }),
      // Add more cards...
    ]
    shuffle(customDeck)

    // Initial draw
    setPlayer1({ ...player1, hand: draw(7) })
    setPlayer2({ ...player2, hand: draw(7) })
  }, [])

  const playCard = (card) => {
    if (card.type === 'Land') {
      currentPlayer.battlefield.push(card)
      card.effect({ currentPlayer })
    } else if (card.type === 'Creature') {
      // Check if player has enough mana
      // Add creature to battlefield
    } else if (card.type === 'Spell') {
      // Check if player has enough mana
      // Apply spell effect
    }
    currentPlayer.hand = currentPlayer.hand.filter((c) => c.id !== card.id)
  }

  const attack = (attacker, defender) => {
    defender.life -= attacker.power
    if (defender.life <= 0) {
      setGameOver(true)
    }
  }

  const endTurn = () => {
    setCurrentPlayer(currentPlayer === player1 ? player2 : player1)
    // Reset mana, untap creatures, etc.
  }

  return (
    <Box flexDirection="column">
      <Text>Player 1 Life: {player1.life}</Text>
      <Text>Player 2 Life: {player2.life}</Text>
      <Box marginY={1}>
        <Text>Current Player Hand:</Text>
        {currentPlayer.hand.map((card) => (
          <Card key={card.id} {...card} onClick={() => playCard(card)} />
        ))}
      </Box>
      <Box marginY={1}>
        <Text>Current Player Battlefield:</Text>
        {currentPlayer.battlefield.map((card) => (
          <Card
            key={card.id}
            {...card}
            onClick={() =>
              attack(card, currentPlayer === player1 ? player2 : player1)
            }
          />
        ))}
      </Box>
      {gameOver ? (
        <Text>
          Game Over! {player1.life <= 0 ? 'Player 2' : 'Player 1'} wins!
        </Text>
      ) : (
        <Text>Press 'Space' to end turn</Text>
      )}
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <MagicLite />
  </DeckProvider>
)

export default App
```

This example showcases:

1. Creating custom card types (Land, Creature, Spell) with specific properties and effects
2. Managing multiple zones (hand, battlefield)
3. Implementing turn-based gameplay
4. Handling card effects and game state changes
5. Basic combat system

To fully implement this game, you would need to:

1. Expand the card database with more varied cards
2. Implement a more robust mana system and cost checking
3. Add more complex card effects and interactions
4. Implement a proper combat phase with blocking
5. Handle user input for various actions (playing cards, attacking, etc.)
6. Add more detailed game state management and validation

This example provides a foundation for building more complex card games with custom rules and effects using the Card Game Library for Ink.
