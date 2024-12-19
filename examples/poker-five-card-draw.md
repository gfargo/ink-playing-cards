# Implementing Poker (Five Card Draw) with ink-playing-cards

This guide demonstrates how to create a simple Poker game (Five Card Draw variant) using the `ink-playing-cards` library and the `ink` library for terminal-based rendering.

## Game Overview

Five Card Draw is a poker variant where each player is dealt five cards, has the opportunity to discard and draw new cards, and then bets based on the strength of their hand. The player with the best hand at showdown wins the pot.

## Key Concepts

1. **DeckProvider**: Manages the deck state.
2. **useDeck Hook**: Provides deck operations like `shuffle` and `draw`.
3. **Card Component**: Renders individual cards.
4. **Game State Management**: Manages player hands, betting rounds, and pot.
5. **Hand Evaluation**: Determines the strength of poker hands.
6. **Betting Logic**: Handles player bets, raises, and folds.
7. **AI Logic**: Implements simple AI for computer opponents.

## Implementation

### 1. Setup and Imports

```typescript
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { DeckProvider, useDeck, Card } from 'ink-playing-cards'

const PokerGame: React.FC = () => {
  // Component logic will go here
}

const App: React.FC = () => (
  <DeckProvider>
    <PokerGame />
  </DeckProvider>
)

export default App
```

### 2. Game State

```typescript
const PokerGame: React.FC = () => {
  const { deck, shuffle, draw } = useDeck()
  const [players, setPlayers] = useState<
    { hand: Card[]; chips: number; bet: number }[]
  >([])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [pot, setPot] = useState(0)
  const [gamePhase, setGamePhase] = useState<
    'deal' | 'discard' | 'betting' | 'showdown'
  >('deal')
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
  const newPlayers = Array(4)
    .fill(null)
    .map(() => ({
      hand: draw(5),
      chips: 1000,
      bet: 0,
    }))
  setPlayers(newPlayers)
  setCurrentPlayer(0)
  setPot(0)
  setGamePhase('betting')
  setMessage('Betting round: Player 1 to act')
}
```

### 4. Hand Evaluation

```typescript
const handRanks = [
  'High Card',
  'Pair',
  'Two Pair',
  'Three of a Kind',
  'Straight',
  'Flush',
  'Full House',
  'Four of a Kind',
  'Straight Flush',
  'Royal Flush',
]

const evaluateHand = (hand: Card[]): { rank: number; name: string } => {
  // Implement hand evaluation logic here
  // This is a simplified version and doesn't cover all cases
  const ranks = hand.map((card) => card.rank)
  const suits = hand.map((card) => card.suit)

  const rankCounts = ranks.reduce((acc, rank) => {
    acc[rank] = (acc[rank] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const maxCount = Math.max(...Object.values(rankCounts))

  if (maxCount === 4) return { rank: 7, name: 'Four of a Kind' }
  if (maxCount === 3 && Object.keys(rankCounts).length === 2)
    return { rank: 6, name: 'Full House' }
  if (new Set(suits).size === 1) return { rank: 5, name: 'Flush' }
  if (maxCount === 3) return { rank: 3, name: 'Three of a Kind' }
  if (maxCount === 2 && Object.keys(rankCounts).length === 3)
    return { rank: 2, name: 'Two Pair' }
  if (maxCount === 2) return { rank: 1, name: 'Pair' }

  return { rank: 0, name: 'High Card' }
}
```

### 5. Betting Logic

```typescript
const bet = (amount: number) => {
  const player = players[currentPlayer]
  if (amount > player.chips) {
    setMessage('Not enough chips')
    return
  }

  const newPlayers = [...players]
  newPlayers[currentPlayer].bet += amount
  newPlayers[currentPlayer].chips -= amount
  setPlayers(newPlayers)
  setPot(pot + amount)

  nextPlayer()
}

const fold = () => {
  const newPlayers = [...players]
  newPlayers[currentPlayer].hand = []
  setPlayers(newPlayers)
  nextPlayer()
}

const nextPlayer = () => {
  let nextPlayerIndex = (currentPlayer + 1) % players.length
  while (players[nextPlayerIndex].hand.length === 0) {
    nextPlayerIndex = (nextPlayerIndex + 1) % players.length
  }

  if (nextPlayerIndex === 0) {
    setGamePhase('discard')
    setMessage('Discard phase: Choose cards to discard')
  } else {
    setCurrentPlayer(nextPlayerIndex)
    setMessage(`Player ${nextPlayerIndex + 1} to act`)
  }
}
```

### 6. AI Logic

```typescript
const playAI = () => {
  const player = players[currentPlayer]
  const handStrength = evaluateHand(player.hand)

  if (handStrength.rank >= 3) {
    // Strong hand, bet or raise
    bet(Math.min(50, player.chips))
  } else if (handStrength.rank >= 1) {
    // Mediocre hand, call or check
    const callAmount = Math.max(...players.map((p) => p.bet)) - player.bet
    bet(Math.min(callAmount, player.chips))
  } else {
    // Weak hand, fold
    fold()
  }
}
```

### 7. User Input Handling

```typescript
useInput((input, key) => {
  if (currentPlayer !== 0) return // Only handle input for human player

  if (gamePhase === 'betting') {
    if (input === 'c') bet(10) // Call
    if (input === 'r') bet(20) // Raise
    if (input === 'f') fold()
  } else if (gamePhase === 'discard') {
    const index = parseInt(input)
    if (!isNaN(index) && index >= 1 && index <= 5) {
      discardCard(index - 1)
    }
    if (input === 'd') finishDiscard()
  }
})
```

### 8. Rendering

```typescript
return (
  <Box flexDirection="column">
    <Text>Poker - Five Card Draw</Text>
    <Text>Pot: ${pot}</Text>
    <Text>Current Player: {currentPlayer + 1}</Text>
    <Text>Phase: {gamePhase}</Text>
    <Text>{message}</Text>
    {players.map((player, index) => (
      <Box key={index} flexDirection="column" marginY={1}>
        <Text>
          Player {index + 1} (Chips: ${player.chips}, Bet: ${player.bet})
        </Text>
        <Box>
          {player.hand.map((card, cardIndex) => (
            <Card key={cardIndex} {...card} faceUp={index === 0} />
          ))}
        </Box>
      </Box>
    ))}
    {gamePhase === 'betting' && currentPlayer === 0 && (
      <Text>Press 'c' to call, 'r' to raise, 'f' to fold</Text>
    )}
    {gamePhase === 'discard' && currentPlayer === 0 && (
      <Text>Enter card numbers to discard, 'd' when done</Text>
    )}
  </Box>
)
```

## Key Concepts

1. **Hand Evaluation**: The `evaluateHand` function determines the strength of poker hands.
2. **Betting Rounds**: The game alternates between betting and discard phases.
3. **AI Decision Making**: Simple AI logic decides whether to bet, call, or fold based on hand strength.
4. **Chip Management**: Players have chips that they use for betting.

## Error Handling and Edge Cases

1. **All-in Situations**: Handle cases where a player bets all their chips.
2. **Tie Breakers**: Implement more detailed hand comparison for ties.
3. **Empty Deck**: Handle situations where the deck runs out of cards.

## Performance Considerations

1. **Hand Evaluation Optimization**: Optimize the hand evaluation function for better performance.
2. **State Updates**: Use efficient state update methods to avoid unnecessary re-renders.

## Potential Enhancements

1. Implement more sophisticated AI strategies.
2. Add support for different poker variants (e.g., Texas Hold'em, Omaha).
3. Implement a more detailed betting system with blinds and antes.
4. Add animations for card dealing and chip movement.
5. Implement a multi-game tournament system.

This implementation provides a foundation for a Five Card Draw Poker game using the `ink-playing-cards` library. It demonstrates complex hand evaluation, betting mechanics, and simple AI opponents in a terminal-based environment.
