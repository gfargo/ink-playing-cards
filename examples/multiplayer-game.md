# Multiplayer Game Example

This example demonstrates how to implement a simple multiplayer card game using the Card Game Library for Ink. We'll create a basic game where players take turns drawing cards and the first player to collect all four suits wins.

## Implementation

```jsx
import React, { useState, useEffect } from 'react'
import { Box, Text } from 'ink'
import { DeckProvider, useDeck, Card } from 'card-game-library-ink'

const MultiplayerGame = () => {
  const { deck, shuffle, draw } = useDeck()
  const [players, setPlayers] = useState([
    { id: 'player1', name: 'Alice', hand: [] },
    { id: 'player2', name: 'Bob', hand: [] },
    { id: 'player3', name: 'Charlie', hand: [] },
  ])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [winner, setWinner] = useState(null)

  useEffect(() => {
    shuffle()
  }, [])

  const drawCard = () => {
    const currentPlayer = players[currentPlayerIndex]
    const drawnCard = draw(1, currentPlayer.id)[0]

    const updatedPlayers = players.map((player) =>
      player.id === currentPlayer.id
        ? { ...player, hand: [...player.hand, drawnCard] }
        : player
    )

    setPlayers(updatedPlayers)

    // Check for winner
    const suits = new Set(currentPlayer.hand.map((card) => card.suit))
    if (suits.size === 4) {
      setWinner(currentPlayer)
    } else {
      // Move to next player
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length)
    }
  }

  const renderPlayerHand = (player) => (
    <Box key={player.id} flexDirection="column" marginY={1}>
      <Text>{player.name}'s hand:</Text>
      <Box>
        {player.hand.map((card) => (
          <Card key={card.id} {...card} />
        ))}
      </Box>
    </Box>
  )

  return (
    <Box flexDirection="column">
      {players.map(renderPlayerHand)}
      {winner ? (
        <Text>{winner.name} wins!</Text>
      ) : (
        <>
          <Text>Current turn: {players[currentPlayerIndex].name}</Text>
          <Text>Press 'Space' to draw a card</Text>
        </>
      )}
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <MultiplayerGame />
  </DeckProvider>
)

export default App
```

This example showcases:

1. Setting up a game with multiple players
2. Managing player turns
3. Handling card drawing for each player
4. Checking for a win condition
5. Displaying the game state for all players

To run this example, you would need to handle user input (e.g., pressing the space bar to draw a card) and update the game state accordingly. This could be done using Ink's `useInput` hook or by integrating with a state management library like Redux.

The multiplayer structure can be easily extended to support more complex game rules, player interactions, and turn-based mechanics.
