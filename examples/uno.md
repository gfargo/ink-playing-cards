# Implementing Uno with ink-playing-cards

This guide demonstrates how to create a single-player Uno game (player vs. AI opponents) using the `ink-playing-cards` library and the `ink` library for terminal-based rendering. This implementation will showcase the use of the `CustomCard` component.

## Game Overview

Uno is a card game where players take turns matching a card in their hand with the current card shown on top of the deck, either by color or number. Special action cards add variety to the game. The goal is to be the first player to get rid of all their cards.

## Key Concepts

Before we dive into the implementation, let's review some key concepts:

1. **CustomCard**: We'll use the `CustomCard` component to create Uno-specific cards.
2. **DeckProvider**: A context provider from `ink-playing-cards` that manages the deck state.
3. **useDeck Hook**: A custom hook that gives us access to deck operations like `shuffle` and `draw`.
4. **Game State Management**: We'll use React's `useState` to manage the game state, including player hands, current card, and game direction.
5. **AI Logic**: We'll implement simple AI logic for computer opponents.
6. **User Input Handling**: We'll use Ink's `useInput` hook to handle player actions.
7. **Conditional Rendering**: We'll use conditional rendering to display different UI elements based on the game state.

## Implementation

### 1. Setup and Imports

```typescript
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import { DeckProvider, useDeck, CustomCard } from 'ink-playing-cards'

const UnoGame: React.FC = () => {
  // Component logic will go here
}

const App: React.FC = () => (
  <DeckProvider>
    <UnoGame />
  </DeckProvider>
)

export default App
```

### 2. Defining Uno Cards

First, let's define our Uno cards using the `CustomCard` component:

```typescript
const UNO_COLORS = ['red', 'blue', 'green', 'yellow']
const UNO_NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const UNO_ACTIONS = ['Skip', 'Reverse', 'Draw Two']
const UNO_WILD = ['Wild', 'Wild Draw Four']

interface UnoCard {
  color: string
  value: string
  isWild: boolean
}

const createUnoCard = (color: string, value: string): UnoCard => ({
  color,
  value,
  isWild: UNO_WILD.includes(value),
})

const renderUnoCard = (card: UnoCard) => (
  <CustomCard
    size="small"
    backgroundColor={card.isWild ? 'black' : card.color}
    textColor={card.isWild || card.color === 'yellow' ? 'white' : 'black'}
    title={card.value}
    description={card.isWild ? 'Choose Color' : ''}
  />
)
```

### 3. Game State

```typescript
const UnoGame: React.FC = () => {
  const { shuffle, draw } = useDeck()
  const [players, setPlayers] = useState<UnoCard[][]>([[], [], [], []])
  const [currentCard, setCurrentCard] = useState<UnoCard | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [direction, setDirection] = useState(1)
  const [message, setMessage] = useState('')

  // Rest of the component logic
}
```

### 4. Game Initialization

```typescript
useEffect(() => {
  startNewGame()
}, [])

const startNewGame = () => {
  const deck: UnoCard[] = []
  UNO_COLORS.forEach((color) => {
    UNO_NUMBERS.forEach((number) => {
      deck.push(createUnoCard(color, number))
      if (number !== '0') {
        deck.push(createUnoCard(color, number))
      }
    })
    UNO_ACTIONS.forEach((action) => {
      deck.push(createUnoCard(color, action))
      deck.push(createUnoCard(color, action))
    })
  })
  UNO_WILD.forEach((wild) => {
    for (let i = 0; i < 4; i++) {
      deck.push(createUnoCard('', wild))
    }
  })

  shuffle(deck)
  const newPlayers = [[], [], [], []]
  for (let i = 0; i < 4; i++) {
    newPlayers[i] = draw(7, deck)
  }
  setPlayers(newPlayers)
  setCurrentCard(draw(1, deck)[0])
  setCurrentPlayer(0)
  setDirection(1)
  setMessage('Your turn. Choose a card to play.')
}
```

### 5. Core Game Logic

```typescript
const isValidPlay = (card: UnoCard): boolean => {
  if (!currentCard) return false
  return (
    card.isWild ||
    card.color === currentCard.color ||
    card.value === currentCard.value
  )
}

const playCard = (cardIndex: number) => {
  const card = players[currentPlayer][cardIndex]
  if (!isValidPlay(card)) {
    setMessage('Invalid play. Choose another card.')
    return
  }

  const newPlayers = [...players]
  newPlayers[currentPlayer].splice(cardIndex, 1)
  setPlayers(newPlayers)
  setCurrentCard(card)

  if (newPlayers[currentPlayer].length === 0) {
    setMessage(`Player ${currentPlayer + 1} wins!`)
    return
  }

  handleSpecialCard(card)
  nextTurn()
}

const handleSpecialCard = (card: UnoCard) => {
  switch (card.value) {
    case 'Skip':
      nextTurn()
      break
    case 'Reverse':
      setDirection(direction * -1)
      break
    case 'Draw Two':
      const nextPlayer = (currentPlayer + direction + 4) % 4
      drawCards(nextPlayer, 2)
      nextTurn()
      break
    case 'Wild Draw Four':
      const wildNextPlayer = (currentPlayer + direction + 4) % 4
      drawCards(wildNextPlayer, 4)
      // In a real game, the current player would choose the color here
      setCurrentCard({
        ...card,
        color: UNO_COLORS[Math.floor(Math.random() * 4)],
      })
      nextTurn()
      break
    case 'Wild':
      // In a real game, the current player would choose the color here
      setCurrentCard({
        ...card,
        color: UNO_COLORS[Math.floor(Math.random() * 4)],
      })
      break
  }
}

const drawCards = (playerIndex: number, count: number) => {
  const newPlayers = [...players]
  const drawnCards = draw(count)
  newPlayers[playerIndex] = [...newPlayers[playerIndex], ...drawnCards]
  setPlayers(newPlayers)
}

const nextTurn = () => {
  setCurrentPlayer((currentPlayer + direction + 4) % 4)
  if ((currentPlayer + direction + 4) % 4 !== 0) {
    setTimeout(playAI, 1000)
  } else {
    setMessage('Your turn. Choose a card to play.')
  }
}

const playAI = () => {
  const aiHand = players[currentPlayer]
  const playableCards = aiHand.filter(isValidPlay)
  if (playableCards.length > 0) {
    const chosenCard =
      playableCards[Math.floor(Math.random() * playableCards.length)]
    playCard(aiHand.indexOf(chosenCard))
  } else {
    drawCards(currentPlayer, 1)
    nextTurn()
  }
}
```

### 6. User Input Handling

```typescript
useInput((input, key) => {
  if (currentPlayer === 0 && !isNaN(parseInt(input))) {
    const cardIndex = parseInt(input) - 1
    if (cardIndex >= 0 && cardIndex < players[0].length) {
      playCard(cardIndex)
    }
  } else if (input === 'd') {
    drawCards(0, 1)
    nextTurn()
  }
})
```

### 7. Rendering

```typescript
return (
  <Box flexDirection="column">
    <Text>Uno Game</Text>
    <Text>Current Card:</Text>
    {currentCard && renderUnoCard(currentCard)}
    <Text>Your Hand:</Text>
    <Box>
      {players[0].map((card, index) => (
        <Box key={index} marginRight={1}>
          {renderUnoCard(card)}
          <Text>{index + 1}</Text>
        </Box>
      ))}
    </Box>
    <Text>Opponent Hands:</Text>
    {players.slice(1).map((hand, playerIndex) => (
      <Text key={playerIndex}>
        Player {playerIndex + 2}: {hand.length} cards
      </Text>
    ))}
    <Text>{message}</Text>
    <Text>
      Press 'd' to draw a card, or the number of the card you want to play.
    </Text>
  </Box>
)
```

## Key Concepts

1. **Custom Cards**: This implementation showcases the use of `CustomCard` to create Uno-specific cards.
2. **Multiple Players**: The game manages multiple players, including AI opponents.
3. **Special Card Effects**: Uno includes special cards that affect game flow, requiring more complex game logic.
4. **Color Matching**: The game involves matching cards by color or value, adding complexity to the move validation.

## Error Handling and Edge Cases

1. **Invalid Plays**: Ensure that only valid card plays are allowed.
2. **Empty Deck**: Handle the case where the deck runs out of cards (reshuffle the discard pile).
3. **Special Card Stacking**: Consider implementing rules for stacking Draw Two or Wild Draw Four cards.
4. **Uno Call**: Implement the rule where players must call "Uno" when they have one card left.

## Performance Considerations

1. **Memoization**: Use React's `useMemo` or `useCallback` hooks to optimize rendering performance, especially for the AI logic.
2. **Efficient State Updates**: When updating player hands or the current card, use efficient state update methods to avoid unnecessary re-renders.
3. **AI Delay**: Implement the AI delay using `setTimeout` to avoid blocking the main thread.

## Potential Enhancements

1. Implement multiplayer support.
2. Add more sophisticated AI strategies.
3. Implement a scoring system for multiple rounds.
4. Add animations for card plays and draws.
5. Implement voice synthesis for "Uno" calls.

This implementation provides a solid foundation for an Uno game using the `ink-playing-cards` library and showcases the use of the `CustomCard` component. It demonstrates how to manage complex game states, handle special card effects, and implement simple AI opponents in a terminal-based environment.
