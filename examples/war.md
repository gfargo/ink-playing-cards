# War Card Game Example

This example demonstrates how to implement a simple version of the card game "War" using the Card Game Library for Ink.

## Game Rules

1. The deck is divided evenly between two players.
2. Each player reveals the top card of their deck simultaneously.
3. The player with the higher card wins both cards and adds them to the bottom of their deck.
4. If there's a tie, each player places three cards face down and then one card face up. The player with the higher face-up card wins all the cards. If there's another tie, repeat this process.
5. The game ends when one player has all the cards.

## Implementation

```jsx
import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { DeckProvider, useDeck, Card } from 'card-game-library-ink'

const WarGame = () => {
  const { deck, shuffle, draw } = useDeck()
  const [player1Deck, setPlayer1Deck] = useState([])
  const [player2Deck, setPlayer2Deck] = useState([])
  const [player1Card, setPlayer1Card] = useState(null)
  const [player2Card, setPlayer2Card] = useState(null)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    shuffle()
    const halfDeck = Math.floor(deck.cards.length / 2)
    setPlayer1Deck(deck.cards.slice(0, halfDeck))
    setPlayer2Deck(deck.cards.slice(halfDeck))
  }, [])

  const playRound = () => {
    if (player1Deck.length === 0 || player2Deck.length === 0) {
      setGameOver(true)
      return
    }

    const card1 = player1Deck.shift()
    const card2 = player2Deck.shift()
    setPlayer1Card(card1)
    setPlayer2Card(card2)

    if (card1.value > card2.value) {
      setPlayer1Deck([...player1Deck, card1, card2])
    } else if (card2.value > card1.value) {
      setPlayer2Deck([...player2Deck, card1, card2])
    } else {
      // War scenario
      const warCards1 = player1Deck.splice(0, 3)
      const warCards2 = player2Deck.splice(0, 3)
      setPlayer1Deck([...player1Deck, card1, ...warCards1, card2, ...warCards2])
    }
  }

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
      {gameOver ? (
        <Text>
          Game Over! {player1Deck.length > 0 ? 'Player 1' : 'Player 2'} wins!
        </Text>
      ) : (
        <Text>Press 'Space' to play a round</Text>
      )}
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

This example showcases:

1. Using the `DeckProvider` to manage the game state
2. Utilizing the `useDeck` hook to access deck operations
3. Implementing game logic for the "War" card game
4. Rendering cards and game state using Ink components

To run this example, you would need to handle user input (e.g., pressing the space bar to play a round) and update the game state accordingly. This could be done using Ink's `useInput` hook or by integrating with a state management library like Redux.
