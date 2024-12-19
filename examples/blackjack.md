# Implementing Blackjack with ink-playing-cards

This guide demonstrates how to create a single-player version of Blackjack using the `ink-playing-cards` library and the `ink` library for terminal-based rendering.

## Game Overview

Blackjack is a card game where the player competes against the dealer. The goal is to have a hand value closer to 21 than the dealer's hand without going over 21.

## Key Concepts

Before we dive into the implementation, let's review some key concepts that we'll be using:

1. **DeckProvider**: A context provider from `ink-playing-cards` that manages the deck state.
2. **useDeck Hook**: A custom hook that gives us access to deck operations like `shuffle` and `draw`.
3. **Card Component**: Used to render individual cards in the player and dealer hands.
4. **Game State Management**: We'll use React's `useState` to manage various aspects of the game state.
5. **Side Effects**: We'll use `useEffect` for game initialization and score updates.
6. **User Input Handling**: We'll use Ink's `useInput` hook to handle player actions.
7. **Conditional Rendering**: We'll use conditional rendering to display different UI elements based on the game state.

## Setup

First, let's set up the necessary imports and create the main game component:

```jsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { DeckProvider, useDeck, Card } from 'ink-playing-cards'

const BlackjackGame = () => {
  // Game state and logic will go here
  return (
    <Box flexDirection="column">
      <Text>Blackjack Game</Text>
      {/* Game UI will go here */}
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <BlackjackGame />
  </DeckProvider>
)

export default App
```

Here, we're using the `DeckProvider` from `ink-playing-cards` to manage our deck state, and we've created a `BlackjackGame` component that will contain our game logic. Note that we've removed the `CardStack` import as we'll be using individual `Card` components instead.

## Game State

Let's define our game state:

```jsx
const BlackjackGame = () => {
  const { deck, draw, shuffle } = useDeck()
  const [playerHand, setPlayerHand] = useState([])
  const [dealerHand, setDealerHand] = useState([])
  const [gameState, setGameState] = useState('betting') // betting, playing, dealerTurn, gameOver
  const [playerScore, setPlayerScore] = useState(0)
  const [dealerScore, setDealerScore] = useState(0)
  const [message, setMessage] = useState('')

  // ... (rest of the component)
}
```

We're using the `useDeck` hook to access deck operations. We're also using `useState` to manage the player's hand, dealer's hand, game state, scores, and any messages we want to display.

## Initializing the Game

Let's add a function to start a new game:

```jsx
const startNewGame = () => {
  shuffle()
  setPlayerHand(draw(2))
  setDealerHand(draw(2))
  setGameState('playing')
  updateScores()
}

useEffect(() => {
  startNewGame()
}, [])
```

We use the `shuffle` function from `useDeck` to shuffle the deck, then `draw` to deal two cards each to the player and dealer. We're using `useEffect` to start a new game when the component mounts.

## Calculating Scores

We need a function to calculate hand scores:

```jsx
const calculateScore = (hand) => {
  let score = 0
  let aceCount = 0

  for (const card of hand) {
    if (card.rank === 'A') {
      aceCount++
    } else if (['J', 'Q', 'K'].includes(card.rank)) {
      score += 10
    } else {
      score += parseInt(card.rank)
    }
  }

  for (let i = 0; i < aceCount; i++) {
    if (score + 11 <= 21) {
      score += 11
    } else {
      score += 1
    }
  }

  return score
}

const updateScores = () => {
  setPlayerScore(calculateScore(playerHand))
  setDealerScore(calculateScore(dealerHand))
}

useEffect(() => {
  updateScores()
}, [playerHand, dealerHand])
```

This function calculates the score for a hand, taking into account the special scoring rules for Aces. We use `useEffect` to update scores whenever the hands change.

## Game Actions

Now let's implement the main game actions:

```jsx
const hit = () => {
  if (gameState === 'playing') {
    const newCard = draw(1)[0]
    setPlayerHand([...playerHand, newCard])

    if (calculateScore([...playerHand, newCard]) > 21) {
      setGameState('gameOver')
      setMessage('Bust! You lose.')
    }
  }
}

const stand = () => {
  if (gameState === 'playing') {
    setGameState('dealerTurn')
    dealerPlay()
  }
}

const dealerPlay = () => {
  let currentHand = [...dealerHand]
  let currentScore = calculateScore(currentHand)

  while (currentScore < 17) {
    const newCard = draw(1)[0]
    currentHand.push(newCard)
    currentScore = calculateScore(currentHand)
  }

  setDealerHand(currentHand)

  if (currentScore > 21) {
    setGameState('gameOver')
    setMessage('Dealer busts! You win!')
  } else if (currentScore >= playerScore) {
    setGameState('gameOver')
    setMessage('Dealer wins!')
  } else {
    setGameState('gameOver')
    setMessage('You win!')
  }
}
```

These functions implement the core game logic for hitting, standing, and the dealer's turn.

## User Input

We'll use Ink's `useInput` hook to handle user input:

```jsx
useInput((input, key) => {
  if (gameState === 'playing') {
    if (input === 'h') {
      hit()
    } else if (input === 's') {
      stand()
    }
  } else if (gameState === 'gameOver') {
    if (input === 'n') {
      startNewGame()
    }
  }
})
```

## Rendering the Game

Finally, let's render the game state:

```jsx
return (
  <Box flexDirection="column">
    <Text>Blackjack Game</Text>
    <Text>
      Dealer's Hand (Score: {gameState === 'playing' ? '?' : dealerScore}):
    </Text>
    <Box flexDirection="row">
      <Card {...dealerHand[0]} />
      {gameState === 'playing' ? (
        <Card rank="?" suit="?" />
      ) : (
        dealerHand[1] && <Card {...dealerHand[1]} />
      )}
    </Box>
    <Text>Your Hand (Score: {playerScore}):</Text>
    <Box flexDirection="row">
      {playerHand.map((card, index) => (
        <Card key={index} {...card} />
      ))}
    </Box>
    <Text>{message}</Text>
    {gameState === 'playing' && <Text>Press 'h' to hit, 's' to stand</Text>}
    {gameState === 'gameOver' && <Text>Press 'n' for a new game</Text>}
  </Box>
)
```

Here, we're using individual `Card` components from `ink-playing-cards` to render each card in the hands. We're using a `Box` component with `flexDirection="row"` to display the cards side by side. For the dealer's hand, we're conditionally rendering a face-down card (represented by "?") when the game is in the 'playing' state. We're also conditionally rendering different UI elements based on the game state.

## Conclusion

This implementation demonstrates how to use various components and hooks from `ink-playing-cards`:

- `DeckProvider`: Provides the deck context for the entire game.
- `useDeck`: Gives us access to deck operations like `shuffle` and `draw`.
- `Card`: Used to render individual cards in the player and dealer hands.

By using individual `Card` components instead of `CardStack`, we ensure that all cards are clearly visible to the player, which is crucial for a game like Blackjack where the player needs to see all their cards to make decisions. This approach also provides more flexibility for future enhancements, such as:

1. Handling more than two cards in the player's hand: The current implementation using `playerHand.map()` automatically accommodates any number of cards in the player's hand.
2. Implementing card animations or special effects for specific cards.
3. Adding interactive elements to individual cards (e.g., for a more complex game like Poker).

To style the cards or adjust their positioning, you can modify the `Box` component that contains the cards. For example, to add spacing between cards:

```jsx
<Box flexDirection="row" gap={1}>
  {playerHand.map((card, index) => (
    <Card key={index} {...card} />
  ))}
</Box>
```

We've also used several React and Ink features:

- `useState`: To manage game state.
- `useEffect`: To perform side effects like starting a new game and updating scores.
- `useInput`: To handle user input in the terminal.

This Blackjack implementation showcases how the `ink-playing-cards` library can be used to create a fully functional card game with relatively little code. The library's components and hooks handle much of the complexity of deck and card management, allowing us to focus on game-specific logic.

To further enhance this game, you could:

1. Add betting functionality
2. Implement a multi-player version
3. Add more advanced Blackjack rules like splitting and doubling down
4. Implement a simple AI for the dealer's decisions
5. Add color and styling to make the game more visually appealing in the terminal

Remember to update the game logic and UI accordingly when implementing these enhancements. The flexibility of using individual `Card` components will make many of these improvements easier to implement.

## Error Handling and Edge Cases

When implementing this Blackjack game, consider the following error handling and edge cases:

1. **Empty Deck**: Handle the case where the deck runs out of cards. You might want to reshuffle the discard pile back into the deck.

2. **Invalid Input**: Ensure that the game only responds to valid inputs ('h' for hit, 's' for stand, 'n' for new game) and ignores invalid inputs.

3. **Ace Handling**: The current implementation handles Aces correctly, but make sure to test edge cases with multiple Aces in a hand.

4. **Dealer Blackjack**: Consider implementing a check for dealer Blackjack at the start of the game for a more authentic experience.

5. **Tie Handling**: The current implementation handles ties, but you might want to add a specific message for when both the player and dealer have Blackjack.

## Performance Considerations

While this implementation is suitable for most use cases, here are some performance considerations for larger scale or more complex implementations:

1. **Memoization**: If you add more complex UI elements, consider using React's `useMemo` or `useCallback` hooks to optimize rendering performance.

2. **Batch Updates**: When updating multiple state variables at once (e.g., in the `dealerPlay` function), consider using a single setState call with an object to batch the updates.

3. **Lazy Initialization**: For any computationally expensive initializations, use the lazy initialization form of useState.

4. **Deck Management**: For games with a large number of players or continuous play, consider implementing a more efficient deck management system, possibly with a separate deck service.

By keeping these points in mind, you can create a robust and efficient Blackjack game using the `ink-playing-cards` library. The modular nature of this implementation allows for easy extensions and modifications to suit various game rules and styles.
