# Golf Card Game Implementation Guide

This guide demonstrates how to implement the Golf card game using the `ink-playing-cards` library and Ink for terminal-based rendering. This version will be a two-player game where the user plays against an AI opponent.

## Game Overview

Golf is a card game for two or more players, aiming to earn the lowest number of points by making the best sets of cards.

## Game Rules

1. Each player is dealt 6 cards face down in a 3x2 grid.
2. The remaining cards form a draw pile, and one card is turned face up to start the discard pile.
3. Players can look at and swap the two cards in the bottom row of their grid at the start of the game.
4. On each turn, a player can:
   a) Draw the top card from the draw pile
   b) Take the top card from the discard pile
5. After drawing, the player can either:
   a) Replace one of their face-down cards with the drawn card
   b) Discard the drawn card
6. If a player has three cards of the same rank in a column, those cards are removed from play.
7. The round ends when one player has all their cards face up.
8. Scoring:
   - Number cards are worth their face value
   - Face cards (J, Q, K) are worth 10 points
   - Aces are worth 1 point
   - Jokers are worth -2 points
   - A pair of equal cards in the same column cancels out (worth 0 points)

## Implementation

Let's break down the implementation into several steps:

### 1. Setup and Imports

First, we'll set up our project and import the necessary dependencies:

```jsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { DeckProvider, useDeck, Card, CardGrid } from 'ink-playing-cards'
```

### 2. Main Game Component

Now, let's create our main game component:

```jsx
const GolfGame = () => {
  const { deck, shuffle, draw } = useDeck()
  const [playerGrid, setPlayerGrid] = useState([])
  const [aiGrid, setAiGrid] = useState([])
  const [drawPile, setDrawPile] = useState([])
  const [discardPile, setDiscardPile] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState('player')
  const [selectedCard, setSelectedCard] = useState(null)
  const [gamePhase, setGamePhase] = useState('initial') // initial, main, endRound
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
  initializeGame()
}, [])

const initializeGame = () => {
  shuffle()
  const initialDraw = draw(13) // 6 for player, 6 for AI, 1 for discard pile
  setPlayerGrid(
    initialDraw.slice(0, 6).map((card) => ({ ...card, faceUp: false }))
  )
  setAiGrid(
    initialDraw.slice(6, 12).map((card) => ({ ...card, faceUp: false }))
  )
  setDiscardPile([initialDraw[12]])
  setDrawPile(deck.cards.filter((card) => !initialDraw.includes(card)))
  setGamePhase('initial')
  setMessage('Look at your bottom two cards. Click to flip them.')
}
```

### 4. Game Logic

Now, let's implement the core game logic:

```jsx
const flipInitialCards = (index) => {
  if (gamePhase !== 'initial' || index < 4) return
  const newGrid = [...playerGrid]
  newGrid[index].faceUp = !newGrid[index].faceUp
  setPlayerGrid(newGrid)
  if (newGrid[4].faceUp && newGrid[5].faceUp) {
    setGamePhase('main')
    setMessage('Your turn. Draw a card from the deck or discard pile.')
  }
}

const drawCard = (source) => {
  if (currentPlayer !== 'player' || gamePhase !== 'main') return
  if (source === 'deck') {
    const [drawnCard] = draw(1)
    setSelectedCard(drawnCard)
  } else {
    const [drawnCard, ...remainingDiscard] = discardPile
    setSelectedCard(drawnCard)
    setDiscardPile(remainingDiscard)
  }
  setMessage('Select a card to replace or discard the drawn card.')
}

const replaceCard = (index) => {
  if (!selectedCard || currentPlayer !== 'player' || gamePhase !== 'main')
    return
  const newGrid = [...playerGrid]
  const replacedCard = newGrid[index]
  newGrid[index] = { ...selectedCard, faceUp: true }
  setPlayerGrid(newGrid)
  setDiscardPile([replacedCard, ...discardPile])
  setSelectedCard(null)
  checkForTriples(newGrid)
  if (newGrid.every((card) => card.faceUp)) {
    endRound()
  } else {
    setCurrentPlayer('ai')
    setMessage("AI's turn.")
    setTimeout(aiTurn, 1000)
  }
}

const discardDrawnCard = () => {
  if (!selectedCard || currentPlayer !== 'player' || gamePhase !== 'main')
    return
  setDiscardPile([selectedCard, ...discardPile])
  setSelectedCard(null)
  setCurrentPlayer('ai')
  setMessage("AI's turn.")
  setTimeout(aiTurn, 1000)
}

const checkForTriples = (grid) => {
  for (let col = 0; col < 3; col++) {
    if (grid[col].rank === grid[col + 3].rank) {
      grid[col] = null
      grid[col + 3] = null
    }
  }
}

const aiTurn = () => {
  // Implement AI logic here
  // For simplicity, let's make the AI always draw from the deck and replace a random face-down card
  const [drawnCard] = draw(1)
  const newGrid = [...aiGrid]
  const faceDownIndices = newGrid.reduce((acc, card, index) => {
    if (!card.faceUp) acc.push(index)
    return acc
  }, [])
  const replaceIndex =
    faceDownIndices[Math.floor(Math.random() * faceDownIndices.length)]
  const replacedCard = newGrid[replaceIndex]
  newGrid[replaceIndex] = { ...drawnCard, faceUp: true }
  setAiGrid(newGrid)
  setDiscardPile([replacedCard, ...discardPile])
  checkForTriples(newGrid)
  if (newGrid.every((card) => card.faceUp)) {
    endRound()
  } else {
    setCurrentPlayer('player')
    setMessage('Your turn. Draw a card from the deck or discard pile.')
  }
}

const endRound = () => {
  setGamePhase('endRound')
  const playerScore = calculateScore(playerGrid)
  const aiScore = calculateScore(aiGrid)
  setMessage(`Round over! Your score: ${playerScore}, AI score: ${aiScore}`)
}

const calculateScore = (grid) => {
  return grid.reduce((score, card) => {
    if (!card) return score
    if (card.rank === 'A') return score + 1
    if (['J', 'Q', 'K'].includes(card.rank)) return score + 10
    if (card.rank === 'Joker') return score - 2
    return score + parseInt(card.rank)
  }, 0)
}
```

### 5. User Input Handling

We'll use Ink's `useInput` hook to handle user input:

```jsx
useInput((input, key) => {
  if (gamePhase === 'initial') {
    if (input === '1') flipInitialCards(4)
    if (input === '2') flipInitialCards(5)
  } else if (gamePhase === 'main' && currentPlayer === 'player') {
    if (input === 'd') drawCard('deck')
    if (input === 'p') drawCard('discard')
    if (selectedCard) {
      if (input >= '1' && input <= '6') replaceCard(parseInt(input) - 1)
      if (input === 'x') discardDrawnCard()
    }
  }
})
```

### 6. Rendering the Game State

Finally, let's render the game state:

```jsx
return (
  <Box flexDirection="column">
    <Text>Golf Card Game</Text>
    <Text>AI's Grid:</Text>
    <CardGrid cards={aiGrid} columns={3} />
    <Text>Your Grid:</Text>
    <CardGrid cards={playerGrid} columns={3} />
    <Box marginY={1}>
      <Text>Draw Pile: </Text>
      <Card {...drawPile[0]} faceUp={false} />
      <Text>Discard Pile: </Text>
      <Card {...discardPile[0]} />
    </Box>
    {selectedCard && (
      <Box marginY={1}>
        <Text>Selected Card: </Text>
        <Card {...selectedCard} />
      </Box>
    )}
    <Text>{message}</Text>
    {gamePhase === 'initial' && (
      <Text>Press 1 or 2 to flip your bottom cards</Text>
    )}
    {gamePhase === 'main' && currentPlayer === 'player' && (
      <Text>
        {selectedCard
          ? 'Press 1-6 to replace a card, or X to discard'
          : 'Press D to draw from deck, P to draw from discard pile'}
      </Text>
    )}
  </Box>
)
```

### 7. Wrapping it All Together

Here's the complete implementation:

```jsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { DeckProvider, useDeck, Card, CardGrid } from 'ink-playing-cards'

const GolfGame = () => {
  const { deck, shuffle, draw } = useDeck()
  const [playerGrid, setPlayerGrid] = useState([])
  const [aiGrid, setAiGrid] = useState([])
  const [drawPile, setDrawPile] = useState([])
  const [discardPile, setDiscardPile] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState('player')
  const [selectedCard, setSelectedCard] = useState(null)
  const [gamePhase, setGamePhase] = useState('initial')
  const [message, setMessage] = useState('')

  useEffect(() => {
    initializeGame()
  }, [])

  const initializeGame = () => {
    shuffle()
    const initialDraw = draw(13)
    setPlayerGrid(
      initialDraw.slice(0, 6).map((card) => ({ ...card, faceUp: false }))
    )
    setAiGrid(
      initialDraw.slice(6, 12).map((card) => ({ ...card, faceUp: false }))
    )
    setDiscardPile([initialDraw[12]])
    setDrawPile(deck.cards.filter((card) => !initialDraw.includes(card)))
    setGamePhase('initial')
    setMessage('Look at your bottom two cards. Click to flip them.')
  }

  const flipInitialCards = (index) => {
    if (gamePhase !== 'initial' || index < 4) return
    const newGrid = [...playerGrid]
    newGrid[index].faceUp = !newGrid[index].faceUp
    setPlayerGrid(newGrid)
    if (newGrid[4].faceUp && newGrid[5].faceUp) {
      setGamePhase('main')
      setMessage('Your turn. Draw a card from the deck or discard pile.')
    }
  }

  const drawCard = (source) => {
    if (currentPlayer !== 'player' || gamePhase !== 'main') return
    if (source === 'deck') {
      const [drawnCard] = draw(1)
      setSelectedCard(drawnCard)
    } else {
      const [drawnCard, ...remainingDiscard] = discardPile
      setSelectedCard(drawnCard)
      setDiscardPile(remainingDiscard)
    }
    setMessage('Select a card to replace or discard the drawn card.')
  }

  const replaceCard = (index) => {
    if (!selectedCard || currentPlayer !== 'player' || gamePhase !== 'main')
      return
    const newGrid = [...playerGrid]
    const replacedCard = newGrid[index]
    newGrid[index] = { ...selectedCard, faceUp: true }
    setPlayerGrid(newGrid)
    setDiscardPile([replacedCard, ...discardPile])
    setSelectedCard(null)
    checkForTriples(newGrid)
    if (newGrid.every((card) => card.faceUp)) {
      endRound()
    } else {
      setCurrentPlayer('ai')
      setMessage("AI's turn.")
      setTimeout(aiTurn, 1000)
    }
  }

  const discardDrawnCard = () => {
    if (!selectedCard || currentPlayer !== 'player' || gamePhase !== 'main')
      return
    setDiscardPile([selectedCard, ...discardPile])
    setSelectedCard(null)
    setCurrentPlayer('ai')
    setMessage("AI's turn.")
    setTimeout(aiTurn, 1000)
  }

  const checkForTriples = (grid) => {
    for (let col = 0; col < 3; col++) {
      if (grid[col].rank === grid[col + 3].rank) {
        grid[col] = null
        grid[col + 3] = null
      }
    }
  }

  const aiTurn = () => {
    const [drawnCard] = draw(1)
    const newGrid = [...aiGrid]
    const faceDownIndices = newGrid.reduce((acc, card, index) => {
      if (!card.faceUp) acc.push(index)
      return acc
    }, [])
    const replaceIndex =
      faceDownIndices[Math.floor(Math.random() * faceDownIndices.length)]
    const replacedCard = newGrid[replaceIndex]
    newGrid[replaceIndex] = { ...drawnCard, faceUp: true }
    setAiGrid(newGrid)
    setDiscardPile([replacedCard, ...discardPile])
    checkForTriples(newGrid)
    if (newGrid.every((card) => card.faceUp)) {
      endRound()
    } else {
      setCurrentPlayer('player')
      setMessage('Your turn. Draw a card from the deck or discard pile.')
    }
  }

  const endRound = () => {
    setGamePhase('endRound')
    const playerScore = calculateScore(playerGrid)
    const aiScore = calculateScore(aiGrid)
    setMessage(`Round over! Your score: ${playerScore}, AI score: ${aiScore}`)
  }

  const calculateScore = (grid) => {
    return grid.reduce((score, card) => {
      if (!card) return score
      if (card.rank === 'A') return score + 1
      if (['J', 'Q', 'K'].includes(card.rank)) return score + 10
      if (card.rank === 'Joker') return score - 2
      return score + parseInt(card.rank)
    }, 0)
  }

  useInput((input, key) => {
    if (gamePhase === 'initial') {
      if (input === '1') flipInitialCards(4)
      if (input === '2') flipInitialCards(5)
    } else if (gamePhase === 'main' && currentPlayer === 'player') {
      if (input === 'd') drawCard('deck')
      if (input === 'p') drawCard('discard')
      if (selectedCard) {
        if (input >= '1' && input <= '6') replaceCard(parseInt(input) - 1)
        if (input === 'x') discardDrawnCard()
      }
    }
  })

  return (
    <Box flexDirection="column">
      <Text>Golf Card Game</Text>
      <Text>AI's Grid:</Text>
      <CardGrid cards={aiGrid} columns={3} />
      <Text>Your Grid:</Text>
      <CardGrid cards={playerGrid} columns={3} />
      <Box marginY={1}>
        <Text>Draw Pile: </Text>
        <Card {...drawPile[0]} faceUp={false} />
        <Text>Discard Pile: </Text>
        <Card {...discardPile[0]} />
      </Box>
      {selectedCard && (
        <Box marginY={1}>
          <Text>Selected Card: </Text>
          <Card {...selectedCard} />
        </Box>
      )}
      <Text>{message}</Text>
      {gamePhase === 'initial' && (
        <Text>Press 1 or 2 to flip your bottom cards</Text>
      )}
      {gamePhase === 'main' && currentPlayer === 'player' && (
        <Text>
          {selectedCard
            ? 'Press 1-6 to replace a card, or X to discard'
            : 'Press D to draw from deck, P to draw from discard pile'}
        </Text>
      )}
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <GolfGame />
  </DeckProvider>
)

export default App
```

## Key Concepts

1. **DeckProvider**: Wraps the entire application, providing deck management functionality.
2. **useDeck Hook**: Gives access to deck operations like `shuffle` and `draw`.
3. **Card Component**: Renders individual cards from the `ink-playing-cards` library.
4. **CardGrid Component**: Renders a grid of cards, used for player and AI hands.
5. **State Management**: Uses React's `useState` to manage game state, including player and AI grids, draw and discard piles, game phase, and current player.
6. **Side Effects**: Uses `useEffect` for game initialization.
7. **User Input**: Uses Ink's `useInput` hook to handle user interactions for card selection and actions.
8. **AI Logic**: Implements a simple AI opponent that makes random moves.
9. **Scoring System**: Implements the Golf scoring rules, including special cases for face cards and Jokers.

## Potential Enhancements

1. Implement a more sophisticated AI strategy.
2. Add support for multiple rounds and keeping a cumulative score.
3. Implement a multiplayer mode for 2-4 players.
4. Add animations for card movements and flips.
5. Implement a save/load feature for game state persistence.
6. Add sound effects for card actions and end-of-round results.
7. Enhance the UI with colors and custom card designs.
8. Add difficulty levels for the AI opponent.

This implementation provides a solid foundation for the Golf card game and showcases how to use the `ink-playing-cards` library effectively in a more complex game scenario. It demonstrates the use of various components and hooks from the library, as well as how to implement game-specific logic and AI behavior.
