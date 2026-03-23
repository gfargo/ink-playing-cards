# War

A two-player War card game using `ink-playing-cards` and Ink.

## Overview

Each player reveals their top card. Higher card wins both. Ties trigger a "war" — three face-down cards plus one face-up decider.

## Implementation

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  Card,
  type TCard,
  isStandardCard,
} from 'ink-playing-cards'

// Card value for comparison (2=2, ..., A=14)
const cardRank = (card: TCard): number => {
  if (!isStandardCard(card)) return 0
  const ranks: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, '10': 10, J: 11, Q: 12, K: 13, A: 14,
  }
  return ranks[card.value] ?? 0
}

const WarGame = () => {
  const { deck, shuffle, deal, hands } = useDeck()
  const [p1Card, setP1Card] = useState<TCard | null>(null)
  const [p2Card, setP2Card] = useState<TCard | null>(null)
  const [p1Pile, setP1Pile] = useState<TCard[]>([])
  const [p2Pile, setP2Pile] = useState<TCard[]>([])
  const [message, setMessage] = useState('Press space to play')
  const [gameOver, setGameOver] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    shuffle()
    deal(26, ['p1', 'p2'])
    setInitialized(true)
  }, [])

  // Once dealt, copy hands into local piles for game logic
  useEffect(() => {
    if (!initialized) return
    const h1 = hands['p1'] ?? []
    const h2 = hands['p2'] ?? []
    if (h1.length > 0 && p1Pile.length === 0) {
      setP1Pile([...h1])
      setP2Pile([...h2])
    }
  }, [hands, initialized])

  const playRound = () => {
    if (p1Pile.length === 0 || p2Pile.length === 0) {
      setGameOver(true)
      setMessage(p1Pile.length > 0 ? 'Player 1 wins!' : 'Player 2 wins!')
      return
    }

    const c1 = p1Pile[0]
    const c2 = p2Pile[0]
    const rest1 = p1Pile.slice(1)
    const rest2 = p2Pile.slice(1)
    setP1Card(c1)
    setP2Card(c2)

    const r1 = cardRank(c1)
    const r2 = cardRank(c2)

    if (r1 > r2) {
      setP1Pile([...rest1, c1, c2])
      setP2Pile(rest2)
      setMessage('Player 1 wins the round!')
    } else if (r2 > r1) {
      setP1Pile(rest1)
      setP2Pile([...rest2, c1, c2])
      setMessage('Player 2 wins the round!')
    } else {
      // War: take up to 3 face-down + 1 face-up
      const warCount = Math.min(4, rest1.length, rest2.length)
      if (warCount === 0) {
        setGameOver(true)
        setMessage('War with no cards left — draw!')
        return
      }

      const war1 = rest1.slice(0, warCount)
      const war2 = rest2.slice(0, warCount)
      const after1 = rest1.slice(warCount)
      const after2 = rest2.slice(warCount)
      const wr1 = cardRank(war1[war1.length - 1])
      const wr2 = cardRank(war2[war2.length - 1])

      if (wr1 >= wr2) {
        setP1Pile([...after1, c1, c2, ...war1, ...war2])
        setP2Pile(after2)
        setMessage('War! Player 1 wins!')
      } else {
        setP1Pile(after1)
        setP2Pile([...after2, c1, c2, ...war1, ...war2])
        setMessage('War! Player 2 wins!')
      }
    }
  }

  useInput((input) => {
    if (input === ' ' && !gameOver) playRound()
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>War</Text>
      <Text>P1: {p1Pile.length} cards | P2: {p2Pile.length} cards</Text>
      <Box gap={2}>
        <Box flexDirection="column">
          <Text>Player 1:</Text>
          {p1Card && isStandardCard(p1Card) ? (
            <Card id={p1Card.id} suit={p1Card.suit} value={p1Card.value} faceUp variant="simple" />
          ) : null}
        </Box>
        <Box flexDirection="column">
          <Text>Player 2:</Text>
          {p2Card && isStandardCard(p2Card) ? (
            <Card id={p2Card.id} suit={p2Card.suit} value={p2Card.value} faceUp variant="simple" />
          ) : null}
        </Box>
      </Box>
      <Text>{message}</Text>
      {!gameOver && <Text>[space] Play round</Text>}
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

## Key Concepts

- `deal(26, ['p1', 'p2'])` splits the deck evenly between two players
- Game logic uses local state (`p1Pile`, `p2Pile`) for card manipulation since War requires direct array operations
- `cardRank()` converts card values to numeric ranks for comparison
- `isStandardCard()` type guard ensures safe access to `suit` and `value`
