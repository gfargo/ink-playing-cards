# Aces Up!

A solitaire card game where the goal is to discard all cards except the four Aces.

## Rules

1. Deal 4 cards face up in a row from a standard 52-card deck.
2. If two or more visible cards share a suit, discard all but the highest.
3. Aces are high (A > K > Q > ... > 2).
4. Move cards to empty columns to reveal cards beneath.
5. When stuck, deal one new card onto each column.
6. Win if only the four Aces remain.

## Implementation

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  Card,
  createStandardDeck,
  type TCard,
  isStandardCard,
} from 'ink-playing-cards'

const VALUE_ORDER = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']

const valueRank = (card: TCard): number => {
  if (!isStandardCard(card)) return -1
  return VALUE_ORDER.indexOf(card.value)
}

const AcesUpGame = () => {
  const { deck, shuffle } = useDeck()
  const [columns, setColumns] = useState<TCard[][]>([[], [], [], []])
  const [drawPile, setDrawPile] = useState<TCard[]>([])
  const [discarded, setDiscarded] = useState<TCard[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [phase, setPhase] = useState<'playing' | 'won' | 'lost'>('playing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const cards = createStandardDeck()
    // Deal first 4 cards to columns
    const cols: TCard[][] = cards.slice(0, 4).map((c) => [{ ...c, faceUp: true }])
    setColumns(cols)
    setDrawPile(cards.slice(4))
    setMessage('Select columns (1-4). [d] discard, [n] deal, [r] restart.')
  }, [])

  const topCard = (col: TCard[]) => col[col.length - 1]

  const canDiscard = (card: TCard, colIndex: number): boolean => {
    if (!isStandardCard(card)) return false
    return columns.some((col, i) => {
      if (i === colIndex || col.length === 0) return false
      const top = topCard(col)
      return isStandardCard(top) && top.suit === card.suit && valueRank(top) > valueRank(card)
    })
  }

  const tryDiscard = (colIndex: number) => {
    const col = columns[colIndex]
    if (!col || col.length === 0) return
    const card = topCard(col)
    if (canDiscard(card, colIndex)) {
      const next = columns.map((c, i) => (i === colIndex ? c.slice(0, -1) : c))
      setColumns(next)
      setDiscarded((prev) => [...prev, card])
      setMessage('Discarded!')
      checkWin(next)
    } else {
      setMessage('Cannot discard — no higher card of same suit visible.')
    }
  }

  const dealNewCards = () => {
    if (drawPile.length === 0) {
      setMessage('Draw pile empty.')
      return
    }

    const next = columns.map((col, i) => {
      const card = drawPile[i]
      return card ? [...col, { ...card, faceUp: true }] : col
    })
    setColumns(next)
    setDrawPile(drawPile.slice(4))
    setMessage('Dealt new cards.')
  }

  const moveToEmpty = (fromIndex: number, toIndex: number) => {
    const from = columns[fromIndex]
    const to = columns[toIndex]
    if (!from || from.length === 0 || !to || to.length !== 0) return
    const card = topCard(from)
    const next = columns.map((c, i) => {
      if (i === fromIndex) return c.slice(0, -1)
      if (i === toIndex) return [card]
      return c
    })
    setColumns(next)
    setSelected(null)
    setMessage('Moved card.')
  }

  const checkWin = (cols: TCard[][]) => {
    const remaining = cols.flat()
    if (
      remaining.length === 4 &&
      remaining.every((c) => isStandardCard(c) && c.value === 'A')
    ) {
      setPhase('won')
      setMessage('You win! Only Aces remain.')
    }
  }

  const hasAnyMove = (): boolean => {
    return columns.some((col, i) => col.length > 0 && canDiscard(topCard(col), i))
      || columns.some((col) => col.length === 0)
      || drawPile.length > 0
  }

  useInput((input) => {
    if (phase !== 'playing') {
      if (input === 'r') {
        setPhase('playing')
        const cards = createStandardDeck()
        const cols: TCard[][] = cards.slice(0, 4).map((c) => [{ ...c, faceUp: true }])
        setColumns(cols)
        setDrawPile(cards.slice(4))
        setDiscarded([])
        setSelected(null)
      }
      return
    }

    const idx = Number.parseInt(input, 10)
    if (idx >= 1 && idx <= 4) {
      const colIdx = idx - 1
      if (selected !== null && columns[colIdx].length === 0) {
        moveToEmpty(selected, colIdx)
      } else {
        setSelected(colIdx)
        setMessage(`Selected column ${idx}.`)
      }
    } else if (input === 'd' && selected !== null) {
      tryDiscard(selected)
      setSelected(null)
    } else if (input === 'n') {
      dealNewCards()
    }
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Aces Up!</Text>
      <Text>{message}</Text>
      <Box gap={2}>
        {columns.map((col, i) => (
          <Box key={i} flexDirection="column">
            <Text>{i + 1}{selected === i ? ' ←' : ''}</Text>
            {col.length > 0 && isStandardCard(topCard(col)) ? (
              <Card
                id={topCard(col).id}
                suit={(topCard(col) as any).suit}
                value={(topCard(col) as any).value}
                faceUp
                selected={selected === i}
                variant="mini"
              />
            ) : (
              <Text dimColor>empty</Text>
            )}
            <Text dimColor>({col.length})</Text>
          </Box>
        ))}
      </Box>
      <Text>Draw pile: {drawPile.length} | Discarded: {discarded.length}</Text>
      {phase === 'playing' && <Text>[1-4] select | [d] discard | [n] deal | [r] restart</Text>}
      {phase === 'won' && <Text color="green">You won! [r] new game</Text>}
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <AcesUpGame />
  </DeckProvider>
)

export default App
```

## Key Concepts

- `createStandardDeck()` generates a fresh 52-card deck with unique `id`s
- Cards are managed in local state (columns) since the game needs custom pile logic
- `isStandardCard(card)` type guard for safe access to `suit` and `value`
- `DeckProvider` wraps the app even though we manage piles locally — it provides context for `Card` rendering
- `Card` component with `variant="mini"` for compact solitaire layout
