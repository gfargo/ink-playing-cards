# Implementing Golf Solitaire with ink-playing-cards

This guide demonstrates how to create a Golf Solitaire game using the `ink-playing-cards` library and the `ink` library for terminal-based rendering.

## Game Overview

Golf Solitaire is a single-player card game where the objective is to move all cards from the tableau to the waste pile. Cards can be moved if they are one rank higher or lower than the top card of the waste pile, regardless of suit.

## Key Concepts

1. **DeckProvider**: Manages the deck state.
2. **useDeck Hook**: Provides deck operations like `shuffle` and `draw`.
3. **Card Component**: Renders individual cards.
4. **Tableau**: Manages the layout of cards in play.
5. **Waste Pile**: Manages the waste pile where cards are moved.
6. **Stock Pile**: Manages the stock pile for drawing new cards.

## Implementation

### 1. Setup and Imports

```typescript
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { DeckProvider, useDeck, Card } from 'ink-playing-cards'

const GolfSolitaire: React.FC = () => {
  // Component logic will go here
}

const App: React.FC = () => (
  <DeckProvider>
    <GolfSolitaire />
  </DeckProvider>
)

export default App
```

### 2. Game State

```typescript
const GolfSolitaire: React.FC = () => {
  const { deck, shuffle, draw } = useDeck()
  const [tableau, setTableau] = useState<Card[][]>([])
  const [wastePile, setWastePile] = useState<Card[]>([])
  const [stockPile, setStockPile] = useState<Card[]>([])
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')

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
  const newTableau: Card[][] = []
  for (let i = 0; i < 7; i++) {
    newTableau.push(draw(5))
  }
  setTableau(newTableau)
  setWastePile([draw(1)[0]])
  setStockPile(draw(17))
  setScore(0)
  setMessage('New game started. Remove cards one rank up or down.')
}
```

### 4. Game Logic

```typescript
const moveCard = (row: number, col: number) => {
  const card = tableau[row][col]
  const topWasteCard = wastePile[wastePile.length - 1]

  if (isValidMove(card, topWasteCard)) {
    const newTableau = [...tableau]
    newTableau[row].splice(col, 1)
    setTableau(newTableau)
    setWastePile([...wastePile, card])
    setScore(score + 1)
    checkForWin()
  } else {
    setMessage('Invalid move. Cards must be one rank up or down.')
  }
}

const isValidMove = (card: Card, topWasteCard: Card): boolean => {
  const cardValue = getCardValue(card)
  const topWasteValue = getCardValue(topWasteCard)
  return (
    Math.abs(cardValue - topWasteValue) === 1 ||
    Math.abs(cardValue - topWasteValue) === 12
  )
}

const getCardValue = (card: Card): number => {
  if (card.rank === 'A') return 1
  if (card.rank === 'J') return 11
  if (card.rank === 'Q') return 12
  if (card.rank === 'K') return 13
  return parseInt(card.rank)
}

const drawFromStock = () => {
  if (stockPile.length > 0) {
    const [drawnCard, ...remainingStock] = stockPile
    setWastePile([...wastePile, drawnCard])
    setStockPile(remainingStock)
    checkForGameOver()
  } else {
    setMessage('No more cards in the stock pile.')
  }
}

const checkForWin = () => {
  if (tableau.every((column) => column.length === 0)) {
    setMessage(`Congratulations! You've won with a score of ${score}!`)
  }
}

const checkForGameOver = () => {
  if (stockPile.length === 0 && !hasValidMoves()) {
    setMessage(`Game over. Your final score is ${score}.`)
  }
}

const hasValidMoves = (): boolean => {
  const topWasteCard = wastePile[wastePile.length - 1]
  return tableau.some(
    (column) =>
      column.length > 0 && isValidMove(column[column.length - 1], topWasteCard)
  )
}
```

### 5. User Input Handling

```typescript
useInput((input, key) => {
  if (key.leftArrow || key.rightArrow || key.upArrow || key.downArrow) {
    // Move selection
    // Implement logic to move selection based on arrow keys
  } else if (input === ' ') {
    // Select card
    // Implement logic to select a card based on current selection
  } else if (input === 'd') {
    // Draw from stock
    drawFromStock()
  }
})
```

### 6. Rendering

```typescript
return (
  <Box flexDirection="column">
    <Text>Golf Solitaire</Text>
    <Text>Score: {score}</Text>
    <Text>{message}</Text>
    {tableau.map((column, rowIndex) => (
      <Box key={rowIndex}>
        {column.map((card, colIndex) => (
          <Box key={colIndex} marginRight={1}>
            <Card {...card} faceUp />
          </Box>
        ))}
      </Box>
    ))}
    <Box marginY={1}>
      <Text>Waste Pile: </Text>
      {wastePile.length > 0 && (
        <Card {...wastePile[wastePile.length - 1]} faceUp />
      )}
      <Text marginLeft={2}>Stock Pile: </Text>
      {stockPile.length > 0 && <Card {...stockPile[0]} faceUp={false} />}
    </Box>
    <Text>Press space to select a card, 'd' to draw from stock</Text>
  </Box>
)
```

## Key Concepts

1. **Tableau Layout**: The game uses a tableau of 7 columns with 5 cards each.
2. **Card Sequencing**: Players can move cards that are one rank higher or lower than the top waste card.
3. **Stock Pile**: Players can draw from the stock pile when they run out of moves in the tableau.
4. **Scoring**: The game keeps track of the number of cards moved to the waste pile.

## Error Handling and Edge Cases

1. **Empty Stock Pile**: Handle the case when the stock pile is empty and there are no more valid moves.
2. **No Valid Moves**: Detect when there are no more possible moves and end the game.
3. **Wrapping Around**: Handle the case where an Ace can be played on a King and vice versa.

## Performance Considerations

1. **Tableau Updates**: Optimize the way the tableau is updated to minimize re-renders.
2. **Move Validation**: Implement efficient move validation to quickly determine if a move is legal.

## Potential Enhancements

1. Implement an undo feature.
2. Add a hint system to suggest possible moves.
3. Implement different scoring systems (e.g., based on time or number of moves).
4. Add animations for card movement.
5. Implement different difficulty levels by changing the number of columns or cards per column.

This implementation provides a foundation for a Golf Solitaire game using the `ink-playing-cards` library. It demonstrates how to manage a tableau of cards, implement game-specific logic, and create an interactive single-player experience in a terminal-based environment.
