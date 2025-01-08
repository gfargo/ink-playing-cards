# Ink Playing Cards

This library provides a flexible and extensible framework for building card games using [React](https://react.dev/) and [Ink](https://github.com/vadimdemedes/ink). It offers a set of components, hooks, and utilities that make it easy to create various types of card games, from simple to complex.

## Features

- Flexible card and deck management
- Support for standard playing cards and custom cards
- Zone system for managing different areas of the game (deck, hand, discard pile, play area)
- Event system for handling game events
- Advanced effect system for implementing complex card effects
- Easy-to-use hooks for accessing game state and actions
- Pre-built UI components for common card game elements
- Customizable styling

## Installation

```bash
npm install ink-playing-cards
```

## Basic Usage

Here's a simple example of how to use the library to create a basic card game:

```jsx
import React from 'react'
import { Box, Text } from 'ink'
import { DeckProvider, useDeck, Card, CardStack } from 'ink-playing-cards'

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

export default App
```

## Core Concepts

### Zones

The library uses a zone system to manage different areas of the game:

- Deck
- Hand
- Discard Pile
- Play Area

Each zone has methods for adding, removing, and manipulating cards.

### Events

The event system allows you to respond to various game events, such as drawing cards or playing cards. You can listen for events and trigger custom logic when they occur.

### Advanced Effects

The advanced effect system enables you to define and apply complex effects to cards. It supports:

- Conditional effects
- Triggered effects
- Continuous effects
- Delayed effects
- Targeted effects

This system is useful for implementing card abilities, special rules, and complex game mechanics.

### UI Components

The library provides pre-built UI components for common card game elements:

#### Card

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

#### MiniCard

Compact card representation for space-efficient layouts:

```jsx
<MiniCard
  suit="spades"
  value="K"
  variant="mini" // 'mini' | 'micro'
  faceUp={true}
  selected={false}
  rounded={true}
/>
```

#### UnicodeCard

Single-character Unicode card representation using standard playing card symbols:

```jsx
<UnicodeCard
  suit="hearts"
  value="A"
  faceUp={true}
  selected={false}
  dimmed={false}    // Dim face-down cards instead of showing card back
  color="red"       // Custom color override
  size={1}          // Size multiplier for padding
  bordered={false}  // Add border around the card
  rounded={true}    // Use rounded borders when bordered is true
/>
```

The UnicodeCard uses the standard Unicode playing card characters (U+1F0A0–1F0FF) which include:
- All 52 standard playing cards (A, 2-10, J, Q, K for each suit)
- Red, black, and white jokers
- Card back symbol
- Automatic suit-based coloring (red for hearts/diamonds, white for spades/clubs)

#### CustomCard

Highly customizable card for special game mechanics:

```jsx
<CustomCard
  size="medium" // 'small' | 'medium' | 'large'
  title="Special Card"
  description="Custom effect description"
  asciiArt={customArt}
  symbols={[{ char: '★', position: 'top-left', color: 'yellow' }]}
  borderColor="blue"
  textColor="white"
  faceUp={true}
/>
```

#### CardStack

Displays a stack of cards with customizable spacing and alignment:

```jsx
<CardStack
  cards={handCards}
  name="Player Hand"
  variant="simple"
  stackDirection="horizontal" // 'horizontal' | 'vertical'
  spacing={{ overlap: -2, margin: 1 }}
  alignment="center" // 'start' | 'center' | 'end'
  maxDisplay={5}
  isFaceUp={true}
/>
```

#### Grid

Arranges cards in a customizable grid layout:

```jsx
<Grid
  rows={3}
  cols={3}
  cards={gameBoard}
  variant="simple"
  spacing={{ row: 1, col: 1 }}
  alignment={{
    horizontal: 'center', // 'left' | 'center' | 'right'
    vertical: 'middle', // 'top' | 'middle' | 'bottom'
  }}
  fillEmpty={true}
  isFaceUp={true}
/>
```

#### Deck

Manages and displays a complete deck of cards:

```jsx
<Deck
  variant="simple"
  showTopCard={true}
  placeholderCard={{ suit: 'hearts', value: 'A' }}
/>
```

Each component supports:

- Multiple display variants
- Customizable styling
- Flexible layout options
- Interactive states
- Type-safe props

These components can be easily customized and styled to fit your game's needs. For more advanced usage and complex configurations, refer to the examples in the `examples/` directory.

## Advanced Usage

For more advanced usage, including custom cards, multiple players, and complex game logic, please refer to the examples in the `examples/` directory.

## Interactive Component Showcase

The library includes an interactive storybook-style component showcase that helps you explore and understand all available components and their configurations.

### Running the Showcase

```bash
# Install dependencies
yarn install

# Start the showcase
yarn dev
```

### Features

The showcase provides an interactive CLI interface to explore:

- **Card Components**

  - Standard Card (simple, ASCII, and minimal variants)
  - MiniCard (compact card representations)
  - CardStack (various card arrangements)
  - Deck (full deck management)
  - CustomCard (highly customizable cards)

- **Component Configuration**
  - Interactive property controls
  - Real-time preview
  - Multiple variant support
  - Style customization

### Navigation

The showcase uses a step-by-step navigation system:

1. Select a component to view
2. Configure basic properties (variant, suit, value)
3. Adjust display options (face up/down)
4. Customize styling (borders, selection state)

Each step provides:

- Hotkey support for quick navigation
- Visual indicators for current state
- Forward/back navigation
- Live component preview

### Development

The showcase is particularly useful during development:

- Test component changes in real-time
- Verify visual appearance across variants
- Ensure proper prop handling
- Debug styling issues

To modify or extend the showcase:

1. Components are in `src/components/`
2. Showcase views are in `src/storybook/views/`
3. Each component has its own view file
4. Views follow a consistent pattern for state management and navigation

## Contributing

Contributions are welcome! Please read our contributing guidelines for details on how to submit pull requests, report issues, or request features.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
