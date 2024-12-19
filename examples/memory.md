# Implementing Memory/Concentration with ink-playing-cards

This guide demonstrates how to create a Memory/Concentration game using the `ink-playing-cards` library and the `ink` library for terminal-based rendering. This implementation will support both single-player and player vs. AI modes.

## Game Overview

Memory, also known as Concentration, is a card game where all cards are laid face down on a surface and two cards are flipped face up over each turn. The object of the game is to turn over pairs of matching cards.

## Key Concepts

Before we dive into the implementation, let's review some key concepts:

1. **DeckProvider**: A context provider from `ink-playing-cards` that manages the deck state.
2. **useDeck Hook**: A custom hook that gives us access to deck operations like `shuffle` and `draw`.
3. **Card Component**: Used to render individual cards, both face-up and face-down.
4. **Game State Management**: We'll use React's `useState` to manage the game state, including the grid of cards, flipped cards, and player scores.
5. **AI Logic**: We'll implement simple AI logic for the computer opponent.
6. **User Input Handling**: We'll use Ink's `useInput` hook to handle player actions.
7. **Conditional Rendering**: We'll use conditional rendering to display cards face-up or face-down based on the game state.

## Implementation

### 1. Setup and Imports

```typescript
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { DeckProvider, useDeck, Card } from 'ink-playing-cards'

const MemoryGame: React.FC = () => {
  // Component logic will go here
}

const App: React.FC = () => (
  <DeckProvider>
    <MemoryGame />
  </DeckProvider>
)

export default App
```

### 2. Game State

```typescript
const MemoryGame: React.FC = () => {
  const { deck, shuffle, draw } = useDeck()
  const [grid, setGrid] = useState<Card[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<'player' | 'ai'>('player')
  const [scores, setScores] = useState({ player: 0, ai: 0 })
  const [message, setMessage] = useState('')
  const [gameMode, setGameMode] = useState<'single' | 'vs-ai'>('single')
  const [selectedIndex, setSelectedIndex] = useState(0)

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
  const gameCards = draw(8).concat(draw(8))
  shuffle(gameCards)
  setGrid(gameCards)
  setFlippedIndices([])
  setMatchedPairs([])
  setScores({ player: 0, ai: 0 })
  setCurrentPlayer('player')
  setMessage('Use arrow keys to move, space to flip a card.')
}
```

### 4. Core Game Logic

```typescript
const flipCard = (index: number) => {
  if (
    flippedIndices.length === 2 ||
    flippedIndices.includes(index) ||
    matchedPairs.includes(grid[index].rank)
  ) {
    return
  }

  const newFlippedIndices = [...flippedIndices, index]
  setFlippedIndices(newFlippedIndices)

  if (newFlippedIndices.length === 2) {
    const [firstIndex, secondIndex] = newFlippedIndices
    if (grid[firstIndex].rank === grid[secondIndex].rank) {
      setMatchedPairs([...matchedPairs, grid[firstIndex].rank])
      setScores((prevScores) => ({
        ...prevScores,
        [currentPlayer]: prevScores[currentPlayer] + 1,
      }))
      setMessage(`${currentPlayer === 'player' ? 'You' : 'AI'} found a match!`)
      setFlippedIndices([])
    } else {
      setMessage('No match. Flipping cards back.')
      setTimeout(() => {
        setFlippedIndices([])
        switchPlayer()
      }, 2000)
    }
  }
}

const switchPlayer = () => {
  setCurrentPlayer(currentPlayer === 'player' ? 'ai' : 'player')
  if (gameMode === 'vs-ai' && currentPlayer === 'player') {
    setTimeout(playAI, 1000)
  }
}

const playAI = () => {
  const unmatched = grid
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => !matchedPairs.includes(card.rank))

  let firstIndex: number, secondIndex: number

  // Check if AI remembers a pair
  const knownPair = unmatched.find(({ card, index }) =>
    unmatched.some(
      (other) => other.index !== index && other.card.rank === card.rank
    )
  )

  if (knownPair) {
    firstIndex = knownPair.index
    secondIndex = unmatched.find(
      ({ card, index }) =>
        index !== firstIndex && card.rank === knownPair.card.rank
    )!.index
  } else {
    // Randomly select two cards
    ;[firstIndex, secondIndex] = unmatched
      .map(({ index }) => index)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
  }

  flipCard(firstIndex)
  setTimeout(() => flipCard(secondIndex), 1000)
}
```

### 5. User Input Handling

```typescript
useInput((input, key) => {
  if (currentPlayer !== 'player') return

  if (key.leftArrow) {
    setSelectedIndex(Math.max(0, selectedIndex - 1))
  } else if (key.rightArrow) {
    setSelectedIndex(Math.min(grid.length - 1, selectedIndex + 1))
  } else if (key.upArrow) {
    setSelectedIndex(Math.max(0, selectedIndex - 4))
  } else if (key.downArrow) {
    setSelectedIndex(Math.min(grid.length - 1, selectedIndex + 4))
  } else if (input === ' ') {
    flipCard(selectedIndex)
  }
})
```

### 6. Rendering

```typescript
return (
  <Box flexDirection="column">
    <Text>Memory/Concentration Game</Text>
    <Text>
      Player Score: {scores.player} | AI Score: {scores.ai}
    </Text>
    <Text>{message}</Text>
    <Box flexDirection="column">
      {[0, 1, 2, 3].map((row) => (
        <Box key={row}>
          {[0, 1, 2, 3].map((col) => {
            const index = row * 4 + col
            const card = grid[index]
            return (
              <Box key={col} marginRight={1} marginBottom={1}>
                <Card
                  {...card}
                  faceUp={
                    flippedIndices.includes(index) ||
                    matchedPairs.includes(card.rank)
                  }
                  selected={selectedIndex === index}
                />
              </Box>
            )
          })}
        </Box>
      ))}
    </Box>
    <Text>Current Player: {currentPlayer === 'player' ? 'You' : 'AI'}</Text>
    {currentPlayer === 'player' && (
      <Text>Use arrow keys to move, space to flip a card</Text>
    )}
  </Box>
)
```

## Key Concepts

1. **Grid Management**: This game involves managing a grid of cards, requiring careful state management and rendering.
2. **Card Flipping**: The core mechanic involves flipping cards and checking for matches, which is handled by the `flipCard` function.
3. **AI Logic**: The AI opponent uses a simple strategy to remember card positions and make matches when possible.
4. **Turn-based Gameplay**: The game alternates between the player and AI turns in vs-AI mode.

## Error Handling and Edge Cases

1. **Invalid Flips**: Ensure that players can't flip already matched cards or more than two cards at once.
2. **Game End**: Implement a check for when all pairs have been matched, ending the game and declaring a winner.
3. **AI Delay**: Implement appropriate delays for AI moves to make the game feel more natural.
4. **Input Handling**: Ensure that user input is only processed during the player's turn.

## Performance Considerations

1. **Memoization**: Use React's `useMemo` or `useCallback` hooks to optimize rendering performance, especially for the grid rendering.
2. **Efficient State Updates**: When updating the grid or scores, use efficient state update methods to avoid unnecessary re-renders.
3. **Timeout Management**: Be careful with the use of `setTimeout` and clear any ongoing timeouts when the component unmounts or the game resets.

## Potential Enhancements

1. Implement different difficulty levels for the AI.
2. Add a timer to track how long it takes to complete the game.
3. Implement a leaderboard for fastest completion times or highest scores.
4. Add animations for card flips and matches.
5. Allow players to choose the grid size and number of pairs.

This implementation provides a solid foundation for a Memory/Concentration game using the `ink-playing-cards` library. It demonstrates how to manage a grid of cards, implement game logic for matching pairs, and create a simple AI opponent in a terminal-based environment.
