# Ink Playing Cards

A flexible framework for building terminal-based card games with [React](https://react.dev/) and [Ink](https://github.com/vadimdemedes/ink). Components, hooks, and game systems for managing card state and rendering in the terminal.

## Requirements

- Node.js >= 20
- React >= 19
- Ink >= 6

## Installation

```bash
npm install ink-playing-cards
```

## Quick Start

```tsx
import React from 'react'
import { render } from 'ink'
import { Box, Text } from 'ink'
import { DeckProvider, useDeck, CardStack } from 'ink-playing-cards'

const Game = () => {
  const { deck, hands, shuffle, draw } = useDeck()

  React.useEffect(() => {
    shuffle()
    draw(5, 'player1')
  }, [])

  return (
    <Box flexDirection="column">
      <Text>Deck: {deck.length} cards</Text>
      <CardStack cards={deck} name="Deck" maxDisplay={1} />
      <Text>Your hand:</Text>
      <CardStack
        cards={hands['player1'] ?? []}
        name="Hand"
        isFaceUp
        maxDisplay={5}
      />
    </Box>
  )
}

render(
  <DeckProvider>
    <Game />
  </DeckProvider>
)
```

## Features

- Standard and custom card components with multiple display variants (simple, ascii, minimal, mini, micro, unicode)
- Zone system (Deck, Hand, Discard Pile, Play Area) for managing game areas
- Event system for responding to draws, plays, discards, shuffles, and other game actions
- Effect system supporting conditional, triggered, continuous, delayed, and targeted effects
- Hooks (`useDeck`, `useHand`) for accessing game state and dispatching actions
- `GameProvider` context for turn management and game phases
- Theming support for ASCII card art (original, geometric, animal, robot, pixel, medieval)
- Custom card component with structured layout regions and freeform mode
- Utility functions: `createStandardDeck`, `createPairedDeck`

## Architecture

```
DeckProvider (context + useReducer)
├── zones: { deck, hands, discardPile, playArea }  ← immutable TCard[] arrays
├── players: string[]
├── eventManager: EventManager                      ← game event dispatch
├── effectManager: EffectManager                    ← card effect evaluation
└── dispatch(action)                                ← state updates via actions
```

All state flows through the `DeckProvider` reducer. The `useDeck` hook wraps dispatch calls into convenient functions. Zones are plain arrays — the reducer returns new arrays on every action.

## Components

### Card

Standard playing card with multiple display variants:

```tsx
<Card
  id="hearts-A-abc123"
  suit="hearts"
  value="A"
  variant="simple"   // 'simple' | 'ascii' | 'minimal'
  theme="original"   // 'original' | 'geometric' | 'animal' | 'robot' | 'pixel' | 'medieval'
  faceUp={true}
  selected={false}
  rounded={true}
/>
```

### MiniCard

Compact card for space-efficient layouts:

```tsx
<MiniCard
  id="spades-K-def456"
  suit="spades"
  value="K"
  variant="mini"     // 'mini' | 'micro'
  faceUp={true}
/>
```

### UnicodeCard

Single-character Unicode card using standard playing card symbols (U+1F0A0–U+1F0FF):

```tsx
<UnicodeCard
  suit="hearts"
  value="A"
  faceUp={true}
  bordered={false}
  rounded={true}
  size={1}
  dimmed={false}
/>
```

Includes all 52 standard cards, jokers, and card back symbol with automatic suit-based coloring.

### CustomCard

Freeform card for non-standard card games (TCG, color-matching, party games):

```tsx
<CustomCard
  id="flame-lance"
  size="large"        // 'micro' | 'mini' | 'small' | 'medium' | 'large'
  title="Flame Lance"
  cost="{R}"
  asciiArt={`  /\\_/\\`}
  typeLine="Instant"
  description="Deal 3 damage to any target."
  footerLeft="3/4"
  footerRight="R"
  symbols={[{ char: '★', position: 'top-left', color: 'yellow' }]}
  borderColor="red"
  textColor="white"
  faceUp={true}
/>
```

Supports structured layout (title, cost, art, typeLine, description, footer) or freeform mode via `content` prop. Custom card backs via the `back` prop.

### CardStack

Displays cards in a horizontal or vertical stack. Supports both standard and custom cards:

```tsx
<CardStack
  cards={handCards}
  name="Player Hand"
  variant="simple"
  stackDirection="horizontal"  // 'horizontal' | 'vertical'
  spacing={{ overlap: -2, margin: 1 }}
  maxDisplay={5}
  isFaceUp={true}
/>
```

### CardGrid

Arranges cards in a grid layout:

```tsx
<CardGrid
  rows={3}
  cols={3}
  cards={gameBoard}
  variant="simple"
  spacing={{ row: 1, col: 1 }}
  fillEmpty={true}
  isFaceUp={true}
/>
```

### Deck

Displays the deck with an optional top card preview. Must be used inside a `DeckProvider`:

```tsx
<Deck
  variant="simple"
  showTopCard={true}
  placeholderCard={{ suit: 'hearts', value: 'A' }}
/>
```

## Hooks

### useDeck

Primary hook for deck operations. Must be used inside a `DeckProvider`.

```tsx
const {
  deck,           // TCard[] — current deck
  hands,          // Record<string, TCard[]> — player hands by ID
  discardPile,    // TCard[] — discard pile
  playArea,       // TCard[] — play area
  players,        // string[] — registered player IDs
  backArtwork,    // BackArtwork — card back art per variant
  eventManager,   // EventManager — subscribe to game events
  effectManager,  // EffectManager — apply card effects
  shuffle,        // () => void
  draw,           // (count, playerId) => void
  reset,          // (cards?) => void
  deal,           // (count, playerIds) => void
  cutDeck,        // (index) => void
  addPlayer,      // (playerId) => void
  removePlayer,   // (playerId) => void
  getPlayerHand,  // (playerId) => TCard[]
  addCustomCard,  // (card: CustomCardProps) => void
  removeCustomCard, // (cardId) => void
  setBackArtwork, // (artwork: Partial<BackArtwork>) => void
} = useDeck()
```

### useHand

Convenience hook for a specific player's hand:

```tsx
const { hand, drawCard, playCard, discard } = useHand('player1')

drawCard(2)              // draw 2 cards
playCard('card-id')      // move card to play area
discard('card-id')       // move card to discard pile
```

## Contexts

### DeckProvider

Wraps your game and provides deck state via React context + useReducer:

```tsx
<DeckProvider initialCards={customCards}>
  <Game />
</DeckProvider>
```

Accepts optional `initialCards` (defaults to standard 52-card deck) and `customReducer` for extending the reducer.

### GameProvider

Manages turn order, current player, and game phases:

```tsx
<GameProvider initialPlayers={['alice', 'bob']}>
  <Game />
</GameProvider>
```

Dispatches `SET_CURRENT_PLAYER`, `NEXT_TURN`, and `SET_PHASE` actions.

## Core Systems

### Zones

Pure utility functions for immutable zone operations:

```tsx
import { Zones } from 'ink-playing-cards'

const shuffled = Zones.shuffleCards(deck)
const [drawn, remaining] = Zones.drawCards(deck, 5)
const withCard = Zones.addCard(hand, card)
const without = Zones.removeCard(hand, 'card-id')
const found = Zones.findCard(deck, 'card-id')
const cut = Zones.cutDeck(deck, 26)
```

Also exports legacy class-based zones (`Deck`, `Hand`, `DiscardPile`, `PlayArea`) for standalone use.

### Events

Subscribe to game events dispatched by the reducer:

```tsx
const { eventManager } = useDeck()

const listener = {
  handleEvent(event) {
    console.log(event.type, event.playerId, event.cards)
  }
}

eventManager.addEventListener('CARDS_DRAWN', listener)
eventManager.removeEventListener('CARDS_DRAWN', listener)
eventManager.removeAllListeners()
```

Event types: `CARDS_DRAWN`, `CARDS_DEALT`, `CARD_PLAYED`, `CARD_DISCARDED`, `DECK_SHUFFLED`, `DECK_RESET`, `DECK_CUT`, plus custom strings.

### Effects

Attach effects to cards for complex game mechanics:

```tsx
import { Effects } from 'ink-playing-cards'

const fireball = new Effects.DamageEffect(3)
const drawTwo = new Effects.DrawCardEffect(2)
const timeBomb = new Effects.DelayedEffect(3, new Effects.DamageEffect(5))
const conditional = new Effects.ConditionalEffect(
  (gs) => gs.turn > 3,
  new Effects.DrawCardEffect(1)
)
const triggered = new Effects.TriggeredEffect('CARD_PLAYED', fireball)

Effects.attachEffectToCard(card, fireball)
effectManager.applyCardEffects(card, gameState, eventData)
```

Effect types: `ConditionalEffect`, `TriggeredEffect`, `ContinuousEffect`, `DelayedEffect`, `TargetedEffect`, `DrawCardEffect`, `DamageEffect`.

## Utilities

```tsx
import { createStandardDeck, createPairedDeck, generateCardId } from 'ink-playing-cards'

const deck = createStandardDeck()       // 52 cards with unique IDs
const pairs = createPairedDeck()        // paired deck for Memory-style games
const id = generateCardId('hearts', 'A') // "hearts-A-abc123"
```

## Type Guards

```tsx
import { isStandardCard, isCustomCard } from 'ink-playing-cards'

if (isStandardCard(card)) {
  // card.suit, card.value available
}
if (isCustomCard(card)) {
  // card.title, card.description, etc. available
}
```

## Development

```bash
yarn install     # Install dependencies
yarn build       # Compile TypeScript to dist/
yarn test        # Build + run tests
yarn lint        # Check formatting + lint
yarn lint:fix    # Auto-fix formatting + lint
yarn dev         # Run interactive component showcase
```

### Interactive Showcase

The library includes a storybook-style CLI showcase for exploring components interactively:

```bash
yarn dev
```

Navigate through components, configure props, and see live previews in the terminal.

## Examples

The `examples/` directory contains markdown guides for building various card games:

- [Blackjack](examples/blackjack.md) — classic 21 with hit/stand mechanics
- [Go Fish](examples/go-fish.md) — set collection with AI opponents
- [War](examples/war.md) — simple two-player comparison game
- [Memory](examples/memory.md) — card matching with grid layout
- [Poker (Five Card Draw)](examples/poker-five-card-draw.md) — hand evaluation and betting
- [Klondike Solitaire](examples/klondike-solitaire.md) — classic solitaire with tableau
- [Custom Cards](examples/custom-cards.md) — building non-standard card games
- [Zone System](examples/zone-system.md) — managing game areas
- [Event System](examples/event-system.md) — responding to game actions
- [Effect System](examples/effect-system.md) — card abilities and mechanics

See the full list in [`examples/`](examples/).

## License

MIT — see [LICENSE](LICENSE) for details.
