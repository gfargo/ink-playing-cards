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

```jsx
import React from 'react'
import { Box, Text } from 'ink'
import { DeckProvider, useDeck, CardStack } from 'ink-playing-cards'

const Game = () => {
  const { deck, hand, draw, shuffle } = useDeck()

  React.useEffect(() => {
    shuffle()
    draw(5, 'player1')
  }, [])

  return (
    <Box flexDirection="column">
      <CardStack cards={deck.cards} name="Deck" />
      <Text>Your hand:</Text>
      <CardStack cards={hand.cards} name="Hand" faceUp maxDisplay={5} />
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <Game />
  </DeckProvider>
)
```

## Features

- Standard and custom card components with multiple display variants
- Zone system (Deck, Hand, Discard Pile, Play Area) for managing game areas
- Event system for responding to draws, plays, discards, and other game actions
- Effect system supporting conditional, triggered, continuous, delayed, and targeted effects
- Hooks (`useDeck`, `useHand`) for accessing game state and dispatching actions
- Theming support for ASCII card art (original, geometric, animal, robot, pixel, medieval)

## Components

### Card

Standard playing card with multiple display variants:

```jsx
<Card
  suit="hearts"
  value="A"
  variant="simple" // 'simple' | 'ascii' | 'minimal'
  faceUp={true}
  selected={false}
  rounded={true}
/>
```

### MiniCard

Compact card for space-efficient layouts:

```jsx
<MiniCard
  suit="spades"
  value="K"
  variant="mini" // 'mini' | 'micro'
  faceUp={true}
/>
```

### UnicodeCard

Single-character Unicode card using standard playing card symbols (U+1F0A0–1F0FF):

```jsx
<UnicodeCard
  suit="hearts"
  value="A"
  faceUp={true}
  bordered={false}
  rounded={true}
/>
```

Includes all 52 standard cards, jokers, and card back symbol with automatic suit-based coloring.

### CustomCard

Freeform card for special game mechanics:

```jsx
<CustomCard
  size="medium" // 'small' | 'medium' | 'large'
  title="Special Card"
  description="Custom effect description"
  asciiArt={customArt}
  symbols={[{ char: '★', position: 'top-left', color: 'yellow' }]}
  borderColor="blue"
  faceUp={true}
/>
```

### CardStack

Displays cards in a horizontal or vertical stack:

```jsx
<CardStack
  cards={handCards}
  name="Player Hand"
  variant="simple"
  stackDirection="horizontal" // 'horizontal' | 'vertical'
  spacing={{ overlap: -2, margin: 1 }}
  maxDisplay={5}
  isFaceUp={true}
/>
```

### CardGrid

Arranges cards in a grid layout:

```jsx
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

Manages and displays a complete deck:

```jsx
<Deck
  variant="simple"
  showTopCard={true}
  placeholderCard={{ suit: 'hearts', value: 'A' }}
/>
```

## Core Concepts

### Zones

The zone system manages different areas of the game — Deck, Hand, Discard Pile, and Play Area. Each zone supports adding, removing, shuffling, and querying cards.

### Events

The event system dispatches game events (`CARDS_DRAWN`, `CARD_PLAYED`, `CARD_DISCARDED`, etc.) that you can listen to and respond to with custom logic.

### Effects

The effect system supports complex card abilities:

- **Conditional** — apply when a condition is met
- **Triggered** — fire in response to specific events
- **Continuous** — persist while active
- **Delayed** — execute after a set number of turns or events
- **Targeted** — apply to specific cards or zones

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

Navigate through components, configure props, and see live previews in the terminal. Showcase views live in `src/storybook/views/`.

## Examples

The `examples/` directory contains markdown guides for building various card games:

- [Blackjack](examples/blackjack.md)
- [Go Fish](examples/go-fish.md)
- [Klondike Solitaire](examples/klondike-solitaire.md)
- [Poker (Five Card Draw)](examples/poker-five-card-draw.md)
- [War](examples/war.md)
- [Memory](examples/memory.md)
- [Uno](examples/uno.md)

See the full list in [`examples/`](examples/).

## License

MIT — see [LICENSE](LICENSE) for details.
