# Event System

The event system dispatches game events automatically when the `DeckProvider` reducer processes actions. You can subscribe to these events to implement custom game logic, logging, animations, or sound effects.

## Basic Usage

```tsx
import React, { useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  useHand,
  CardStack,
  type GameEventData,
} from 'ink-playing-cards'

const EventExample = () => {
  const { deck, shuffle, draw, eventManager } = useDeck()
  const { hand, playCard } = useHand('player1')
  const [log, setLog] = React.useState<string[]>([])

  useEffect(() => {
    const listener = {
      handleEvent(event: GameEventData) {
        const msg = `${event.type}${event.playerId ? ` (${event.playerId})` : ''}`
        setLog((prev) => [...prev.slice(-4), msg])
      },
    }

    eventManager.addEventListener('CARDS_DRAWN', listener)
    eventManager.addEventListener('CARD_PLAYED', listener)
    eventManager.addEventListener('DECK_SHUFFLED', listener)

    return () => eventManager.removeAllListeners()
  }, [eventManager])

  useEffect(() => {
    shuffle()
    draw(5, 'player1')
  }, [])

  useInput((input) => {
    if (input === 'd') draw(1, 'player1')
    if (input === 'p' && hand.length > 0) playCard(hand[0].id)
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Deck: {deck.length} | Hand: {hand.length}</Text>
      <CardStack cards={hand} name="Hand" isFaceUp maxDisplay={5} />
      <Text bold>Event Log:</Text>
      {log.map((msg, i) => (
        <Text key={i} dimColor>  {msg}</Text>
      ))}
      <Text>[d] Draw | [p] Play first card</Text>
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

## Event Listener Interface

Listeners must implement `handleEvent`:

```ts
const listener = {
  handleEvent(event: GameEventData) {
    // event.type — the event name
    // event.playerId — who triggered it (optional)
    // event.card — single card involved (optional)
    // event.cards — multiple cards involved (optional)
    // event.count — number of cards (optional)
  },
}

eventManager.addEventListener('CARDS_DRAWN', listener)
eventManager.removeEventListener('CARDS_DRAWN', listener)
```

## Built-in Event Types

| Event | Dispatched When |
|-------|----------------|
| `DECK_SHUFFLED` | `shuffle()` is called |
| `CARDS_DRAWN` | `draw(count, playerId)` moves cards to a hand |
| `CARDS_DEALT` | `deal()` distributes cards (fires per player) |
| `CARD_PLAYED` | A card moves from hand to play area |
| `CARD_DISCARDED` | A card moves from hand to discard pile |
| `DECK_RESET` | `reset()` restores the deck |
| `DECK_CUT` | `cutDeck()` reorders the deck |

Custom string event types are also supported for game-specific events.

## EventManager API

```ts
const { eventManager } = useDeck()

eventManager.addEventListener(eventType, listener)
eventManager.removeEventListener(eventType, listener)
eventManager.dispatchEvent({ type: 'CUSTOM_EVENT', playerId: 'p1' })
eventManager.removeAllListeners()
```

## Key Concepts

- Events are dispatched automatically by the reducer — no manual dispatch needed for built-in actions
- Each `DeckProvider` instance creates its own `EventManager` (no cross-provider leaks)
- Always clean up listeners in `useEffect` return to avoid memory leaks
- Use `removeAllListeners()` for bulk cleanup
- You can dispatch custom events for game-specific logic
