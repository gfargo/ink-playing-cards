# Implementing Pyramid Solitaire with ink-playing-cards

This guide demonstrates how to create a Pyramid Solitaire game using the `ink-playing-cards` library and the `ink` library for terminal-based rendering.

## Game Overview

Pyramid Solitaire is a single-player card game where the objective is to remove all the cards from a pyramid by pairing them to 13. Kings (value 13) are removed singularly.

## Key Concepts

1. **DeckProvider**: Manages the deck state.
2. **useDeck Hook**: Provides deck operations like `shuffle` and `draw`.
3. **Card Component**: Renders individual cards.
4. **Pyramid Structure**: Manages the pyramid of cards.
5. **Waste Pile**: Manages the waste pile for drawn cards.
6. **Pairing Logic**: Handles the pairing of cards that sum to 13.

## Implementation

### 1. Setup and Imports

```typescript
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { DeckProvider, useDeck, Card } from 'ink-playing-cards'

const PyramidSolitaire: React.FC = () => {
  // Component logic will go here
}

const App: React.FC = () => (
  <DeckProvider>
    <PyramidSolitaire />
  </DeckProvider>
)

export default App
```

### 2. Game State

```typescript
const PyramidSolitaire: React.FC = () => {
  const { deck, shuffle, draw } = useDeck()
  const [pyramid, setPyramid] = useState<(Card | null)[][]>([])
  const [wastePile, setWastePile] = useState<Card[]>([])
  const [stockPile, setStockPile] = useState<Card[]>([])
  const [score, setScore] = useState(0)
  const [selectedCard, setSelectedCard] = useState<{
    row: number
    col: number
  } | null>(null)
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
  const newPyramid: (Card | null)[][] = []
  for (let i = 0; i < 7; i++) {
    newPyramid.push(draw(i + 1))
  }
  setPyramid(newPyramid)
  setStockPile(draw(24))
  setWastePile([])
  setScore(0)
  setSelectedCard(null)
  setMessage('New game started. Select cards that sum to 13.')
}
```

### 4. Game Logic

```typescript
const selectCard = (row: number, col: number) => {
  const card = pyramid[row][col]
  if (!card || !isCardSelectable(row, col)) return

  if (selectedCard) {
    if (selectedCard.row === row && selectedCard.col === col) {
      setSelectedCard(null)
    } else {
      const selectedPyramidCard = pyramid[selectedCard.row][selectedCard.col]
      if (
        selectedPyramidCard &&
        cardValue(card) + cardValue(selectedPyramidCard) === 13
      ) {
        removeCards(selectedCard.row, selectedCard.col, row, col)
      } else {
        setSelectedCard({ row, col })
      }
    }
  } else {
    if (cardValue(card) === 13) {
      removeCards(row, col)
    } else {
      setSelectedCard({ row, col })
    }
  }
}

const isCardSelectable = (row: number, col: number): boolean => {
  if (row === pyramid.length - 1) return true
  return !pyramid[row + 1][col] && !pyramid[row + 1][col + 1]
}

const cardValue = (card: Card): number => {
  if (['J', 'Q', 'K'].includes(card.rank))
    return 10 + ['J', 'Q', 'K'].indexOf(card.rank) + 1
  if (card.rank === 'A') return 1
  return parseInt(card.rank)
}

const removeCards = (
  row1: number,
  col1: number,
  row2?: number,
  col2?: number
) => {
  const newPyramid = [...pyramid]
  newPyramid[row1][col1] = null
  if (row2 !== undefined && col2 !== undefined) {
    newPyramid[row2][col2] = null
  }
  setPyramid(newPyramid)
  setScore(score + 1)
  setSelectedCard(null)
  checkForWin()
}

const drawFromStock = () => {
  if (stockPile.length > 0) {
    const [drawnCard, ...remainingStock] = stockPile
    setWastePile([drawnCard, ...wastePile])
    setStockPile(remainingStock)
  } else {
    setStockPile(wastePile.reverse())
    setWastePile([])
  }
}

const checkForWin = () => {
  if (pyramid.every((row) => row.every((card) => card === null))) {
    setMessage(`Congratulations! You've won with a score of ${score}!`)
  }
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
    if (selectedCard) {
      selectCard(selectedCard.row, selectedCard.col)
    }
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
    <Text>Pyramid Solitaire</Text>
    <Text>Score: {score}</Text>
    <Text>{message}</Text>
    {pyramid.map((row, rowIndex) => (
      <Box key={rowIndex}>
        {row.map((card, colIndex) => (
          <Box key={colIndex} marginRight={1}>
            {card ? (
              <Card
                {...card}
                faceUp
                selected={
                  selectedCard?.row === rowIndex &&
                  selectedCard?.col === colIndex
                }
              />
            ) : (
              <Box width={6} height={4} />
            )}
          </Box>
        ))}
      </Box>
    ))}
    <Box marginY={1}>
      <Text>Stock: </Text>
      {stockPile.length > 0 && <Card {...stockPile[0]} faceUp={false} />}
      <Text marginLeft={2}>Waste: </Text>
      {wastePile.length > 0 && <Card {...wastePile[0]} faceUp />}
    </Box>
    <Text>Press space to select/deselect, 'd' to draw from stock</Text>
  </Box>
)
```

## Key Concepts

1. **Pyramid Structure**: The game uses a pyramid of cards, with each row having one more card than the row above it.
2. **Card Pairing**: Players need to pair cards that sum to 13, with face cards having values of 11-13.
3. **Stock and Waste Piles**: Players can draw from a stock pile when they run out of moves in the pyramid.
4. **Scoring**: The game keeps track of the number of pairs removed.

## Error Handling and Edge Cases

1. **Empty Stock Pile**: Handle the case when the stock pile is empty by reshuffling the waste pile.
2. **No More Moves**: Detect when there are no more possible moves and end the game.
3. **Invalid Selections**: Prevent selection of cards that are not at the bottom of the pyramid or covered by other cards.

## Performance Considerations

1. **Pyramid Updates**: Optimize the way the pyramid is updated to minimize re-renders.
2. **Move Validation**: Implement efficient move validation to quickly determine if a move is legal.

## Potential Enhancements

1. Implement an undo feature.
2. Add a hint system to suggest possible moves.
3. Implement different scoring systems (e.g., based on time or number of moves).
4. Add animations for card removal and movement.
5. Implement different difficulty levels by changing the size of the pyramid.

This implementation provides a foundation for a Pyramid Solitaire game using the `ink-playing-cards` library. It demonstrates how to manage a complex card layout, implement game-specific logic, and create an interactive single-player experience in a terminal-based environment.
