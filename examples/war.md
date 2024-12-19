# War Card Game Implementation Guide

This guide demonstrates how to implement the card game "War" using the `ink-playing-cards` library and Ink for terminal-based rendering.

## Game Overview

War is a simple card game typically played by two players. The objective is to win all the cards.

## Game Rules

1. The deck is divided evenly between two players.
2. Each player reveals the top card of their deck simultaneously.
3. The player with the higher card wins both cards and adds them to the bottom of their deck.
4. If there's a tie, each player places three cards face down and then one card face up. The player with the higher face-up card wins all the cards. If there's another tie, repeat this process.
5. The game ends when one player has all the cards.

## Implementation

Let's break down the implementation into several steps:

### 1. Setup and Imports

First, we'll set up our project and import the necessary dependencies:

```jsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { DeckProvider, useDeck, Card } from 'ink-playing-cards'
```

### 2. Main Game Component

Now, let's create our main game component:

```jsx
const WarGame = () => {
  const { deck, shuffle, draw } = useDeck()
  const [player1Deck, setPlayer1Deck] = useState([])
  const [player2Deck, setPlayer2Deck] = useState([])
  const [player1Card, setPlayer1Card] = useState(null)
  const [player2Card, setPlayer2Card] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [message, setMessage] = useState('')

  // Game logic will go here

  return (
    // Render UI here
  )
}
```

### 3. Game Initialization

We'll use `useEffect` to initialize the game when the component mounts:

```jsx
useEffect(() => {
  shuffle()
  const halfDeck = Math.floor(deck.cards.length / 2)
  setPlayer1Deck(deck.cards.slice(0, halfDeck))
  setPlayer2Deck(deck.cards.slice(halfDeck))
  setMessage('Press space to play a round')
}, [])
```

### 4. Game Logic

Now, let's implement the core game logic:

```jsx
const playRound = () => {
  if (player1Deck.length === 0 || player2Deck.length === 0) {
    setGameOver(true)
    setMessage(
      `Game Over! ${player1Deck.length > 0 ? 'Player 1' : 'Player 2'} wins!`
    )
    return
  }

  const card1 = player1Deck.shift()
  const card2 = player2Deck.shift()
  setPlayer1Card(card1)
  setPlayer2Card(card2)

  if (card1.value > card2.value) {
    setPlayer1Deck([...player1Deck, card1, card2])
    setMessage('Player 1 wins the round!')
  } else if (card2.value > card1.value) {
    setPlayer2Deck([...player2Deck, card1, card2])
    setMessage('Player 2 wins the round!')
  } else {
    handleWar(card1, card2)
  }
}

const handleWar = (card1, card2) => {
  setMessage('War!')
  const warCards1 = player1Deck.splice(0, 3)
  const warCards2 = player2Deck.splice(0, 3)

  if (warCards1.length < 3 || warCards2.length < 3) {
    // One player doesn't have enough cards for war
    const winner =
      warCards1.length >= warCards2.length ? 'Player 1' : 'Player 2'
    setGameOver(true)
    setMessage(`Game Over! ${winner} wins due to insufficient cards for war!`)
    return
  }

  const warCard1 = warCards1[2]
  const warCard2 = warCards2[2]

  if (warCard1.value > warCard2.value) {
    setPlayer1Deck([...player1Deck, card1, card2, ...warCards1, ...warCards2])
    setMessage('Player 1 wins the war!')
  } else if (warCard2.value > warCard1.value) {
    setPlayer2Deck([...player2Deck, card1, card2, ...warCards1, ...warCards2])
    setMessage('Player 2 wins the war!')
  } else {
    // Another tie, recursively handle another war
    handleWar(warCard1, warCard2)
  }
}
```

### 5. User Input Handling

We'll use Ink's `useInput` hook to handle user input:

```jsx
useInput((input, key) => {
  if (input === ' ' && !gameOver) {
    playRound()
  }
})
```

### 6. Rendering the Game State

Finally, let's render the game state:

```jsx
return (
  <Box flexDirection="column">
    <Text>Player 1 Cards: {player1Deck.length}</Text>
    <Text>Player 2 Cards: {player2Deck.length}</Text>
    <Box marginY={1}>
      <Box marginRight={2}>
        <Text>Player 1:</Text>
        {player1Card && <Card {...player1Card} />}
      </Box>
      <Box>
        <Text>Player 2:</Text>
        {player2Card && <Card {...player2Card} />}
      </Box>
    </Box>
    <Text>{message}</Text>
  </Box>
)
```

### 7. Wrapping it All Together

Here's the complete implementation:

```jsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { DeckProvider, useDeck, Card } from 'ink-playing-cards'

const WarGame = () => {
  const { deck, shuffle, draw } = useDeck()
  const [player1Deck, setPlayer1Deck] = useState([])
  const [player2Deck, setPlayer2Deck] = useState([])
  const [player1Card, setPlayer1Card] = useState(null)
  const [player2Card, setPlayer2Card] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    shuffle()
    const halfDeck = Math.floor(deck.cards.length / 2)
    setPlayer1Deck(deck.cards.slice(0, halfDeck))
    setPlayer2Deck(deck.cards.slice(halfDeck))
    setMessage('Press space to play a round')
  }, [])

  const playRound = () => {
    if (player1Deck.length === 0 || player2Deck.length === 0) {
      setGameOver(true)
      setMessage(
        `Game Over! ${player1Deck.length > 0 ? 'Player 1' : 'Player 2'} wins!`
      )
      return
    }

    const card1 = player1Deck.shift()
    const card2 = player2Deck.shift()
    setPlayer1Card(card1)
    setPlayer2Card(card2)

    if (card1.value > card2.value) {
      setPlayer1Deck([...player1Deck, card1, card2])
      setMessage('Player 1 wins the round!')
    } else if (card2.value > card1.value) {
      setPlayer2Deck([...player2Deck, card1, card2])
      setMessage('Player 2 wins the round!')
    } else {
      handleWar(card1, card2)
    }
  }

  const handleWar = (card1, card2) => {
    setMessage('War!')
    const warCards1 = player1Deck.splice(0, 3)
    const warCards2 = player2Deck.splice(0, 3)

    if (warCards1.length < 3 || warCards2.length < 3) {
      const winner =
        warCards1.length >= warCards2.length ? 'Player 1' : 'Player 2'
      setGameOver(true)
      setMessage(`Game Over! ${winner} wins due to insufficient cards for war!`)
      return
    }

    const warCard1 = warCards1[2]
    const warCard2 = warCards2[2]

    if (warCard1.value > warCard2.value) {
      setPlayer1Deck([...player1Deck, card1, card2, ...warCards1, ...warCards2])
      setMessage('Player 1 wins the war!')
    } else if (warCard2.value > warCard1.value) {
      setPlayer2Deck([...player2Deck, card1, card2, ...warCards1, ...warCards2])
      setMessage('Player 2 wins the war!')
    } else {
      handleWar(warCard1, warCard2)
    }
  }

  useInput((input, key) => {
    if (input === ' ' && !gameOver) {
      playRound()
    }
  })

  return (
    <Box flexDirection="column">
      <Text>Player 1 Cards: {player1Deck.length}</Text>
      <Text>Player 2 Cards: {player2Deck.length}</Text>
      <Box marginY={1}>
        <Box marginRight={2}>
          <Text>Player 1:</Text>
          {player1Card && <Card {...player1Card} />}
        </Box>
        <Box>
          <Text>Player 2:</Text>
          {player2Card && <Card {...player2Card} />}
        </Box>
      </Box>
      <Text>{message}</Text>
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <WarGame />
  </DeckProvider>
)

export default App
```

## Key Concepts

1. **DeckProvider**: Wraps the entire application, providing deck management functionality.
2. **useDeck Hook**: Gives access to deck operations like `shuffle` and `draw`.
3. **Card Component**: Renders individual cards from the `ink-playing-cards` library.
4. **State Management**: Uses React's `useState` to manage game state.
5. **Side Effects**: Uses `useEffect` for game initialization.
6. **User Input**: Uses Ink's `useInput` hook to handle user interactions.

## Potential Enhancements

1. Add animations for card movements.
2. Implement a simple AI for single-player mode.
3. Add sound effects for card plays and war scenarios.
4. Implement a scoring system for multiple rounds.
5. Add color and styling to make the game more visually appealing in the terminal.

This implementation provides a solid foundation for the game of War and showcases how to use the `ink-playing-cards` library effectively. It can be further expanded and customized based on specific requirements or to add more advanced features.
