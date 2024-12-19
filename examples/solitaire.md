# Solitaire Implementation Guide

This guide demonstrates how to implement the classic Solitaire (Klondike) card game using the `ink-playing-cards` library and Ink for terminal-based rendering.

## Game Overview

Solitaire is a single-player card game where the objective is to move all cards to the foundation piles, building up each suit from Ace to King.

## Game Rules

1. The game uses a standard 52-card deck.
2. Cards are dealt into seven tableau piles, with the first pile having one card, the second two cards, and so on.
3. The top card of each tableau pile is face up, the others are face down.
4. The remaining cards form the stock pile.
5. Cards can be moved between tableau piles, building down in alternating colors.
6. Sequences of cards can be moved together.
7. Empty tableau spots can be filled with a King or a sequence starting with a King.
8. Cards can be drawn from the stock to the waste pile, usually three at a time.
9. Cards in the waste pile can be played to the tableau or foundation.
10. Foundation piles are built up by suit from Ace to King.

## Implementation Steps

### 1. Setup and Imports

First, let's set up our project and import the necessary dependencies:

```jsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { DeckProvider, useDeck, MiniCard } from 'ink-playing-cards'
```

### 2. Game State

We'll need to manage several pieces of state:

```jsx
const SolitaireGame = () => {
  const { deck, shuffle } = useDeck()
  const [tableau, setTableau] = useState([])
  const [foundation, setFoundation] = useState([[], [], [], []])
  const [stock, setStock] = useState([])
  const [waste, setWaste] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedPile, setSelectedPile] = useState(null)
  const [message, setMessage] = useState('')

  // ... (rest of the component)
}
```

### 3. Game Initialization

We'll use `useEffect` to initialize the game:

```jsx
useEffect(() => {
  initializeGame()
}, [])

const initializeGame = () => {
  shuffle()
  const newTableau = []
  for (let i = 0; i < 7; i++) {
    newTableau.push(
      deck.cards.slice((i * (i + 1)) / 2, ((i + 1) * (i + 2)) / 2)
    )
    newTableau[i][newTableau[i].length - 1].faceUp = true
  }
  setTableau(newTableau)
  setStock(deck.cards.slice(28))
  setMessage(
    'Use arrow keys to navigate, space to select/deselect, Enter to move'
  )
}
```

### 4. Game Logic

We'll need to implement several functions to handle game logic. Let's break down some of the more complex functions:

```jsx
const moveCard = (from, to) => {
  const [fromPile, fromIndex] = from
  const [toPile, toIndex] = to

  let sourceCards, newSourcePile, newDestPile

  // Handle moving from tableau
  if (fromPile === 'tableau') {
    sourceCards = tableau[fromIndex].slice(toIndex)
    newSourcePile = tableau[fromIndex].slice(0, toIndex)
    if (newSourcePile.length > 0) {
      newSourcePile[newSourcePile.length - 1].faceUp = true
    }
    setTableau(
      tableau.map((pile, i) => (i === fromIndex ? newSourcePile : pile))
    )
  }
  // Handle moving from waste
  else if (fromPile === 'waste') {
    sourceCards = [waste[waste.length - 1]]
    newSourcePile = waste.slice(0, -1)
    setWaste(newSourcePile)
  }

  // Handle moving to tableau
  if (toPile === 'tableau') {
    newDestPile = [...tableau[toIndex], ...sourceCards]
    setTableau(tableau.map((pile, i) => (i === toIndex ? newDestPile : pile)))
  }
  // Handle moving to foundation
  else if (toPile === 'foundation') {
    newDestPile = [...foundation[toIndex], ...sourceCards]
    setFoundation(
      foundation.map((pile, i) => (i === toIndex ? newDestPile : pile))
    )
  }

  // Add move to history for undo functionality
  setMoveHistory([...moveHistory, { from, to, cards: sourceCards }])
}

const drawCards = () => {
  if (stock.length === 0) {
    // If stock is empty, flip waste to become new stock
    setStock(waste.reverse())
    setWaste([])
  } else {
    // Draw three cards (or less if fewer than three remain)
    const drawnCards = stock.slice(-3).reverse()
    setStock(stock.slice(0, -3))
    setWaste([...waste, ...drawnCards])
  }
}

const isValidMove = (card, destination) => {
  const [destPile, destIndex] = destination

  if (destPile === 'tableau') {
    const targetPile = tableau[destIndex]
    if (targetPile.length === 0) {
      // Only Kings can be placed on empty tableau piles
      return card.rank === 'K'
    }
    const targetCard = targetPile[targetPile.length - 1]
    // Check for alternating colors and descending rank
    return (
      isRed(card) !== isRed(targetCard) &&
      rankValue(card) === rankValue(targetCard) - 1
    )
  }

  if (destPile === 'foundation') {
    const targetPile = foundation[destIndex]
    if (targetPile.length === 0) {
      // Only Aces can be placed on empty foundation piles
      return card.rank === 'A'
    }
    const targetCard = targetPile[targetPile.length - 1]
    // Check for same suit and ascending rank
    return (
      card.suit === targetCard.suit &&
      rankValue(card) === rankValue(targetCard) + 1
    )
  }

  return false
}

const checkForWin = () => {
  // The game is won when all foundation piles have 13 cards (Ace to King)
  return foundation.every((pile) => pile.length === 13)
}

// Utility functions

const isRed = (card) => ['hearts', 'diamonds'].includes(card.suit)

const rankValue = (card) => {
  const rankOrder = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
  ]
  return rankOrder.indexOf(card.rank)
}

const getAvailableMoves = () => {
  const moves = []

  // Check moves from tableau
  tableau.forEach((pile, fromIndex) => {
    if (pile.length === 0) return

    const card = pile[pile.length - 1]

    // Check moves to other tableau piles
    tableau.forEach((destPile, toIndex) => {
      if (fromIndex !== toIndex && isValidMove(card, ['tableau', toIndex])) {
        moves.push({ from: ['tableau', fromIndex], to: ['tableau', toIndex] })
      }
    })

    // Check moves to foundation
    foundation.forEach((destPile, toIndex) => {
      if (isValidMove(card, ['foundation', toIndex])) {
        moves.push({
          from: ['tableau', fromIndex],
          to: ['foundation', toIndex],
        })
      }
    })
  })

  // Check moves from waste
  if (waste.length > 0) {
    const card = waste[waste.length - 1]

    // Check moves to tableau
    tableau.forEach((destPile, toIndex) => {
      if (isValidMove(card, ['tableau', toIndex])) {
        moves.push({ from: ['waste', 0], to: ['tableau', toIndex] })
      }
    })

    // Check moves to foundation
    foundation.forEach((destPile, toIndex) => {
      if (isValidMove(card, ['foundation', toIndex])) {
        moves.push({ from: ['waste', 0], to: ['foundation', toIndex] })
      }
    })
  }

  return moves
}
```

These functions handle the core game logic for Solitaire:

- `moveCard`: Handles moving cards between different piles, updating the game state accordingly.
- `drawCards`: Manages drawing cards from the stock to the waste pile.
- `isValidMove`: Checks if a move is valid based on Solitaire rules.
- `checkForWin`: Verifies if the game has been won.
- `isRed` and `rankValue`: Utility functions to help with move validation.
- `getAvailableMoves`: Calculates all possible moves in the current game state.

### 5. User Input Handling

We'll use Ink's `useInput` hook to handle user input:

```jsx
useInput((input, key) => {
  if (key.leftArrow) {
    // Move selection left
  } else if (key.rightArrow) {
    // Move selection right
  } else if (key.upArrow) {
    // Move selection up
  } else if (key.downArrow) {
    // Move selection down
  } else if (input === ' ') {
    // Select/deselect card
  } else if (key.return) {
    // Attempt to move selected card
  }
})
```

### 6. Rendering the Game State

We'll render the game state using our `MiniCard` component:

```jsx
return (
  <Box flexDirection="column">
    <Text>Solitaire</Text>
    <Box>
      <Text>Stock: </Text>
      {stock.length > 0 && (
        <MiniCard {...stock[stock.length - 1]} faceUp={false} />
      )}
      <Text>Waste: </Text>
      {waste.length > 0 && <MiniCard {...waste[waste.length - 1]} />}
    </Box>
    <Box>
      <Text>Foundation: </Text>
      {foundation.map((pile, index) => (
        <Box key={index} marginRight={1}>
          {pile.length > 0 ? (
            <MiniCard {...pile[pile.length - 1]} />
          ) : (
            <Box width={3} height={2} borderStyle="single" />
          )}
        </Box>
      ))}
    </Box>
    <Text>Tableau:</Text>
    {tableau.map((pile, pileIndex) => (
      <Box key={pileIndex}>
        {pile.map((card, cardIndex) => (
          <MiniCard
            key={cardIndex}
            {...card}
            selected={selectedPile === pileIndex && selectedCard === cardIndex}
          />
        ))}
      </Box>
    ))}
    <Text>{message}</Text>
  </Box>
)
```

## Additional Features

### Undo Functionality

To implement undo functionality, we can keep a history of moves:

```jsx
const [moveHistory, setMoveHistory] = useState([])

const undoMove = () => {
  if (moveHistory.length === 0) return
  const lastMove = moveHistory.pop()
  // Reverse the last move
  setMoveHistory([...moveHistory])
}
```

### Auto-complete

For auto-complete, we can check if all cards are face up and implement a function to automatically move cards to the foundation:

```jsx
const canAutoComplete = () => {
  // Check if all cards are face up and auto-complete is possible
}

const autoComplete = () => {
  // Automatically move cards to foundation
}
```

## Performance Considerations

To ensure smooth performance in the terminal:

1. Use `MiniCard` components to reduce the amount of space each card takes.
2. Implement efficient update mechanisms to minimize re-renders.
3. Consider implementing virtualization for very large tableaus.

## Potential Enhancements

1. Implement a scoring system.
2. Add difficulty levels (e.g., draw one card instead of three).
3. Create a hint system to suggest possible moves.
4. Implement a save/load feature for game state persistence.
5. Add animations for card movements.
6. Implement a timer and move counter.

This implementation provides a solid foundation for a Solitaire game using the `ink-playing-cards` library. It demonstrates the use of the new `MiniCard` component and showcases how to handle complex game logic and state management in a terminal-based card game.
