# Zone System

The zone system manages different areas of a card game — Deck, Hand, Discard Pile, and Play Area. All zones are immutable `TCard[]` arrays managed by the `DeckProvider` reducer. The `useDeck` hook provides convenient functions for moving cards between zones.

## Basic Usage

```tsx
import React from 'react'
import { Box, Text, useInput } from 'ink'
import { DeckProvider, useDeck, useHand, Card, CardStack } from 'ink-playing-cards'

const ZoneExample = () => {
  const { deck, discardPile, playArea, shuffle, draw } = useDeck()
  const { hand, playCard, discard } = useHand('player1')

  React.useEffect(() => {
    shuffle()
    draw(5, 'player1')
  }, [])

  useInput((input) => {
    if (input === 'd' && deck.length > 0) {
      draw(1, 'player1')
    }

    // Play the first card in hand
    if (input === 'p' && hand.length > 0) {
      playCard(hand[0].id)
    }

    // Discard the last card in hand
    if (input === 'x' && hand.length > 0) {
      discard(hand[hand.length - 1].id)
    }
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Deck: {deck.length} cards</Text>
      <CardStack cards={hand} name="Hand" isFaceUp maxDisplay={7} />
      <CardStack cards={playArea} name="Play Area" isFaceUp maxDisplay={5} />
      <Text>Discard Pile: {discardPile.length} cards</Text>
      <Text>
        [d] Draw | [p] Play first card | [x] Discard last card
      </Text>
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

## How Zones Work

Zones are plain arrays stored in the `DeckProvider` context:

```ts
zones: {
  deck: TCard[]                    // draw pile
  hands: Record<string, TCard[]>   // player hands keyed by ID
  discardPile: TCard[]             // discarded cards
  playArea: TCard[]                // cards in play
}
```

All zone mutations go through dispatch actions. The reducer returns new arrays — zones are never mutated in place.

## Available Actions

| Action | Effect |
|--------|--------|
| `shuffle()` | Shuffles the deck |
| `draw(count, playerId)` | Moves cards from deck to player's hand |
| `deal(count, playerIds)` | Deals cards to multiple players |
| `playCard(cardId)` via `useHand` | Moves card from hand to play area |
| `discard(cardId)` via `useHand` | Moves card from hand to discard pile |
| `reset(cards?)` | Resets deck, clears all hands and zones |
| `cutDeck(index)` | Splits deck at index and reorders |
| `addPlayer(id)` | Registers player with empty hand |
| `removePlayer(id)` | Removes player and their hand |

## Zone Utility Functions

For standalone zone operations outside the reducer (e.g., in game logic or custom reducers):

```ts
import { Zones } from 'ink-playing-cards'

const shuffled = Zones.shuffleCards(cards)
const [drawn, remaining] = Zones.drawCards(cards, 3)
const withCard = Zones.addCard(zone, card)
const withCards = Zones.addCards(zone, newCards)
const without = Zones.removeCard(zone, 'card-id')
const found = Zones.findCard(zone, 'card-id')
const cut = Zones.cutDeck(cards, 26)
```

All utility functions are pure — they return new arrays without mutating the input.

## Multi-Player Hands

Each player gets their own hand in `zones.hands`:

```tsx
const { hands, deal, addPlayer } = useDeck()

// Register players and deal
addPlayer('alice')
addPlayer('bob')
deal(7, ['alice', 'bob'])

// Access hands
const aliceHand = hands['alice'] ?? []
const bobHand = hands['bob'] ?? []
```

## Key Concepts

- Zones are immutable arrays — the reducer always returns new arrays
- `draw()` and `deal()` dispatch actions, they don't return cards directly
- Access drawn cards via `hands['playerId']` after the state update
- Every card has a unique `id` for reliable identification across zones
- `useHand(playerId)` is a convenience wrapper for single-player hand operations
