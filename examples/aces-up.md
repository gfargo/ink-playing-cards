# Implementing Aces Up! with ink-playing-cards

This guide demonstrates how to create the Aces Up! card game using the `ink-playing-cards` library and the `ink` library for terminal-based rendering.

## Game Overview

Aces Up! is a solitaire card game where the goal is to discard all cards except for the four Aces. It's a compact game that's perfect for quick plays and requires strategic thinking.

## Game Rules

1. Deal 4 cards face up in a row from a standard 52-card deck.
2. The remaining cards form the draw pile.
3. If there are two or more cards of the same suit visible, discard all but the highest-ranked card of that suit.
4. Aces are high, followed by King, Queen, Jack, then 10 through 2.
5. Move cards to empty spaces to make cards beneath them available.
6. When no more moves are possible, deal one card on top of each of the four piles.
7. Repeat steps 3-6 until the draw pile is empty and no more moves are possible.
8. The game is won if only the four Aces remain at the end.

## Key Concepts

1. **DeckProvider**: Manages the deck state.
2. **useDeck Hook**: Provides deck operations like `shuffle` and `draw`.
3. **Card Component**: Renders individual cards.
4. **Pile Management**: Manages the four piles and the foundation (discard) pile.
5. **Move Validation**: Checks if a card can be discarded or moved.
6. **Game State Tracking**: Monitors the game progress and checks for win/lose conditions.

## Implementation

### 1. Setup and Imports

```typescript
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { DeckProvider, useDeck, Card } from 'ink-playing-cards';

const AcesUpGame: React.FC = () => {
  // Component logic will go here
};

const App: React.FC = () => (
  <DeckProvider>
    <AcesUpGame />
  </DeckProvider>
);

export default App;
```

### 2. Game State

```typescript
const AcesUpGame: React.FC = () => {
  const { deck, shuffle, draw } = useDeck();
  const [piles, setPiles] = useState<Card[][]>([[], [], [], []]);
  const [drawPile, setDrawPile] = useState<Card[]>([]);
  const [foundation, setFoundation] = useState<Card[]>([]);
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
  shuffle();
  const initialCards = draw(4);
  const newPiles = initialCards.map(card => [card]);
  setPiles(newPiles);
  setDrawPile(deck.slice(4));
  setFoundation([]);
  setSelectedPile(null);
  setGameState('playing');
  setMessage('New game started. Select piles to discard or move cards.');
};
```

### 4. Game Logic

```typescript
const selectPile = (pileIndex: number) => {
  if (gameState !== 'playing') return;

  if (selectedPile === null) {
    setSelectedPile(pileIndex);
  } else {
    if (piles[pileIndex].length === 0) {
      moveToPile(selectedPile, pileIndex);
    } else {
      setSelectedPile(pileIndex);
    }
  }
};

const moveToPile = (fromIndex: number, toIndex: number) => {
  if (piles[fromIndex].length === 0) return;

  const newPiles = [...piles];
  const movedCard = newPiles[fromIndex].pop()!;
  newPiles[toIndex].push(movedCard);
  setPiles(newPiles);
  setSelectedPile(null);
  setMessage('Card moved successfully.');
  checkForDiscards();
};

const discardCard = (pileIndex: number) => {
  const card = piles[pileIndex][piles[pileIndex].length - 1];
  if (canDiscard(card)) {
    const newPiles = [...piles];
    const discardedCard = newPiles[pileIndex].pop()!;
    setFoundation([...foundation, discardedCard]);
    setPiles(newPiles);
    setMessage('Card discarded successfully.');
    checkForDiscards();
  } else {
    setMessage('Cannot discard this card.');
  }
};

const canDiscard = (card: Card): boolean => {
  return piles.some(pile => {
    const topCard = pile[pile.length - 1];
    return topCard && topCard.suit === card.suit && compareRanks(topCard.rank, card.rank) > 0;
  });
};

const compareRanks = (rank1: string, rank2: string): number => {
  const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  return rankOrder.indexOf(rank1) - rankOrder.indexOf(rank2);
};

const checkForDiscards = () => {
  let discardMade = false;
  const newPiles = piles.map(pile => {
    if (pile.length === 0) return pile;
    const topCard = pile[pile.length - 1];
    if (canDiscard(topCard)) {
      discardMade = true;
      setFoundation([...foundation, topCard]);
      return pile.slice(0, -1);
    }
    return pile;
  });

  if (discardMade) {
    setPiles(newPiles);
    setMessage('Automatic discards made.');
    checkForDiscards(); // Recursively check for more discards
  } else {
    checkGameState();
  }
};

const dealCards = () => {
  if (drawPile.length === 0) {
    setMessage('No more cards to deal.');
    return;
  }

  const newPiles = piles.map((pile, index) => {
    if (drawPile[index]) {
      return [...pile, drawPile[index]];
    }
    return pile;
  });

  setPiles(newPiles);
  setDrawPile(drawPile.slice(4));
  checkForDiscards();
};

const checkGameState = () => {
  if (drawPile.length === 0 && piles.every(pile => pile.length === 0 || (pile.length === 1 && pile[0].rank === 'A'))) {
    setGameState('won');
    setMessage('Congratulations! You won!');
  } else if (drawPile.length === 0 && !canMakeAnyMove()) {
    setGameState('lost');
    setMessage('Game over. No more moves possible.');
  }
};

const canMakeAnyMove = (): boolean => {
  return piles.some((pile, index) => 
    pile.length > 0 && (canDiscard(pile[pile.length - 1]) || piles.some((_, emptyIndex) => piles[emptyIndex].length === 0 && emptyIndex !== index))
  );
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
  if (!isNaN(pileIndex) && pileIndex >= 1 && pileIndex <= 4) {
    selectPile(pileIndex - 1);
  } else if (input === 'd') {
    discardCard(selectedPile!);
  } else if (input === 'n') {
    dealCards();
  }
});
```

### 6. Rendering

```typescript
return (
  <Box flexDirection="column">
    <Text>Aces Up!</Text>
    <Text>{message}</Text>
    <Box flexDirection="row" marginY={1}>
      {piles.map((pile, index) => (
        <Box key={index} marginRight={1} flexDirection="column">
          <Text>{index + 1}</Text>
          {pile.map((card, cardIndex) => (
            <Card
              key={cardIndex}
              {...card}
              faceUp={true}
              selected={selectedPile === index && cardIndex === pile.length - 1}
            />
          ))}
        </Box>
      ))}
    </Box>
    <Text>Draw Pile: {drawPile.length} cards</Text>
    <Text>Foundation: {foundation.length} cards</Text>
    {gameState === 'playing' && (
      <Text>
        Enter 1-4 to select a pile, 'd' to discard selected card, 'n' to deal new cards
      </Text>
    )}
    {gameState !== 'playing' && (
      <Text>Press 'r' to start a new game</Text>
    )}
  </Box>
);
```

## Key Concepts Explained

1. **Pile Management**: The game maintains four piles of cards, a draw pile, and a foundation (discard) pile.
2. **Move Validation**: The `canDiscard` function checks if a card can be discarded based on the game rules.
3. **Automatic Discards**: After each move, the game automatically discards any cards that can be removed.
4. **Game State Tracking**: The game checks for win/lose conditions after each move or deal.

## Error Handling and Edge Cases

1. **Empty Piles**: The game handles attempts to move cards to/from empty piles.
2. **Invalid Discards**: The game prevents discarding cards that don't meet the criteria.
3. **End Game**: The game correctly identifies when no more moves are possible.

## Performance Considerations

1. **Efficient State Updates**: The game uses immutable state updates to trigger re-renders only when necessary.
2. **Recursive Discards**: The `checkForDiscards` function recursively checks for and performs all possible discards.

## Potential Enhancements

1. Implement an undo feature.
2. Add animations for card movements and discards.
3. Implement a scoring system based on the number of moves or remaining cards.
4. Add sound effects for card movements and game completion.
5. Create a hint system to suggest possible moves.
6. Implement different difficulty levels by changing the discard rules.

This implementation provides a foundation for the Aces Up! card game using the `ink-playing-cards` library. It demonstrates how to manage multiple card piles, implement complex game rules, and create an engaging single-player experience in a terminal-based environment.

## Educational Value

Aces Up! is an excellent game for developing:

1. **Strategic Thinking**: Players must plan their moves carefully to maximize card removal.
2. **Pattern Recognition**: Identifying suits and ranks quickly is crucial for efficient play.
3. **Decision Making**: Choosing between moving cards and discarding requires weighing different options.
4. **Probability Assessment**: As the game progresses, players can make educated guesses about remaining cards.

By implementing this game, developers can learn about managing complex game states, implementing rule-based systems, and creating engaging single-player experiences in a terminal environment.