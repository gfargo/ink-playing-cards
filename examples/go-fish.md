# Implementing Go Fish with ink-playing-cards

This guide demonstrates how to create a Go Fish game using the `ink-playing-cards` library and the `ink` library for terminal-based rendering.

## Game Overview

Go Fish is a card game typically played by 2-5 players. The goal is to collect the most sets of four cards of the same rank. Players take turns asking each other for cards to complete their sets.

## Key Concepts

1. **DeckProvider**: Manages the deck state.
2. **useDeck Hook**: Provides deck operations like `shuffle` and `draw`.
3. **Card Component**: Renders individual cards.
4. **Game State Management**: Manages player hands, current player, and score.
5. **Turn-based Gameplay**: Alternates turns between players.
6. **Set Collection**: Tracks and manages sets of four cards.
7. **AI Logic**: Implements simple AI for computer opponents.

## Implementation

### 1. Setup and Imports

```typescript
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { DeckProvider, useDeck, Card } from 'ink-playing-cards';

const GoFishGame: React.FC = () => {
  // Component logic will go here
};

const App: React.FC = () => (
  <DeckProvider>
    <GoFishGame />
  </DeckProvider>
);

export default App;
```

### 2. Game State

```typescript
const GoFishGame: React.FC = () => {
  const { deck, shuffle, draw } = useDeck();
  const [players, setPlayers] = useState<{ hand: Card[], sets: string[] }[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);

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
  const numPlayers = 4;
  const newPlayers = Array(numPlayers).fill(null).map(() => ({
    hand: draw(7),
    sets: []
  }));
  setPlayers(newPlayers);
  setCurrentPlayer(0);
  setMessage('Game started. Player 1\'s turn.');
  setGameOver(false);
};
```

### 4. Game Logic

```typescript
const askForCard = (askingPlayer: number, askedPlayer: number, rank: string) => {
  const askedPlayerHand = players[askedPlayer].hand;
  const matchingCards = askedPlayerHand.filter(card => card.rank === rank);

  if (matchingCards.length > 0) {
    // Transfer matching cards
    const newPlayers = [...players];
    newPlayers[askingPlayer].hand.push(...matchingCards);
    newPlayers[askedPlayer].hand = askedPlayerHand.filter(card => card.rank !== rank);
    setPlayers(newPlayers);
    setMessage(`Player ${askingPlayer + 1} got ${matchingCards.length} ${rank}(s) from Player ${askedPlayer + 1}`);
    checkForSet(askingPlayer, rank);
  } else {
    // Go fish
    const drawnCard = draw(1)[0];
    const newPlayers = [...players];
    newPlayers[askingPlayer].hand.push(drawnCard);
    setPlayers(newPlayers);
    setMessage(`Go Fish! Player ${askingPlayer + 1} drew a card`);
    if (drawnCard.rank === rank) {
      checkForSet(askingPlayer, rank);
    } else {
      nextTurn();
    }
  }
};

const checkForSet = (playerIndex: number, rank: string) => {
  const playerHand = players[playerIndex].hand;
  const matchingCards = playerHand.filter(card => card.rank === rank);

  if (matchingCards.length === 4) {
    const newPlayers = [...players];
    newPlayers[playerIndex].sets.push(rank);
    newPlayers[playerIndex].hand = playerHand.filter(card => card.rank !== rank);
    setPlayers(newPlayers);
    setMessage(`Player ${playerIndex + 1} completed a set of ${rank}s!`);
    checkForGameEnd();
  }
};

const nextTurn = () => {
  setCurrentPlayer((currentPlayer + 1) % players.length);
  setMessage(`Player ${((currentPlayer + 1) % players.length) + 1}'s turn`);
};

const checkForGameEnd = () => {
  if (players.every(player => player.hand.length === 0) || deck.cards.length === 0) {
    setGameOver(true);
    const winnerIndex = players.reduce((maxIndex, player, index, arr) => 
      player.sets.length > arr[maxIndex].sets.length ? index : maxIndex
    , 0);
    setMessage(`Game Over! Player ${winnerIndex + 1} wins with ${players[winnerIndex].sets.length} sets!`);
  }
};
```

### 5. AI Logic

```typescript
const playAI = () => {
  const aiPlayer = players[currentPlayer];
  const targetPlayer = (currentPlayer + 1) % players.length; // Simple AI always asks the next player
  const rankToAsk = aiPlayer.hand[Math.floor(Math.random() * aiPlayer.hand.length)].rank;
  
  askForCard(currentPlayer, targetPlayer, rankToAsk);
};
```

### 6. User Input Handling

```typescript
useInput((input, key) => {
  if (gameOver || currentPlayer !== 0) return; // Only handle input for human player and when game is not over

  if (input === 'p') {
    // Show possible ranks to ask for
    const possibleRanks = [...new Set(players[0].hand.map(card => card.rank))];
    setMessage(`Possible ranks to ask for: ${possibleRanks.join(', ')}`);
  } else if (/^[2-9JQKA]$/.test(input.toUpperCase())) {
    // Ask for a card
    const targetPlayer = 1; // For simplicity, always ask the second player
    askForCard(0, targetPlayer, input.toUpperCase());
  }
});
```

### 7. Rendering

```typescript
return (
  <Box flexDirection="column">
    <Text>Go Fish</Text>
    <Text>Current Player: {currentPlayer + 1}</Text>
    <Text>{message}</Text>
    {players.map((player, index) => (
      <Box key={index} flexDirection="column" marginY={1}>
        <Text>Player {index + 1} (Sets: {player.sets.length})</Text>
        <Box>
          {player.hand.map((card, cardIndex) => (
            <Card key={cardIndex} {...card} faceUp={index === 0} />
          ))}
        </Box>
      </Box>
    ))}
    {!gameOver && currentPlayer === 0 && (
      <Text>Press 'p' to see possible ranks, or enter a rank to ask for a card</Text>
    )}
    {gameOver && (
      <Text>Press 'n' to start a new game</Text>
    )}
  </Box>
);
```

## Key Concepts

1. **Set Collection**: Players aim to collect sets of four cards of the same rank.
2. **Turn-based Gameplay**: Players take turns asking each other for cards.
3. **Go Fish Mechanic**: When a player doesn't have the requested card, the asking player draws from the deck.
4. **AI Decision Making**: Simple AI logic chooses which card to ask for.

## Error Handling and Edge Cases

1. **Empty Deck**: Handle situations where the deck runs out of cards.
2. **Player with No Cards**: Handle cases where a player runs out of cards but the game continues.
3. **Invalid Input**: Ensure that only valid ranks can be asked for.

## Performance Considerations

1. **Hand Management**: Optimize the management of player hands and sets for larger games.
2. **State Updates**: Use efficient state update methods to avoid unnecessary re-renders.

## Potential Enhancements

1. Implement more sophisticated AI strategies.
2. Add support for different numbers of players.
3. Implement a scoring system for multiple rounds.
4. Add animations for card transfers between players.
5. Implement a tournament mode with multiple games.

This implementation provides a foundation for a Go Fish game using the `ink-playing-cards` library. It demonstrates turn-based gameplay, set collection mechanics, and simple AI opponents in a terminal-based environment.