# Zone System

The zone system manages different areas of a card game — Deck, Hand, Discard Pile, and Play Area — plus any number of custom named zones (tableau columns, foundations, a stock/waste pile, etc). All zones are immutable `TCard[]` arrays managed by the `DeckProvider` reducer. The `useDeck` hook provides convenient functions for moving cards between zones.

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
  deck: TCard[]                       // draw pile
  hands: Record<string, TCard[]>      // player hands keyed by ID
  discardPile: TCard[]                // discarded cards
  playArea: TCard[]                   // cards in play
  custom: Record<string, TCard[]>     // arbitrary named zones, keyed by name
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
| `moveCard(cardId, from, to, position?)` | Moves a card between any two zones (built-in or custom) |
| `setZone(name, cards)` | Seeds/overwrites a custom zone (e.g. to deal out a tableau column) |
| `clearZone(name)` | Removes a custom zone |
| `getZone(name)` | Reads the current cards in any zone by name |

## Custom Named Zones

Games with more structure than deck/hand/discard/play — solitaire tableaus, foundations, a stock/waste pile — can use `custom` zones instead of local `useState`. Custom zones are created on first write and addressed by name:

```tsx
const { deck, customZones, moveCard, setZone, getZone } = useDeck()

// Deal four tableau columns from the deck
React.useEffect(() => {
  setZone('tableau-0', deck.slice(0, 3))
  setZone('tableau-1', deck.slice(3, 6))
}, [])

// Move the top card of a tableau column to a foundation pile
const tableau = getZone('tableau-0')
const top = tableau.at(-1)
if (top) {
  moveCard(top.id, 'tableau-0', 'foundation-hearts')
}

// Read all custom zones (e.g. to render every tableau column)
Object.entries(customZones).map(([name, cards]) => (/* ... */))
```

`moveCard`'s `position` argument controls where the card lands in the destination zone: `'top'` (append, default), `'bottom'` (prepend), or a numeric index. `moveCard` is a no-op if the card isn't found in the source zone. Built-in zone names (`deck`, `discardPile`, `playArea`) can be used as either `from` or `to` alongside custom zone names — `setZone`/`clearZone` are custom-zones-only and are no-ops when passed a built-in name.

A `CARD_MOVED` event (`{ type: 'CARD_MOVED', card, from, to }`) fires on every successful `moveCard` — see [Event System](./event-system.md).

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
