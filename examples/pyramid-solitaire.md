# Pyramid Solitaire

Remove all cards from a pyramid by pairing cards that sum to 13. Kings (value 13) are removed alone.

## Rules

1. Deal 28 cards in a 7-row pyramid (row _i_ has _i+1_ cards).
2. Remaining 24 cards form the stock.
3. Only uncovered cards (no cards overlapping from below) can be selected.
4. Pair two uncovered cards whose values sum to 13, or remove a lone King.
5. Draw from stock to waste when stuck; waste top card can be paired.
6. Win by clearing the entire pyramid.

## Implementation

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  MiniCard,
  createStandardDeck,
  type TCard,
  isStandardCard,
} from 'ink-playing-cards'

const cardNumericValue = (card: TCard): number => {
  if (!isStandardCard(card)) return 0
  const map: Record<string, number> = {
    A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13,
  }
  return map[card.value] ?? 0
}

const PyramidSolitaire = () => {
  const [pyramid, setPyramid] = useState<(TCard | null)[][]>([])
  const [stock, setStock] = useState<TCard[]>([])
  const [waste, setWaste] = useState<TCard[]>([])
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null)
  const [score, setScore] = useState(0)
  const [phase, setPhase] = useState<'playing' | 'won' | 'lost'>('playing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const cards = createStandardDeck()
    const pyr: (TCard | null)[][] = []
    let idx = 0
    for (let row = 0; row < 7; row++) {
      const r: TCard[] = []
      for (let col = 0; col <= row; col++) {
        r.push(cards[idx++])
      }
      pyr.push(r)
    }
    setPyramid(pyr)
    setStock(cards.slice(28))
    setMessage('[r,c] select card | [d] draw from stock | [w] pair with waste')
  }, [])

  const isUncovered = (row: number, col: number): boolean => {
    if (row === pyramid.length - 1) return true
    const nextRow = pyramid[row + 1]
    if (!nextRow) return true
    return nextRow[col] === null && nextRow[col + 1] === null
  }

  const selectCard = (row: number, col: number) => {
    const card = pyramid[row]?.[col]
    if (!card || !isUncovered(row, col)) {
      setMessage('Card is covered or empty.')
      return
    }

    const val = cardNumericValue(card)
    if (val === 13) {
      // King — remove alone
      removeCards([{ row, col }])
      return
    }

    if (selected) {
      const selCard = pyramid[selected.row]?.[selected.col]
      if (selCard && cardNumericValue(selCard) + val === 13) {
        removeCards([selected, { row, col }])
      } else {
        setSelected({ row, col })
        setMessage('Selected. Pick another card that sums to 13.')
      }
    } else {
      setSelected({ row, col })
      setMessage(`Selected ${isStandardCard(card) ? card.value : '?'}. Pick a pair or King.`)
    }
  }

  const pairWithWaste = () => {
    if (waste.length === 0 || !selected) {
      setMessage('Select a pyramid card first, and have a waste card.')
      return
    }
    const wasteCard = waste[waste.length - 1]
    const pyrCard = pyramid[selected.row]?.[selected.col]
    if (!pyrCard) return
    if (cardNumericValue(pyrCard) + cardNumericValue(wasteCard) === 13) {
      const next = pyramid.map((r) => [...r])
      next[selected.row][selected.col] = null
      setPyramid(next)
      setWaste(waste.slice(0, -1))
      setSelected(null)
      setScore((s) => s + 2)
      setMessage('Paired with waste!')
      checkWin(next)
    } else {
      setMessage('Does not sum to 13.')
    }
  }

  const removeCards = (positions: { row: number; col: number }[]) => {
    const next = pyramid.map((r) => [...r])
    for (const { row, col } of positions) {
      next[row][col] = null
    }
    setPyramid(next)
    setSelected(null)
    setScore((s) => s + positions.length)
    setMessage('Removed!')
    checkWin(next)
  }

  const drawFromStock = () => {
    if (stock.length === 0) {
      setMessage('Stock is empty.')
      return
    }
    setWaste([...waste, stock[0]])
    setStock(stock.slice(1))
    setMessage('Drew from stock.')
  }

  const checkWin = (pyr: (TCard | null)[][]) => {
    if (pyr.every((row) => row.every((c) => c === null))) {
      setPhase('won')
      setMessage(`You win! Score: ${score}`)
    }
  }

  useInput((input) => {
    if (phase !== 'playing') return
    if (input === 'd') drawFromStock()
    if (input === 'w') pairWithWaste()
    // Row,col selection: e.g. '1' selects row cursor, then col
    // Simplified: number keys 1-7 for bottom row quick select
    const idx = Number.parseInt(input, 10)
    if (idx >= 1 && idx <= 7) {
      selectCard(6, idx - 1)
    }
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Pyramid Solitaire — Score: {score}</Text>
      {pyramid.map((row, ri) => (
        <Box key={ri} justifyContent="center" gap={1}>
          {row.map((card, ci) => (
            <Box key={ci}>
              {card && isStandardCard(card) ? (
                <MiniCard
                  id={card.id}
                  suit={card.suit}
                  value={card.value}
                  faceUp
                  selected={selected?.row === ri && selected?.col === ci}
                />
              ) : (
                <Text dimColor> · </Text>
              )}
            </Box>
          ))}
        </Box>
      ))}
      <Box gap={2}>
        <Text>Stock: {stock.length}</Text>
        <Text>
          Waste: {waste.length > 0 && isStandardCard(waste[waste.length - 1])
            ? (waste[waste.length - 1] as any).value
            : '-'}
        </Text>
      </Box>
      <Text>{message}</Text>
      {phase === 'won' && <Text color="green">Congratulations!</Text>}
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <PyramidSolitaire />
  </DeckProvider>
)

export default App
```

## Key Concepts

- `createStandardDeck()` generates 52 cards with unique `id`s
- `MiniCard` for compact pyramid layout in the terminal
- `isStandardCard(card)` type guard before accessing `suit` / `value`
- Pyramid stored as a 2D array of `TCard | null` — null means removed
- `isUncovered()` checks that both children in the row below are null
- Pairing logic: two cards summing to 13, or a lone King (value 13)
