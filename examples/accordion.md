# Implementing Accordion with ink-playing-cards

This guide demonstrates how to create the Accordion card game using the `ink-playing-cards` library and the `ink` library for terminal-based rendering. We'll also implement a scrollable container for cards to handle the potentially long row of card piles.

## Game Overview

Accordion is a single-player card game where the goal is to consolidate all cards into a single pile by matching cards by suit or rank.

## Game Rules

1. Shuffle a standard 52-card deck.
2. Deal cards one at a time into a row, face-up.
3. A card can be moved onto another card if:
   - It matches the suit or rank of the card immediately to its left.
   - It matches the suit or rank of the third card to its left.
4. When moving a card, the entire pile on top of it moves as well.
5. The game ends when no more moves are possible or all cards are in one pile.
6. The player wins if all cards end up in a single pile.

## Key Concepts

1. **DeckProvider**: Manages the deck state.
2. **useDeck Hook**: Provides deck operations like `shuffle` and `draw`.
3. **Card Component**: Renders individual cards.
4. **Pile Management**: Manages the row of card piles.
5. **Move Validation**: Checks if a move is legal according to the game rules.
6. **Scrollable Container**: Allows navigation through the row of cards when it exceeds the screen width.

## Implementation

### 1. Setup and Imports

```typescript
import React, { useState, useEffect, useMemo } from 'react'
import { Box, Text, useInput } from 'ink'
import { DeckProvider, useDeck, Card } from 'ink-playing-cards'

const AccordionGame: React.FC = () => {
  // Component logic will go here
}

const App: React.FC = () => (
  <DeckProvider>
    <AccordionGame />
  </DeckProvider>
)

export default App
```

### 2. Game State

```typescript
const AccordionGame: React.FC = () => {
  const { deck, shuffle, draw } = useDeck()
  const [piles, setPiles] = useState<Card[][]>([])
  const [selectedPile, setSelectedPile] = useState<number | null>(null)
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>(
    'playing'
  )
  const [message, setMessage] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  // Rest of the component logic
}
```

### 3. Game Initialization

```typescript
useEffect(() => {
  startNewGame()
}, [])

const startNewGame = () => {
  shuffle()
  const newPiles = deck.map((card) => [{ ...card, faceUp: true }])
  setPiles(newPiles)
  setSelectedPile(null)
  setGameState('playing')
  setMessage('New game started. Select piles to move cards.')
  setCurrentIndex(0)
}
```

### 4. Game Logic

```typescript
const selectPile = (pileIndex: number) => {
  if (gameState !== 'playing') return

  if (selectedPile === null) {
    setSelectedPile(pileIndex)
  } else {
    if (isValidMove(selectedPile, pileIndex)) {
      movePile(selectedPile, pileIndex)
    } else {
      setMessage('Invalid move. Try again.')
    }
    setSelectedPile(null)
  }
}

const isValidMove = (fromIndex: number, toIndex: number): boolean => {
  if (fromIndex === toIndex) return false
  if (toIndex !== fromIndex - 1 && toIndex !== fromIndex - 3) return false

  const fromCard = piles[fromIndex][0]
  const toCard = piles[toIndex][0]

  return fromCard.rank === toCard.rank || fromCard.suit === toCard.suit
}

const movePile = (fromIndex: number, toIndex: number) => {
  const newPiles = [...piles]
  newPiles[toIndex] = [...piles[fromIndex], ...piles[toIndex]]
  newPiles.splice(fromIndex, 1)
  setPiles(newPiles)
  setMessage('Pile moved successfully.')
  checkGameState()
}

const checkGameState = () => {
  if (piles.length === 1) {
    setGameState('won')
    setMessage('Congratulations! You won!')
  } else if (!hasValidMoves()) {
    setGameState('lost')
    setMessage('Game over. No more valid moves.')
  }
}

const hasValidMoves = (): boolean => {
  for (let i = 1; i < piles.length; i++) {
    if (isValidMove(i, i - 1) || (i >= 3 && isValidMove(i, i - 3))) {
      return true
    }
  }
  return false
}
```

### 5. Scrollable Container for Cards

```typescript
const MAX_VISIBLE_PILES = 10

const visiblePiles = useMemo(() => {
  return piles.slice(currentIndex, currentIndex + MAX_VISIBLE_PILES)
}, [piles, currentIndex])

const canScrollLeft = currentIndex > 0
const canScrollRight = currentIndex + MAX_VISIBLE_PILES < piles.length

useInput((input, key) => {
  if (gameState !== 'playing') {
    if (input === 'r') startNewGame()
    return
  }

  if (key.leftArrow && canScrollLeft) {
    setCurrentIndex(currentIndex - 1)
  } else if (key.rightArrow && canScrollRight) {
    setCurrentIndex(currentIndex + 1)
  } else {
    const pileIndex = parseInt(input)
    if (!isNaN(pileIndex) && pileIndex >= 1 && pileIndex <= MAX_VISIBLE_PILES) {
      selectPile(currentIndex + pileIndex - 1)
    }
  }
})
```

### 6. Rendering

```typescript
return (
  <Box flexDirection="column">
    <Text>Accordion Card Game</Text>
    <Text>{message}</Text>
    <Box flexDirection="row" marginY={1}>
      {visiblePiles.map((pile, index) => (
        <Box key={index} marginRight={1} flexDirection="column">
          <Text>{currentIndex + index + 1}</Text>
          <Card
            {...pile[0]}
            faceUp={true}
            selected={selectedPile === currentIndex + index}
          />
          {pile.length > 1 && <Text>+{pile.length - 1}</Text>}
        </Box>
      ))}
    </Box>
    {gameState === 'playing' && (
      <Text>
        Enter a number (1-{MAX_VISIBLE_PILES}) to select a pile, use arrow keys
        to scroll
      </Text>
    )}
    {gameState !== 'playing' && <Text>Press 'r' to start a new game</Text>}
    {(canScrollLeft || canScrollRight) && (
      <Text dimColor italic>
        Use left/right arrows to scroll ({currentIndex + 1}-
        {Math.min(currentIndex + MAX_VISIBLE_PILES, piles.length)} of{' '}
        {piles.length})
      </Text>
    )}
  </Box>
)
```

## Key Concepts Explained

1. **Pile Management**: The game maintains an array of piles, each represented as an array of cards.
2. **Move Validation**: The `isValidMove` function checks if a move is legal according to the game rules.
3. **Scrollable Container**: We implement a scrollable view of the piles, showing only a subset at a time and allowing navigation.
4. **Game State Tracking**: The game tracks whether it's in progress, won, or lost.

## Scrollable Container Adaptation

The scrollable container for cards is adapted from the GameLog component you provided. Key differences and adaptations include:

1. Instead of messages, we're managing an array of card piles.
2. We use `MAX_VISIBLE_PILES` to determine how many piles to show at once.
3. The scrolling is horizontal (left/right) instead of vertical.
4. We use the arrow keys for scrolling, leaving number keys for pile selection.
5. The visible piles are calculated using `useMemo` for performance.

## Error Handling and Edge Cases

1. **Invalid Moves**: The game prevents illegal moves and provides feedback.
2. **Scrolling Limits**: The scrolling is limited to the available piles.
3. **Game End**: The game properly handles both win and lose conditions.

## Performance Considerations

1. **useMemo for Visible Piles**: We use `useMemo` to efficiently calculate the visible piles.
2. **Efficient State Updates**: The game uses immutable state updates to trigger re-renders only when necessary.

## Potential Enhancements

1. Implement an undo feature.
2. Add animations for card movements.
3. Implement a scoring system based on the number of moves or remaining piles.
4. Add sound effects for card movements and game completion.
5. Create a tutorial mode that highlights valid moves.

This implementation provides a foundation for the Accordion card game using the `ink-playing-cards` library. It demonstrates how to manage a potentially large number of card piles, implement game-specific move logic, and create a scrollable interface for a terminal-based card game.

## Educational Value

Accordion is an excellent game for developing:

1. **Pattern Recognition**: Players need to quickly identify matching suits or ranks.
2. **Strategic Thinking**: Deciding which moves to make to consolidate piles efficiently.
3. **Patience and Persistence**: The game can be challenging, encouraging players to keep trying.
4. **Visual-Spatial Skills**: Managing the layout of piles and planning moves.

By implementing this game with a scrollable interface, developers can learn about managing large datasets in constrained display environments, a valuable skill for various applications beyond card games.
