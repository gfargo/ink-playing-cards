# Klondike Solitaire

The classic solitaire game — build four foundation piles (Ace to King) by suit.

## Rules

1. Deal 7 tableau columns: column _i_ gets _i+1_ cards, top card face up.
2. Remaining 24 cards form the stock.
3. Move cards between tableau columns in descending rank, alternating colors.
4. Only Kings can fill empty tableau columns.
5. Build foundations up by suit from Ace to King.
6. Draw from stock to waste; play waste top card to tableau or foundation.
7. Win when all 4 foundations are complete (13 cards each).

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

const RANK_ORDER = ['A','2','3','4','5','6','7','8','9','10','J','Q','K']
const rankIndex = (card: TCard): number =>
  isStandardCard(card) ? RANK_ORDER.indexOf(card.value) : -1

const isRed = (card: TCard): boolean =>
  isStandardCard(card) && ['hearts', 'diamonds'].includes(card.suit)

const KlondikeSolitaire = () => {
  const [tableau, setTableau] = useState<PileCard[][]>([])
  const [foundations, setFoundations] = useState<TCard[][]>([[], [], [], []])
  const [stock, setStock] = useState<TCard[]>([])
  const [waste, setWaste] = useState<TCard[]>([])
  const [cursor, setCursor] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [phase, setPhase] = useState<'playing' | 'won'>('playing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const cards = createStandardDeck()
    const tab: PileCard[][] = []
    let idx = 0
    for (let i = 0; i < 7; i++) {
      const col: PileCard[] = []
      for (let j = 0; j <= i; j++) {
        col.push({ ...cards[idx], faceUp: j === i } as PileCard)
        idx++
      }
      tab.push(col)
    }
    setTableau(tab)
    setStock(cards.slice(idx))
    setMessage('[←/→] move | [space] select | [d] draw | [f] to foundation')
  }, [])

  const topOf = (pile: TCard[]) => pile[pile.length - 1]

  const canPlaceOnTableau = (card: TCard, col: PileCard[]): boolean => {
    if (col.length === 0) return isStandardCard(card) && card.value === 'K'
    const top = topOf(col)
    return (
      isStandardCard(card) && isStandardCard(top) &&
      isRed(card) !== isRed(top) &&
      rankIndex(card) === rankIndex(top) - 1
    )
  }

  const canPlaceOnFoundation = (card: TCard, pile: TCard[]): boolean => {
    if (!isStandardCard(card)) return false
    if (pile.length === 0) return card.value === 'A'
    const top = topOf(pile)
    return (
      isStandardCard(top) &&
      card.suit === top.suit &&
      rankIndex(card) === rankIndex(top) + 1
    )
  }

  const drawFromStock = () => {
    if (stock.length === 0) {
      setStock([...waste].reverse())
      setWaste([])
      setMessage('Recycled waste to stock.')
    } else {
      const card = stock[stock.length - 1]
      setStock(stock.slice(0, -1))
      setWaste([...waste, card])
      setMessage('Drew a card.')
    }
  }

  const tryMoveToFoundation = (colIdx: number) => {
    const col = tableau[colIdx]
    if (!col || col.length === 0) return
    const card = col[col.length - 1]
    if (!card.faceUp) return

    const fIdx = foundations.findIndex((f) => canPlaceOnFoundation(card, f))
    if (fIdx < 0) {
      setMessage('Cannot move to foundation.')
      return
    }

    const nextTab = tableau.map((c, i) => (i === colIdx ? c.slice(0, -1) : c))
    // Flip new top card
    if (nextTab[colIdx].length > 0) {
      const top = nextTab[colIdx][nextTab[colIdx].length - 1]
      if (!top.faceUp) nextTab[colIdx] = [...nextTab[colIdx].slice(0, -1), { ...top, faceUp: true }]
    }
    setTableau(nextTab)
    setFoundations(foundations.map((f, i) => (i === fIdx ? [...f, card] : f)))
    setMessage('Moved to foundation.')
    if (foundations.every((f, i) => (i === fIdx ? f.length + 1 : f.length) === 13)) {
      setPhase('won')
      setMessage('You win!')
    }
  }

  const moveColumn = (fromIdx: number, toIdx: number) => {
    const from = tableau[fromIdx]
    const to = tableau[toIdx]
    if (!from || from.length === 0) return

    // Find the deepest face-up card that can move
    const faceUpStart = from.findIndex((c) => c.faceUp)
    if (faceUpStart < 0) return
    const movingCards = from.slice(faceUpStart)
    if (!canPlaceOnTableau(movingCards[0], to)) {
      setMessage('Invalid move.')
      return
    }

    const nextTab = [...tableau]
    nextTab[fromIdx] = from.slice(0, faceUpStart)
    nextTab[toIdx] = [...to, ...movingCards]
    // Flip new top
    if (nextTab[fromIdx].length > 0) {
      const top = nextTab[fromIdx][nextTab[fromIdx].length - 1]
      if (!top.faceUp) {
        nextTab[fromIdx] = [
          ...nextTab[fromIdx].slice(0, -1),
          { ...top, faceUp: true },
        ]
      }
    }
    setTableau(nextTab)
    setSelected(null)
    setMessage('Moved.')
  }

  const playWaste = (toIdx: number) => {
    if (waste.length === 0) return
    const card = waste[waste.length - 1]
    if (!canPlaceOnTableau(card as PileCard, tableau[toIdx])) {
      setMessage('Invalid move.')
      return
    }
    setWaste(waste.slice(0, -1))
    const nextTab = [...tableau]
    nextTab[toIdx] = [...nextTab[toIdx], { ...card, faceUp: true } as PileCard]
    setTableau(nextTab)
    setSelected(null)
    setMessage('Played from waste.')
  }

  useInput((input, key) => {
    if (phase === 'won') return
    if (key.leftArrow) setCursor(Math.max(0, cursor - 1))
    if (key.rightArrow) setCursor(Math.min(7, cursor + 1)) // 0-6 tableau, 7 = waste
    if (input === 'd') drawFromStock()
    if (input === 'f' && cursor < 7) tryMoveToFoundation(cursor)
    if (input === ' ') {
      if (selected === null) {
        setSelected(cursor)
      } else {
        if (cursor < 7 && selected < 7) moveColumn(selected, cursor)
        else if (selected === 7 && cursor < 7) playWaste(cursor)
        setSelected(null)
      }
    }
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Klondike Solitaire</Text>
      <Box gap={1}>
        <Text>Stock:{stock.length} </Text>
        <Text>Waste:{waste.length > 0 && isStandardCard(topOf(waste)) ? ` ${(topOf(waste) as any).value}` : ' -'}</Text>
        <Text> | Foundations:</Text>
        {foundations.map((f, i) => (
          <Text key={i}>{f.length > 0 && isStandardCard(topOf(f)) ? ` ${(topOf(f) as any).value}${(topOf(f) as any).suit[0]}` : ' [ ]'}</Text>
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
      {phase === 'won' && <Text color="green">Congratulations!</Text>}
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <KlondikeSolitaire />
  </DeckProvider>
)

export default App
```

## Key Concepts

- `createStandardDeck()` for card generation with unique `id`s
- `MiniCard` component for compact solitaire layout
- `isStandardCard(card)` type guard before accessing `suit` / `value`
- Local state for tableau, foundations, stock, waste — solitaire needs custom pile logic
- Face-up/face-down tracking via extended `PileCard` type
- Cursor-based navigation for terminal interaction
