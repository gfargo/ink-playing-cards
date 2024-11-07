# Advanced Effects Example

This example demonstrates how to use the advanced effect system in the Card Game Library for Ink. We'll create a simple collectible card game that showcases various types of effects, including conditional, triggered, continuous, delayed, and targeted effects.

## Implementation

```jsx
import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { DeckProvider, useDeck, Card } from 'card-game-library-ink'
import { CardStack } from '../components/CardStack'
import {
  ConditionalEffect,
  TriggeredEffect,
  ContinuousEffect,
  DelayedEffect,
  TargetedEffect,
  DrawCardEffect,
  DamageEffect,
} from '../systems/Effects'

// Custom card factory function
const createCard = (name, effects) => ({
  id: `card-${name}`,
  name,
  effects,
})

const AdvancedEffectsGame = () => {
  const { deck, hand, discardPile, shuffle, draw, effectManager } = useDeck()
  const [playerHealth, setPlayerHealth] = useState(30)
  const [opponentHealth, setOpponentHealth] = useState(30)
  const [turn, setTurn] = useState(1)
  const [activeEffects, setActiveEffects] = useState([])

  useEffect(() => {
    // Create a custom deck with advanced effects
    const customDeck = [
      createCard('Fireball', [
        new TargetedEffect(
          (gameState) => gameState.opponent,
          new DamageEffect(3)
        ),
      ]),
      createCard('Growth Spell', [
        new ConditionalEffect(
          (gameState) => gameState.turn % 2 === 0,
          new DrawCardEffect(2)
        ),
      ]),
      createCard('Poison Dart', [
        new TriggeredEffect('TURN_END', new DamageEffect(1)),
      ]),
      createCard('Healing Aura', [
        new ContinuousEffect(
          (gameState) => gameState.playerHealth < 15,
          (gameState) => {
            gameState.playerHealth += 1
          },
          () => {}
        ),
      ]),
      createCard('Time Bomb', [new DelayedEffect(3, new DamageEffect(5))]),
      createCard('Combo Strike', [
        new DamageEffect(2),
        new ConditionalEffect(
          (gameState) => gameState.cardsPlayedThisTurn > 1,
          new DamageEffect(3)
        ),
      ]),
    ]
    shuffle(customDeck)
    draw(5, 'player1')
  }, [])

  const playCard = (card) => {
    const gameState = {
      playerHealth,
      opponentHealth,
      turn,
      cardsPlayedThisTurn: hand.cards.length - 1,
      opponent: {
        takeDamage: (damage) => setOpponentHealth((prev) => prev - damage),
      },
      player: {
        takeDamage: (damage) => setPlayerHealth((prev) => prev - damage),
      },
    }

    effectManager.applyCardEffects(card, gameState, {})

    setPlayerHealth(gameState.playerHealth)
    setOpponentHealth(gameState.opponentHealth)

    if (card.effects.some((effect) => effect instanceof ContinuousEffect)) {
      setActiveEffects([...activeEffects, card])
    }

    hand.removeCard(card)
    discardPile.addCard(card)
  }

  const endTurn = () => {
    setTurn((prev) => prev + 1)
    draw(1, 'player1')

    // Apply continuous effects
    const gameState = {
      playerHealth,
      opponentHealth,
      turn: turn + 1,
      opponent: {
        takeDamage: (damage) => setOpponentHealth((prev) => prev - damage),
      },
      player: {
        takeDamage: (damage) => setPlayerHealth((prev) => prev - damage),
      },
    }

    activeEffects.forEach((card) => {
      effectManager.applyCardEffects(card, gameState, { type: 'TURN_END' })
    })

    setPlayerHealth(gameState.playerHealth)
    setOpponentHealth(gameState.opponentHealth)
  }

  return (
    <Box flexDirection="column">
      <Text>Player Health: {playerHealth}</Text>
      <Text>Opponent Health: {opponentHealth}</Text>
      <Text>Turn: {turn}</Text>
      <Box flexDirection="row" justifyContent="space-between">
        <CardStack cards={deck.cards} name="Deck" />
        <CardStack
          cards={hand.cards}
          name="Hand"
          faceUp
          maxDisplay={5}
          onCardClick={playCard}
        />
        <CardStack cards={discardPile.cards} name="Discard" faceUp />
      </Box>
      <Text>Active Effects:</Text>
      <CardStack cards={activeEffects} name="Active Effects" faceUp />
      <Text onPress={endTurn}>End Turn</Text>
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <AdvancedEffectsGame />
  </DeckProvider>
)

export default App
```

This example showcases:

1. **Conditional Effect**: The "Growth Spell" card draws 2 cards only on even-numbered turns.
2. **Triggered Effect**: The "Poison Dart" card deals 1 damage at the end of each turn.
3. **Continuous Effect**: The "Healing Aura" card heals the player for 1 health each turn if their health is below 15.
4. **Delayed Effect**: The "Time Bomb" card deals 5 damage after 3 turns.
5. **Targeted Effect**: The "Fireball" card deals 3 damage directly to the opponent.
6. **Chained Effects**: The "Combo Strike" card deals 2 damage and an additional 3 damage if it's not the first card played this turn.

The game loop handles the application of continuous effects and triggered effects at the end of each turn. This example demonstrates how the advanced effect system can be used to create complex card interactions and game mechanics.

To further expand this example, you could add more cards with unique combinations of effects, implement a more detailed combat system, or add additional phases to each turn (e.g., draw phase, main phase, combat phase).

This advanced effect system provides a flexible foundation for creating a wide variety of card games with complex interactions and abilities.
