# Solitaire (Klondike)

Classic Klondike Solitaire using `MiniCard` for a compact terminal layout.

This is a streamlined version — see [klondike-solitaire.md](./klondike-solitaire.md) for a more detailed implementation.

## Overview

Build four foundation piles (Ace → King) by suit. Move cards between 7 tableau columns in descending rank with alternating colors.

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

type PileCard = TCard & { faceUp: boolean }

const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']
const rankIdx = (c: TCard) => isStandardCard(c) ? RANKS.indexOf(c.value) : -1
const isRed = (c: TCard) => isStandardCard(c) && ['hearts','diamonds'].includes(c.suit)

const SolitaireGame = () => {
  const [tableau, setTableau] = useState<PileCard[][]>([])
  const [foundations, setFoundations] = useState<TCard[][]>([[], [], [], []])
  const [stock, setStock] = useState<TCard[]>([])
  const [waste, setWaste] = useState<TCard[]>([])
  const [cursor, setCursor] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const cards = createStandardDeck()
    const tab: PileCard[][] = []
    let idx = 0
    for (let i = 0; i < 7; i++) {
      const col: PileCard[] = []
      for (let j = 0; j <= i; j++) {
        col.push({ ...cards[idx++], faceUp: j === i } as PileCard)
      }
      tab.push(col)
    }
    setTableau(tab)
    setStock(cards.slice(idx))
    setMessage('[←/→] navigate | [space] select/move | [d] draw | [f] foundation')
  }, [])

  const top = (pile: TCard[]) => pile[pile.length - 1]

  const drawCards = () => {
    if (stock.length === 0) {
      setStock([...waste].reverse())
      setWaste([])
    } else {
      setWaste([...waste, stock[stock.length - 1]])
      setStock(stock.slice(0, -1))
    }
  }

  const canStack = (card: TCard, dest: PileCard[]): boolean => {
    if (dest.length === 0) return isStandardCard(card) && card.value === 'K'
    const t = top(dest)
    return isRed(card) !== isRed(t) && rankIdx(card) === rankIdx(t) - 1
  }

  const canFoundation = (card: TCard, pile: TCard[]): boolean => {
    if (!isStandardCard(card)) return false
    if (pile.length === 0) return card.value === 'A'
    const t = top(pile)
    return isStandardCard(t) && card.suit === t.suit && rankIdx(card) === rankIdx(t) + 1
  }

  const flipTop = (col: PileCard[]): PileCard[] => {
    if (col.length === 0) return col
    const last = col[col.length - 1]
    if (last.faceUp) return col
    return [...col.slice(0, -1), { ...last, faceUp: true }]
  }

  const moveColumns = (from: number, to: number) => {
    const src = tableau[from]
    const faceUpIdx = src.findIndex((c) => c.faceUp)
    if (faceUpIdx < 0) return
    const moving = src.slice(faceUpIdx)
    if (!canStack(moving[0], tableau[to])) {
      setMessage('Invalid move.')
      return
    }
    const next = [...tableau]
    next[from] = flipTop(src.slice(0, faceUpIdx))
    next[to] = [...next[to], ...moving]
    setTableau(next)
    setSelected(null)
  }

  const playWasteToTableau = (to: number) => {
    if (waste.length === 0) return
    const card = top(waste)
    if (!canStack(card, tableau[to])) {
      setMessage('Invalid move.')
      return
    }
    setWaste(waste.slice(0, -1))
    const next = [...tableau]
    next[to] = [...next[to], { ...card, faceUp: true } as PileCard]
    setTableau(next)
    setSelected(null)
  }

  const toFoundation = (colIdx: number) => {
    const col = tableau[colIdx]
    if (!col || col.length === 0) return
    const card = col[col.length - 1]
    if (!card.faceUp) return
    const fi = foundations.findIndex((f) => canFoundation(card, f))
    if (fi < 0) { setMessage('Cannot move to foundation.'); return }
    const next = [...tableau]
    next[colIdx] = flipTop(col.slice(0, -1))
    setTableau(next)
    setFoundations(foundations.map((f, i) => (i === fi ? [...f, card] : f)))
    if (foundations.every((f, i) => (i === fi ? f.length + 1 : f.length) === 13)) {
      setMessage('You win!')
    }
  }

  useInput((input, key) => {
    if (key.leftArrow) setCursor(Math.max(0, cursor - 1))
    if (key.rightArrow) setCursor(Math.min(7, cursor + 1))
    if (input === 'd') drawCards()
    if (input === 'f' && cursor < 7) toFoundation(cursor)
    if (input === ' ') {
      if (selected === null) {
        setSelected(cursor)
      } else {
        if (cursor < 7 && selected < 7) moveColumns(selected, cursor)
        else if (selected === 7 && cursor < 7) playWasteToTableau(cursor)
        setSelected(null)
      }
    }
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Solitaire</Text>
      <Box gap={1}>
        <Text>Stock:{stock.length}</Text>
        <Text>Waste:{waste.length > 0 && isStandardCard(top(waste)) ? ` ${(top(waste) as any).value}` : ' -'}</Text>
        <Text> F:</Text>
        {foundations.map((f, i) => (
          <Text key={i}>
            {f.length > 0 && isStandardCard(top(f))
              ? `${(top(f) as any).value}${(top(f) as any).suit[0]}`
              : '[ ]'}
          </Text>
        ))}
      </Box>
      <Box gap={1}>
        {tableau.map((col, i) => (
          <Box key={i} flexDirection="column">
            <Text>{cursor === i ? (selected === i ? '★' : '▼') : ' '}</Text>
            {col.length === 0 ? (
              <Text dimColor>---</Text>
            ) : (
              col.map((card, j) =>
                card.faceUp && isStandardCard(card) ? (
                  <MiniCard key={card.id} id={card.id} suit={card.suit} value={card.value} faceUp />
                ) : (
                  <Text key={j} dimColor>[?]</Text>
                )
              )
            )}
          </Box>
        ))}
        <Box flexDirection="column">
          <Text>{cursor === 7 ? '▼' : ' '}</Text>
          <Text>W</Text>
        </Box>
      </Box>
      <Text>{message}</Text>
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <SolitaireGame />
  </DeckProvider>
)

export default App
```

## Key Concepts

- `createStandardDeck()` for card generation with unique `id`s
- `MiniCard` component for compact solitaire layout
- `isStandardCard(card)` type guard before accessing `suit` / `value`
- Local state for tableau, foundations, stock, waste
- Cursor-based navigation with `[space]` to select/move, `[d]` to draw, `[f]` to foundation
- Auto-flip: when a column's top card is removed, the new top is flipped face up
