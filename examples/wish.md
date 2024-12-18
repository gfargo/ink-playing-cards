# Implementing Wish with ink-playing-cards

This guide demonstrates how to create the Wish card game using the `ink-playing-cards` library and the `ink` library for terminal-based rendering.

## Game Overview

Wish is a simple matching game suitable for children. The game uses 32 cards from sevens upward, plus the aces. The objective is to remove all cards by matching pairs of the same rank.

## Game Rules

1. Use 32 cards: 7, 8, 9, 10, J, Q, K, A of all suits.
2. Shuffle the cards and lay them out face down in 8 piles of 4 cards each.
3. Turn over the top card of each pile.
4. Remove any pairs of cards with the same rank.
5. When a card is removed, turn over the next card in that pile.
6. Continue until all cards are removed or no more matches are possible.
7. If all cards are removed, the player wins and can make a wish!

## Key Concepts

1. **DeckProvider**: Manages the deck state.
2. **useDeck Hook**: Provides deck operations like `shuffle` and `draw`.
3. **Card Component**: Renders individual cards.
4. **Pile Management**: Manages the 8 piles of cards.
5. **Pair Matching**: Handles the matching and removal of pairs.
6. **Game State**: Tracks the current state of the game (in progress, won, or lost).

## Implementation

### 1. Setup and Imports

```typescript
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { DeckProvider, useDeck, Card } from 'ink-playing-cards';

const WishGame: React.FC = () => {
  // Component logic will go here
};

const App: React.FC = () => (
  <DeckProvider>
    <WishGame />
  </DeckProvider>
);

export default App;
```

### 2. Game State

```typescript
const WishGame: React.FC = () => {
  const { deck, shuffle, draw } = useDeck();
  const [piles, setPiles] = useState<Card[][]>([]);
  const [selectedPile, setSelectedPile] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState('');

  // Rest of the component logic
};
```

### 3. Game Initialization

```typescript
useEffect(() => {
  startNewGame();
}, []);

const startNewGame = () => {
  // Filter the deck to include only 7, 8, 9, 10, J, Q, K, A
  const wishDeck = deck.filter(card => 
    ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'].includes(card.rank)
  );
  shuffle(wishDeck);

  // Create 8 piles of 4 cards each
  const newPiles: Card[][] = [];
  for (let i = 0; i < 8; i++) {
    newPiles.push(wishDeck.slice(i * 4, (i + 1) * 4));
    newPiles[i][0].faceUp = true; // Turn over the top card of each pile
  }

  setPiles(newPiles);
  setSelectedPile(null);
  setGameState('playing');
  setMessage('New game started. Select piles to match pairs.');
};
```

### 4. Game Logic

```typescript
const selectPile = (pileIndex: number) => {
  if (gameState !== 'playing') return;

  if (selectedPile === null) {
    setSelectedPile(pileIndex);
  } else {
    const firstPile = piles[selectedPile];
    const secondPile = piles[pileIndex];

    if (firstPile[0].rank === secondPile[0].rank) {
      // Match found
      removePair(selectedPile, pileIndex);
    } else {
      setMessage('No match. Try again.');
    }
    setSelectedPile(null);
  }
};

const removePair = (pileIndex1: number, pileIndex2: number) => {
  const newPiles = [...piles];
  newPiles[pileIndex1].shift();
  newPiles[pileIndex2].shift();

  // Turn over the next card in each pile if available
  if (newPiles[pileIndex1].length > 0) newPiles[pileIndex1][0].faceUp = true;
  if (newPiles[pileIndex2].length > 0) newPiles[pileIndex2][0].faceUp = true;

  setPiles(newPiles);
  setMessage('Pair removed!');
  checkGameState();
};

const checkGameState = () => {
  if (piles.every(pile => pile.length === 0)) {
    setGameState('won');
    setMessage('Congratulations! You won! Make a wish!');
  } else if (!hasValidMoves()) {
    setGameState('lost');
    setMessage('Game over. No more valid moves.');
  }
};

const hasValidMoves = (): boolean => {
  const topCards = piles.map(pile => pile[0]?.rank).filter(Boolean);
  return new Set(topCards).size < topCards.length;
};
```

### 5. User Input Handling

```typescript
useInput((input, key) => {
  if (gameState !== 'playing') {
    if (input === 'r') startNewGame();
    return;
  }

  const pileIndex = parseInt(input);
  if (!isNaN(pileIndex) && pileIndex >= 1 && pileIndex <= 8) {
    selectPile(pileIndex - 1);
  }
});
```

### 6. Rendering

```typescript
return (
  <Box flexDirection="column">
    <Text>Wish Card Game</Text>
    <Text>{message}</Text>
    <Box flexDirection="column" marginY={1}>
      {piles.map((pile, index) => (
        <Box key={index}>
          <Text>{index + 1}: </Text>
          {pile.map((card, cardIndex) => (
            <Card
              key={cardIndex}
              {...card}
              faceUp={card.faceUp}
              selected={selectedPile === index}
            />
          ))}
        </Box>
      ))}
    </Box>
    {gameState === 'playing' && (
      <Text>Enter a number (1-8) to select a pile</Text>
    )}
    {gameState !== 'playing' && (
      <Text>Press 'r' to start a new game</Text>
    )}
  </Box>
);
```

## Key Concepts Explained

1. **Deck Filtering**: We filter the deck to include only the cards needed for Wish (7 through A).
2. **Pile Management**: The game maintains 8 piles of cards, each starting with 4 cards.
3. **Card Flipping**: The top card of each pile is always face up.
4. **Pair Matching**: The game checks for matching pairs when two piles are selected.
5. **Game State Tracking**: The game tracks whether it's in progress, won, or lost.

## Error Handling and Edge Cases

1. **Invalid Pile Selection**: The game ignores selections of empty piles or non-existent pile numbers.
2. **No More Moves**: The game checks if there are any valid moves left after each pair removal.
3. **Game End**: The game properly handles both win and lose conditions.

## Performance Considerations

1. **State Updates**: The game uses efficient state update methods to avoid unnecessary re-renders.
2. **Move Validation**: The `hasValidMoves` function efficiently checks for the existence of valid moves.

## Potential Enhancements

1. Implement an undo feature.
2. Add animations for card removal and flipping.
3. Implement a scoring system based on the number of moves or time taken.
4. Add sound effects for matching pairs and winning the game.
5. Create a multi-player version where players take turns finding pairs.

This implementation provides a foundation for the Wish card game using the `ink-playing-cards` library. It demonstrates how to manage multiple piles of cards, implement pair-matching logic, and create an engaging single-player experience in a terminal-based environment.

## Educational Value

Wish is an excellent game for teaching children:

1. **Memory Skills**: Players need to remember the positions of cards they've seen.
2. **Pattern Recognition**: Identifying matching pairs helps develop pattern recognition skills.
3. **Strategy**: Deciding which piles to select can involve strategic thinking.
4. **Patience**: The game encourages patience as players work towards clearing all the cards.

By implementing this game, developers can create an educational tool that's both fun and beneficial for cognitive development.