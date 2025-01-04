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

- `Card`: Represents a single card
- `CardStack`: Displays a stack of cards (e.g., deck, hand, discard pile)

These components can be easily customized and styled to fit your game's needs.

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
