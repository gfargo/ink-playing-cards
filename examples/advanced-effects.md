# Advanced Effects

This example demonstrates composing multiple effect types to create a simple collectible card game with complex card abilities.

## Implementation

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  useHand,
  Effects,
  CardStack,
  Card,
  type TCard,
  type GameState,
  type GameEventData,
} from 'ink-playing-cards'

// Helper to build a game state snapshot for effect evaluation
function buildGameState(
  deck: TCard[],
  hand: TCard[],
  turn: number
): GameState {
  return {
    currentPlayerId: 'player1',
    players: ['player1'],
    turn,
    phase: 'playing',
    zones: {
      deck: [...deck],
      hands: { player1: [...hand] },
      discardPile: [],
      playArea: [],
    },
  }
}

const AdvancedEffectsGame = () => {
  const { deck, shuffle, draw, effectManager } = useDeck()
  const { hand, playCard } = useHand('player1')
  const [opponentLife, setOpponentLife] = useState(20)
  const [turn, setTurn] = useState(0)
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    shuffle()
    draw(5, 'player1')
  }, [])

  const addLog = (msg: string) =>
    setLog((prev) => [...prev.slice(-3), msg])

  const playCardWithEffects = (card: TCard) => {
    const target = { life: opponentLife }
    const gs = buildGameState(deck, hand, turn)
    const eventData: GameEventData = {
      type: 'CARD_PLAYED',
      playerId: 'player1',
      card,
      target,
    }

    effectManager.applyCardEffects(card, gs, eventData)
    setOpponentLife(target.life)
    playCard(card.id)
    addLog(`Played ${card.id} — opponent life: ${target.life}`)
  }

  const endTurn = () => {
    setTurn((t) => t + 1)
    draw(1, 'player1')
    addLog(`Turn ${turn + 1}`)
  }

  useInput((input) => {
    if (input === 'e') endTurn()
    if (input >= '1' && input <= '5') {
      const idx = Number(input) - 1
      if (hand[idx]) playCardWithEffects(hand[idx])
    }
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Opponent Life: {opponentLife} | Turn: {turn}</Text>
      <Text>Deck: {deck.length}</Text>
      <CardStack cards={hand} name="Hand" isFaceUp maxDisplay={5} />
      <Text bold>Log:</Text>
      {log.map((msg, i) => (
        <Text key={i} dimColor>  {msg}</Text>
      ))}
      <Text>[1-5] Play card | [e] End turn</Text>
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

## Creating Cards with Effects

Before the game starts, attach effects to cards:

```ts
const cards: TCard[] = [
  { id: 'fireball', suit: 'hearts', value: 'A' },
  { id: 'growth', suit: 'diamonds', value: 'K' },
  { id: 'poison', suit: 'spades', value: 'Q' },
  { id: 'heal-aura', suit: 'clubs', value: 'J' },
  { id: 'time-bomb', suit: 'hearts', value: '10' },
  { id: 'combo', suit: 'diamonds', value: '9' },
]

// Targeted damage
Effects.attachEffectToCard(cards[0], new Effects.DamageEffect(3))

// Draw 2 cards only on even turns
Effects.attachEffectToCard(
  cards[1],
  new Effects.ConditionalEffect(
    (gs) => gs.turn % 2 === 0,
    new Effects.DrawCardEffect(2)
  )
)

// Triggered: 1 damage whenever any card is played
Effects.attachEffectToCard(
  cards[2],
  new Effects.TriggeredEffect('CARD_PLAYED', new Effects.DamageEffect(1))
)

// Continuous: heals while hand is small
Effects.attachEffectToCard(
  cards[3],
  new Effects.ContinuousEffect(
    (gs) => (gs.zones.hands['player1']?.length ?? 0) < 3,
    (gs) => { /* apply healing */ },
    () => { /* remove healing */ }
  )
)

// Delayed: 5 damage after 3 turns
Effects.attachEffectToCard(
  cards[4],
  new Effects.DelayedEffect(3, new Effects.DamageEffect(5))
)

// Combo: 2 damage + conditional bonus 3 damage
Effects.attachEffectToCard(cards[5], new Effects.DamageEffect(2))
Effects.attachEffectToCard(
  cards[5],
  new Effects.ConditionalEffect(
    (gs) => gs.turn > 3,
    new Effects.DamageEffect(3)
  )
)
```

## Effect Composition Patterns

- Chain multiple effects on one card with repeated `attachEffectToCard` calls
- Nest effects: `DelayedEffect(3, TargetedEffect(selector, DamageEffect(5)))`
- Use `ConditionalEffect` for situational abilities
- Use `TriggeredEffect` for reactive abilities that fire on specific events
- Use `ContinuousEffect` for persistent auras that toggle based on game state
