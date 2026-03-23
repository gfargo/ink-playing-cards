# Effect System

The effect system lets you attach abilities to cards that evaluate against game state. Effects are plain classes implementing the `CardEffect` interface — they're not React-specific and can be composed together.

## Basic Usage

```tsx
import React from 'react'
import { Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  useHand,
  Effects,
  CardStack,
  type GameState,
  type TCard,
} from 'ink-playing-cards'

const EffectExample = () => {
  const { deck, shuffle, effectManager, eventManager } = useDeck()
  const { hand, playCard } = useHand('player1')
  const [targetLife, setTargetLife] = React.useState(20)

  React.useEffect(() => {
    // Create cards with effects
    const cards: TCard[] = [
      { id: 'fireball', suit: 'hearts', value: 'A' },
      { id: 'draw-spell', suit: 'diamonds', value: 'K' },
      { id: 'time-bomb', suit: 'spades', value: 'Q' },
    ]

    // Attach effects
    Effects.attachEffectToCard(cards[0], new Effects.DamageEffect(3))
    Effects.attachEffectToCard(cards[1], new Effects.DrawCardEffect(2))
    Effects.attachEffectToCard(cards[2], new Effects.DelayedEffect(2, new Effects.DamageEffect(5)))

    // Use these as initial cards
    shuffle()
  }, [])

  const applyCardEffects = (card: TCard) => {
    const gameState: GameState = {
      currentPlayerId: 'player1',
      players: ['player1'],
      turn: 0,
      phase: 'playing',
      zones: { deck, hands: { player1: hand }, discardPile: [], playArea: [] },
    }
    const target = { life: targetLife }
    effectManager.applyCardEffects(card, gameState, {
      type: 'CARD_PLAYED',
      playerId: 'player1',
      card,
      target,
    })
    setTargetLife(target.life)
  }

  return (
    <Box flexDirection="column">
      <Text>Target Life: {targetLife}</Text>
      <CardStack cards={hand} name="Hand" isFaceUp maxDisplay={5} />
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

## Effect Types

### DamageEffect

Reduces `target.life` or `target.health` by the specified amount:

```ts
const fireball = new Effects.DamageEffect(3)
// Requires eventData.target with a `life` or `health` property
```

### DrawCardEffect

Moves cards from the deck to a player's hand (mutates `gameState.zones`):

```ts
const drawTwo = new Effects.DrawCardEffect(2)
// Uses eventData.playerId or falls back to gameState.currentPlayerId
// Clamps to available cards in deck
```

### DelayedEffect

Registers on first call, fires the inner effect after N turns:

```ts
const timeBomb = new Effects.DelayedEffect(3, new Effects.DamageEffect(5))
// Turn 0: registers (no effect)
// Turn 1-2: waiting
// Turn 3: fires DamageEffect(5), then resets
```

### ConditionalEffect

Applies the inner effect only when a condition is met:

```ts
const lateGameDraw = new Effects.ConditionalEffect(
  (gs) => gs.turn >= 5,
  new Effects.DrawCardEffect(2)
)
```

### TriggeredEffect

Fires the inner effect only when the event type matches:

```ts
const onPlay = new Effects.TriggeredEffect(
  'CARD_PLAYED',
  new Effects.DamageEffect(1)
)
```

### ContinuousEffect

Applies while a condition is true, removes when false:

```ts
const healAura = new Effects.ContinuousEffect(
  (gs) => gs.zones.hands[gs.currentPlayerId]?.length < 3,  // condition
  (gs) => { /* apply: heal logic */ },                       // apply
  (gs) => { /* remove: cleanup logic */ }                    // remove
)
```

### TargetedEffect

Selects a target from game state and passes it to the inner effect:

```ts
const snipe = new Effects.TargetedEffect(
  (gs) => ({ life: 10 }),  // target selector
  new Effects.DamageEffect(2)
)
```

## Composing Effects

Effects can be chained by attaching multiple to a single card:

```ts
const card = { id: 'combo', suit: 'hearts', value: 'A' }

// This card deals damage AND draws cards
Effects.attachEffectToCard(card, new Effects.DamageEffect(2))
Effects.attachEffectToCard(card, new Effects.DrawCardEffect(1))

// All effects fire when applied
effectManager.applyCardEffects(card, gameState, eventData)
```

## CardEffect Interface

Create custom effects by implementing the `CardEffect` interface:

```ts
import type { CardEffect, GameState, GameEventData } from 'ink-playing-cards'

const healEffect: CardEffect = {
  apply(gameState: GameState, eventData: GameEventData) {
    const target = eventData.target as { life: number } | undefined
    if (target) target.life += 5
  },
}
```

## Key Concepts

- Effects are plain classes, not React-specific — they can be used anywhere
- `attachEffectToCard` adds to the card's `effects` array
- `effectManager.applyCardEffects` iterates all effects on a card
- Effects receive `GameState` (zones, turn, players) and `GameEventData` (event type, target, etc.)
- `DrawCardEffect` mutates `gameState.zones` directly (it's designed for effect evaluation, not reducer use)
- `DamageEffect` mutates `eventData.target` — pass an object with `life` or `health`
