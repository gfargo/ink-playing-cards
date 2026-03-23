# Golf Card Game

A two-player Golf card game (player vs AI) using `ink-playing-cards` and Ink.

## Rules

1. Each player gets 6 cards face down in a 2×3 grid.
2. One card starts the discard pile; the rest form the draw pile.
3. Players peek at their bottom two cards at the start.
4. On each turn, draw from the draw pile or discard pile, then either replace a grid card or discard.
5. Matching pairs in a column cancel out (0 points).
6. Round ends when one player has all cards face up.
7. Scoring: A=1, 2-10=face value, J/Q/K=10.

## Implementation

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  Card,
  createStandardDeck,
  type TCard,
  isStandardCard,
} from 'ink-playing-cards'

type GridCard = { card: TCard; faceUp: boolean }

const scoreCard = (card: TCard): number => {
  if (!isStandardCard(card)) return 0
  if (card.value === 'A') return 1
  if (['J', 'Q', 'K'].includes(card.value)) return 10
  return Number.parseInt(card.value, 10)
}

const scoreGrid = (grid: (GridCard | null)[]): number =>
  grid.reduce((sum, cell) => sum + (cell ? scoreCard(cell.card) : 0), 0)

const GolfGame = () => {
  const [playerGrid, setPlayerGrid] = useState<(GridCard | null)[]>([])
  const [aiGrid, setAiGrid] = useState<(GridCard | null)[]>([])
  const [drawPile, setDrawPile] = useState<TCard[]>([])
  const [discardPile, setDiscardPile] = useState<TCard[]>([])
  const [drawn, setDrawn] = useState<TCard | null>(null)
  const [turn, setTurn] = useState<'player' | 'ai'>('player')
  const [phase, setPhase] = useState<'peek' | 'play' | 'over'>('peek')
  const [peekCount, setPeekCount] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const cards = createStandardDeck()
    const pGrid = cards.slice(0, 6).map((c) => ({ card: c, faceUp: false }))
    const aGrid = cards.slice(6, 12).map((c) => ({ card: c, faceUp: false }))
    setPlayerGrid(pGrid)
    setAiGrid(aGrid)
    setDiscardPile([cards[12]])
    setDrawPile(cards.slice(13))
    setPhase('peek')
    setPeekCount(0)
    setMessage('Peek at 2 of your cards (press 1-6).')
  }, [])

  const peek = (idx: number) => {
    if (phase !== 'peek' || idx < 0 || idx > 5) return
    if (playerGrid[idx]?.faceUp) return
    const next = [...playerGrid]
    next[idx] = { ...next[idx]!, faceUp: true }
    setPlayerGrid(next)
    const count = peekCount + 1
    setPeekCount(count)
    if (count >= 2) {
      setPhase('play')
      setMessage('[d] draw from pile, [p] take from discard.')
    }
  }

  const drawFromPile = () => {
    if (drawn || drawPile.length === 0) return
    setDrawn(drawPile[0])
    setDrawPile(drawPile.slice(1))
    setMessage('Press 1-6 to replace a card, or [x] to discard.')
  }

  const takeFromDiscard = () => {
    if (drawn || discardPile.length === 0) return
    setDrawn(discardPile[discardPile.length - 1])
    setDiscardPile(discardPile.slice(0, -1))
    setMessage('Press 1-6 to replace a card, or [x] to discard.')
  }

  const replaceCard = (idx: number) => {
    if (!drawn || idx < 0 || idx > 5) return
    const old = playerGrid[idx]
    const next = [...playerGrid]
    next[idx] = { card: drawn, faceUp: true }
    setPlayerGrid(next)
    if (old) setDiscardPile([...discardPile, old.card])
    setDrawn(null)
    checkColumnPairs(next, setPlayerGrid)
    if (next.filter(Boolean).every((c) => c!.faceUp)) {
      endRound()
    } else {
      doAiTurn()
    }
  }

  const discardDrawn = () => {
    if (!drawn) return
    setDiscardPile([...discardPile, drawn])
    setDrawn(null)
    doAiTurn()
  }

  const checkColumnPairs = (
    grid: (GridCard | null)[],
    setter: React.Dispatch<React.SetStateAction<(GridCard | null)[]>>
  ) => {
    const next = [...grid]
    // Grid is 2 rows × 3 cols: indices 0-2 (top), 3-5 (bottom)
    for (let col = 0; col < 3; col++) {
      const top = next[col]
      const bot = next[col + 3]
      if (
        top?.faceUp && bot?.faceUp &&
        isStandardCard(top.card) && isStandardCard(bot.card) &&
        top.card.value === bot.card.value
      ) {
        next[col] = null
        next[col + 3] = null
      }
    }
    setter(next)
  }

  const doAiTurn = () => {
    setTurn('ai')
    setTimeout(() => {
      // Simple AI: draw from pile, replace a random face-down card
      if (drawPile.length === 0) {
        endRound()
        return
      }

      const card = drawPile[0]
      setDrawPile((prev) => prev.slice(1))
      const faceDownIndices = aiGrid
        .map((c, i) => (c && !c.faceUp ? i : -1))
        .filter((i) => i >= 0)

      if (faceDownIndices.length > 0) {
        const idx = faceDownIndices[Math.floor(Math.random() * faceDownIndices.length)]
        const old = aiGrid[idx]
        const next = [...aiGrid]
        next[idx] = { card, faceUp: true }
        setAiGrid(next)
        if (old) setDiscardPile((prev) => [...prev, old.card])
        checkColumnPairs(next, setAiGrid)
        if (next.filter(Boolean).every((c) => c!.faceUp)) {
          endRound()
          return
        }
      } else {
        setDiscardPile((prev) => [...prev, card])
      }

      setTurn('player')
      setMessage('[d] draw from pile, [p] take from discard.')
    }, 800)
  }

  const endRound = () => {
    // Flip all remaining cards
    setPlayerGrid((g) => g.map((c) => (c ? { ...c, faceUp: true } : null)))
    setAiGrid((g) => g.map((c) => (c ? { ...c, faceUp: true } : null)))
    setPhase('over')
    const ps = scoreGrid(playerGrid)
    const as_ = scoreGrid(aiGrid)
    setMessage(`Round over! You: ${ps} | AI: ${as_}. ${ps < as_ ? 'You win!' : ps > as_ ? 'AI wins!' : 'Tie!'}`)
  }

  useInput((input) => {
    if (phase === 'over') return
    if (phase === 'peek') {
      const idx = Number.parseInt(input, 10)
      if (idx >= 1 && idx <= 6) peek(idx - 1)
      return
    }

    if (turn !== 'player') return
    if (!drawn) {
      if (input === 'd') drawFromPile()
      if (input === 'p') takeFromDiscard()
    } else {
      const idx = Number.parseInt(input, 10)
      if (idx >= 1 && idx <= 6) replaceCard(idx - 1)
      if (input === 'x') discardDrawn()
    }
  })

  const renderGrid = (grid: (GridCard | null)[], label: string) => (
    <Box flexDirection="column">
      <Text>{label}</Text>
      {[0, 1].map((row) => (
        <Box key={row} gap={1}>
          {[0, 1, 2].map((col) => {
            const cell = grid[row * 3 + col]
            if (!cell) return <Text key={col} dimColor>  ×  </Text>
            if (!cell.faceUp) return <Text key={col}> [?] </Text>
            return isStandardCard(cell.card) ? (
              <Text key={col}> {cell.card.value}{cell.card.suit[0]} </Text>
            ) : (
              <Text key={col}> ??? </Text>
            )
          })}
        </Box>
      ))}
    </Box>
  )

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Golf Card Game</Text>
      {renderGrid(aiGrid, 'AI:')}
      {renderGrid(playerGrid, 'You:')}
      {drawn && isStandardCard(drawn) && <Text>Drawn: {drawn.value} of {drawn.suit}</Text>}
      <Text>Discard top: {discardPile.length > 0 && isStandardCard(discardPile[discardPile.length - 1]) ? `${(discardPile[discardPile.length - 1] as any).value}` : '(empty)'}</Text>
      <Text>Draw pile: {drawPile.length}</Text>
      <Text>{message}</Text>
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <GolfGame />
  </DeckProvider>
)

export default App
```

## Key Concepts

- `createStandardDeck()` for generating cards with unique `id`s
- `isStandardCard(card)` type guard before accessing `suit` / `value`
- Local state management for the 2×3 grids, draw pile, and discard pile
- Column pair cancellation: matching values in the same column are removed
- Simple AI opponent that draws and replaces face-down cards randomly
