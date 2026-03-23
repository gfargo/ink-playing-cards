# Memory / Concentration

A card matching game using `ink-playing-cards` with `CardGrid` for the board layout.

## Overview

Cards are laid face-down in a grid. Flip two cards per turn — if they match (same value), they stay face-up. Find all pairs to win.

## Implementation

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  Card,
  createPairedDeck,
  isStandardCard,
  type TCard,
} from 'ink-playing-cards'

const ROWS = 4
const COLS = 4
const TOTAL_PAIRS = (ROWS * COLS) / 2

const MemoryGame = () => {
  const { shuffle } = useDeck()
  const [grid, setGrid] = useState<TCard[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [cursor, setCursor] = useState(0)
  const [moves, setMoves] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Create a paired deck and take just enough cards for the grid
    const pairs = createPairedDeck()
    const cards = pairs.slice(0, ROWS * COLS)
    setGrid(cards)
    setMessage('Arrow keys to move, space to flip')
  }, [])

  const getCardValue = (card: TCard): string =>
    isStandardCard(card) ? card.value : card.id

  const handleFlip = () => {
    if (flipped.length >= 2) return
    if (flipped.includes(cursor)) return
    if (matched.has(grid[cursor]?.id)) return

    const newFlipped = [...flipped, cursor]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = newFlipped
      const cardA = grid[a]
      const cardB = grid[b]

      if (getCardValue(cardA) === getCardValue(cardB)) {
        // Match found
        setMatched((prev) => new Set([...prev, cardA.id, cardB.id]))
        setFlipped([])
        setMessage('Match!')

        // Check win
        if (matched.size + 2 >= ROWS * COLS) {
          setMessage(`You win in ${moves + 1} moves!`)
        }
      } else {
        // No match — flip back after delay
        setMessage('No match')
        setTimeout(() => {
          setFlipped([])
          setMessage('')
        }, 1200)
      }
    }
  }

  useInput((input, key) => {
    if (flipped.length >= 2) return

    if (key.leftArrow) setCursor((c) => Math.max(0, c - 1))
    if (key.rightArrow) setCursor((c) => Math.min(grid.length - 1, c + 1))
    if (key.upArrow) setCursor((c) => Math.max(0, c - COLS))
    if (key.downArrow) setCursor((c) => Math.min(grid.length - 1, c + COLS))
    if (input === ' ') handleFlip()
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Memory — Moves: {moves} | Matched: {matched.size / 2}/{TOTAL_PAIRS}</Text>
      <Box flexDirection="column">
        {Array.from({ length: ROWS }, (_, row) => (
          <Box key={row} gap={1}>
            {Array.from({ length: COLS }, (_, col) => {
              const idx = row * COLS + col
              const card = grid[idx]
              if (!card || !isStandardCard(card)) return null
              const isFaceUp = flipped.includes(idx) || matched.has(card.id)
              const isSelected = cursor === idx
              return (
                <Card
                  key={card.id}
                  id={card.id}
                  suit={card.suit}
                  value={card.value}
                  faceUp={isFaceUp}
                  selected={isSelected}
                  variant="simple"
                />
              )
            })}
          </Box>
        ))}
      </Box>
      <Text>{message}</Text>
      <Text dimColor>Arrow keys to move, space to flip</Text>
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <MemoryGame />
  </DeckProvider>
)

export default App
```

## Key Concepts

- `createPairedDeck()` generates cards in pairs — perfect for Memory
- Each card has a unique `id` for tracking matched state
- `isStandardCard(card)` type guard for safe access to `suit` and `value`
- Individual `Card` components (not `CardGrid`) for per-card `faceUp` and `selected` control
- `selected` prop highlights the cursor position with a double border
- Local state manages flipped/matched cards — the DeckProvider just provides the initial deck
