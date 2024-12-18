# Implementing Klondike Solitaire with ink-playing-cards

This guide demonstrates how to create a single-player Klondike Solitaire game using the `ink-playing-cards` library and the `ink` library for terminal-based rendering.

## Game Overview

Klondike Solitaire is a classic single-player card game. The objective is to build up four foundation piles from Ace to King for each suit, using cards from the tableau and the stock pile.

## Key Concepts

Before we dive into the implementation, let's review some key concepts:

1. **DeckProvider**: A context provider from `ink-playing-cards` that manages the deck state.
2. **useDeck Hook**: A custom hook that gives us access to deck operations like `shuffle` and `draw`.
3. **Card Component**: Used to render individual cards in various game areas.
4. **Game State Management**: We'll use React's `useState` to manage the game state, including tableau, foundation, stock, and waste piles.
5. **Side Effects**: We'll use `useEffect` for game initialization.
6. **User Input Handling**: We'll use Ink's `useInput` hook to handle player actions.
7. **Conditional Rendering**: We'll use conditional rendering to display different UI elements based on the game state.

## Implementation

### 1. Setup and Imports

```typescript
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { DeckProvider, useDeck, Card } from 'ink-playing-cards';

const KlondikeSolitaire: React.FC = () => {
  // Component logic will go here
};

const App: React.FC = () => (
  <DeckProvider>
    <KlondikeSolitaire />
  </DeckProvider>
);

export default App;
```

### 2. Game State

```typescript
const KlondikeSolitaire: React.FC = () => {
  const { deck, shuffle, draw } = useDeck();
  const [tableau, setTableau] = useState<Card[][]>([]);
  const [foundation, setFoundation] = useState<Card[][]>([[], [], [], []]);
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<{ pile: string; index: number } | null>(null);
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
  const newTableau: Card[][] = [];
  for (let i = 0; i < 7; i++) {
    newTableau.push(draw(i + 1));
    newTableau[i][newTableau[i].length - 1].faceUp = true;
  }
  setTableau(newTableau);
  setStock(draw(24));
  setWaste([]);
  setFoundation([[], [], [], []]);
  setMessage('Use arrow keys to navigate, space to select/deselect, Enter to move');
};
```

### 4. Core Game Logic

```typescript
const isValidMove = (card: Card, destination: 'tableau' | 'foundation', index: number): boolean => {
  if (destination === 'tableau') {
    const targetPile = tableau[index];
    if (targetPile.length === 0) {
      return card.rank === 'K';
    }
    const targetCard = targetPile[targetPile.length - 1];
    return (
      (card.color === 'red' ? targetCard.color === 'black' : targetCard.color === 'red') &&
      card.value === targetCard.value - 1
    );
  } else {
    const targetPile = foundation[index];
    if (targetPile.length === 0) {
      return card.rank === 'A';
    }
    const targetCard = targetPile[targetPile.length - 1];
    return card.suit === targetCard.suit && card.value === targetCard.value + 1;
  }
};

const moveCard = (from: { pile: string; index: number }, to: { pile: string; index: number }) => {
  let sourceCards: Card[];
  if (from.pile === 'tableau') {
    sourceCards = tableau[from.index].slice(from.index);
    setTableau(tableau.map((pile, i) => 
      i === from.index ? pile.slice(0, from.index) : pile
    ));
  } else if (from.pile === 'waste') {
    sourceCards = [waste[waste.length - 1]];
    setWaste(waste.slice(0, -1));
  } else {
    return; // Invalid source
  }

  if (to.pile === 'tableau') {
    setTableau(tableau.map((pile, i) => 
      i === to.index ? [...pile, ...sourceCards] : pile
    ));
  } else if (to.pile === 'foundation') {
    setFoundation(foundation.map((pile, i) => 
      i === to.index ? [...pile, ...sourceCards] : pile
    ));
  }

  // Flip the top card of the source tableau pile if it's face down
  if (from.pile === 'tableau' && tableau[from.index].length > 0) {
    const newTableau = [...tableau];
    newTableau[from.index][newTableau[from.index].length - 1].faceUp = true;
    setTableau(newTableau);
  }
};

const drawFromStock = () => {
  if (stock.length === 0) {
    setStock(waste.reverse());
    setWaste([]);
  } else {
    const drawnCards = stock.slice(-3).reverse();
    setStock(stock.slice(0, -3));
    setWaste([...waste, ...drawnCards]);
  }
};
```

### 5. User Input Handling

```typescript
useInput((input, key) => {
  if (key.leftArrow) {
    // Move selection left
  } else if (key.rightArrow) {
    // Move selection right
  } else if (key.upArrow) {
    // Move selection up
  } else if (key.downArrow) {
    // Move selection down
  } else if (input === ' ') {
    // Select/deselect card
  } else if (key.return) {
    // Attempt to move selected card
  } else if (input === 'd') {
    drawFromStock();
  }
});
```

### 6. Rendering

```typescript
return (
  <Box flexDirection="column">
    <Text>Klondike Solitaire</Text>
    <Box>
      <Text>Stock: </Text>
      {stock.length > 0 && <Card {...stock[stock.length - 1]} faceUp={false} />}
      <Text>Waste: </Text>
      {waste.length > 0 && <Card {...waste[waste.length - 1]} />}
    </Box>
    <Box>
      <Text>Foundation: </Text>
      {foundation.map((pile, index) => (
        <Box key={index} marginRight={1}>
          {pile.length > 0 ? (
            <Card {...pile[pile.length - 1]} />
          ) : (
            <Box width={6} height={4} borderStyle="single" />
          )}
        </Box>
      ))}
    </Box>
    <Text>Tableau:</Text>
    {tableau.map((pile, pileIndex) => (
      <Box key={pileIndex}>
        {pile.map((card, cardIndex) => (
          <Card
            key={cardIndex}
            {...card}
            faceUp={card.faceUp}
            selected={selectedCard?.pile === 'tableau' && selectedCard.index === pileIndex}
          />
        ))}
      </Box>
    ))}
    <Text>{message}</Text>
  </Box>
);
```

## Key Concepts

1. **Multiple Card Piles**: Klondike Solitaire requires managing multiple card piles (tableau, foundation, stock, waste) simultaneously.
2. **Face-up and Face-down Cards**: The game involves both face-up and face-down cards, requiring careful state management.
3. **Complex Move Validation**: Validating moves in Klondike Solitaire is more complex than in simpler card games, involving checking card colors, suits, and ranks.
4. **Stock and Waste Pile Mechanics**: The game involves a unique mechanic of drawing cards from the stock to the waste pile, and recycling the waste pile when the stock is empty.

## Error Handling and Edge Cases

1. **Empty Stock and Waste**: Handle the case where both the stock and waste piles are empty.
2. **Invalid Moves**: Ensure that only valid moves are allowed, including moves between tableau piles and to foundation piles.
3. **Winning Condition**: Implement a check for when all cards are moved to the foundation piles, signaling a win.
4. **Stuck Game State**: Consider implementing a check for when no more moves are possible.

## Performance Considerations

1. **Memoization**: Use React's `useMemo` or `useCallback` hooks to optimize rendering performance, especially for complex calculations like valid move checks.
2. **Efficient State Updates**: When moving cards between piles, use efficient state update methods to avoid unnecessary re-renders.
3. **Lazy Initialization**: Use lazy initialization for the initial game setup to improve the initial render time.

## Potential Enhancements

1. Implement an undo feature.
2. Add a scoring system.
3. Implement different difficulty levels (e.g., draw one card instead of three from the stock).
4. Add animations for card movements.
5. Implement a hint system to suggest possible moves.

This implementation provides a solid foundation for a Klondike Solitaire game using the `ink-playing-cards` library. It demonstrates how to manage complex game states, handle user input, and implement game-specific logic in a terminal-based environment.