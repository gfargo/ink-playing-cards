# Golf Solitaire

A solitaire game where the goal is to clear all cards from the tableau by building sequences regardless of suit.

## Rules

1. Deal 7 columns of 5 cards each (all face up) as the tableau.
2. Turn one card face up to start the waste pile. The rest form the stock.
3. Move tableau cards to the waste pile if they are one rank higher or lower than the top waste card (suit doesn't matter).
4. Kings wrap to Aces and vice versa.
5. Draw from stock when stuck.
6. Win by clearing the entire tableau.

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

const VALUE_ORDER = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']

const valueIndex = (card: TCard): number => {
  if (!isStandardCard(card)) return -1
  return VALUE_ORDER.indexOf(card.value)
}

const isAdjacent = (a: TCard, b: TCard): boolean => {
  const ai = valueIndex(a)
  const bi = valueIndex(b)
  if (ai < 0 || bi < 0) return false
  const diff = Math.abs(ai - bi)
  return diff === 1 || diff === 12 // wrap K↔A
}

const GolfSolitaire = () => {
  const [tableau, setTableau] = useState<TCard[][]>([])
  const [waste, setWaste] = useState<TCard[]>([])
  const [stock, setStock] = useState<TCard[]>([])
  const [selectedCol, setSelectedCol] = useState(0)
  const [phase, setPhase] = useState<'playing' | 'won' | 'lost'>('playing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    startGame()
  }, [])

  const startGame = () => {
    const cards = createStandardDeck()
    const cols: TCard[][] = []
    for (let i = 0; i < 7; i++) {
      cols.push(cards.slice(i * 5, i * 5 + 5).map((c) => ({ ...c, faceUp: true })))
    }
    setTableau(cols)
    setWaste([{ ...cards[35], faceUp: true }])
    setStock(cards.slice(36))
    setSelectedCol(0)
    setPhase('playing')
    setMessage('Arrow keys to select column, [space] play card, [d] draw from stock.')
  }

  const topWaste = waste[waste.length - 1]

  const playFromColumn = (colIdx: number) => {
    const col = tableau[colIdx]
    if (!col || col.length === 0) return
    const card = col[col.length - 1]
    if (!topWaste || !isAdjacent(card, topWaste)) {
      setMessage('Card must be one rank higher or lower than waste top.')
      return
    }

    const next = tableau.map((c, i) => (i === colIdx ? c.slice(0, -1) : c))
    setTableau(next)
    setWaste([...waste, card])
    setMessage('Played!')
    if (next.every((c) => c.length === 0)) {
      setPhase('won')
      setMessage('You cleared the tableau! You win!')
    }
  }

  const drawFromStock = () => {
    if (stock.length === 0) {
      setMessage('Stock is empty.')
      if (!hasValidMoves()) {
        setPhase('lost')
        setMessage('No moves left. Game over.')
      }
      return
    }

    const card = stock[0]
    setWaste([...waste, { ...card, faceUp: true }])
    setStock(stock.slice(1))
    setMessage('Drew from stock.')
  }

  const hasValidMoves = (): boolean => {
    const top = waste[waste.length - 1]
    if (!top) return false
    return tableau.some(
      (col) => col.length > 0 && isAdjacent(col[col.length - 1], top)
    )
  }

  useInput((_input, key) => {
    if (phase !== 'playing') {
      if (_input === 'r') startGame()
      return
    }

    if (key.leftArrow) setSelectedCol(Math.max(0, selectedCol - 1))
    if (key.rightArrow) setSelectedCol(Math.min(6, selectedCol + 1))
    if (_input === ' ') playFromColumn(selectedCol)
    if (_input === 'd') drawFromStock()
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Golf Solitaire</Text>
      <Text>{message}</Text>
      <Box gap={1}>
        {tableau.map((col, i) => (
          <Box key={i} flexDirection="column">
            <Text>{selectedCol === i ? '▼' : ' '}</Text>
            {col.length > 0 && isStandardCard(col[col.length - 1]) ? (
              <Card
                id={col[col.length - 1].id}
                suit={(col[col.length - 1] as any).suit}
                value={(col[col.length - 1] as any).value}
                faceUp
                selected={selectedCol === i}
                variant="mini"
              />
            ) : (
              <Text dimColor>---</Text>
            )}
            <Text dimColor>({col.length})</Text>
          </Box>
        ))}
      </Box>
      <Box gap={2}>
        <Text>Waste: {topWaste && isStandardCard(topWaste) ? `${topWaste.value}` : '?'}</Text>
        <Text>Stock: {stock.length}</Text>
      </Box>
      {phase === 'playing' && <Text>[←/→] select | [space] play | [d] draw</Text>}
      {phase !== 'playing' && <Text>{phase === 'won' ? 'You win!' : 'Game over.'} [r] restart</Text>}
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <GolfSolitaire />
  </DeckProvider>
)

export default App
```

## Key Concepts

- `createStandardDeck()` generates cards with unique `id`s — used for local pile management
- `isStandardCard(card)` type guard before accessing `suit` / `value`
- Tableau columns managed in local state since the game needs custom pile logic beyond what `useDeck` provides
- `Card` with `variant="mini"` for compact solitaire display
- Wrapping adjacency: K↔A handled via modular arithmetic
