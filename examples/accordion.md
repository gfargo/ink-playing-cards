# Accordion

A solitaire game where the goal is to consolidate all cards into a single pile by matching suit or value.

## Rules

1. Deal all 52 cards face up in a row (each card is its own pile).
2. A pile can be moved onto the pile immediately to its left, or 3 positions to its left, if the top cards match by suit or value.
3. When a pile is moved, the entire stack moves.
4. Win if all cards end up in a single pile.

## Implementation

```tsx
import React, { useState, useEffect, useMemo } from 'react'
import { Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  Card,
  createStandardDeck,
  type TCard,
  isStandardCard,
} from 'ink-playing-cards'

const MAX_VISIBLE = 10

const canMatch = (a: TCard, b: TCard): boolean => {
  if (!isStandardCard(a) || !isStandardCard(b)) return false
  return a.suit === b.suit || a.value === b.value
}

const AccordionGame = () => {
  const [piles, setPiles] = useState<TCard[][]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [scroll, setScroll] = useState(0)
  const [phase, setPhase] = useState<'playing' | 'won' | 'lost'>('playing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const cards = createStandardDeck()
    setPiles(cards.map((c) => [{ ...c, faceUp: true }]))
    setMessage('Select a pile (1-0), arrows to scroll. Match suit or value.')
  }, [])

  const topOf = (pile: TCard[]) => pile[pile.length - 1]

  const visible = useMemo(
    () => piles.slice(scroll, scroll + MAX_VISIBLE),
    [piles, scroll]
  )

  const isValidMove = (from: number, to: number): boolean => {
    if (to < 0 || to >= piles.length) return false
    if (to !== from - 1 && to !== from - 3) return false
    return canMatch(topOf(piles[from]), topOf(piles[to]))
  }

  const movePile = (from: number, to: number) => {
    const next = [...piles]
    next[to] = [...next[to], ...next[from]]
    next.splice(from, 1)
    setPiles(next)
    setSelected(null)

    if (next.length === 1) {
      setPhase('won')
      setMessage('You win! All cards in one pile.')
    } else if (!hasValidMoves(next)) {
      setPhase('lost')
      setMessage(`Game over. ${next.length} piles remain.`)
    }
  }

  const hasValidMoves = (p: TCard[][]): boolean => {
    for (let i = 1; i < p.length; i++) {
      if (canMatch(topOf(p[i]), topOf(p[i - 1]))) return true
      if (i >= 3 && canMatch(topOf(p[i]), topOf(p[i - 3]))) return true
    }
    return false
  }

  const selectPile = (visIdx: number) => {
    const absIdx = scroll + visIdx
    if (absIdx >= piles.length) return

    if (selected === null) {
      setSelected(absIdx)
      setMessage(`Selected pile ${absIdx + 1}. Pick target (left-1 or left-3).`)
    } else {
      if (isValidMove(selected, absIdx)) {
        movePile(selected, absIdx)
        setMessage('Moved!')
      } else if (isValidMove(absIdx, selected)) {
        movePile(absIdx, selected)
        setMessage('Moved!')
      } else {
        setSelected(absIdx)
        setMessage('Invalid move. Re-selected.')
      }
    }
  }

  useInput((input, key) => {
    if (phase !== 'playing') {
      if (input === 'r') {
        const cards = createStandardDeck()
        setPiles(cards.map((c) => [{ ...c, faceUp: true }]))
        setSelected(null)
        setScroll(0)
        setPhase('playing')
      }
      return
    }

    if (key.leftArrow) setScroll(Math.max(0, scroll - 1))
    if (key.rightArrow) setScroll(Math.min(piles.length - MAX_VISIBLE, scroll + 1))
    const idx = input === '0' ? 9 : Number.parseInt(input, 10) - 1
    if (idx >= 0 && idx < MAX_VISIBLE) selectPile(idx)
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Accordion ({piles.length} piles)</Text>
      <Text>{message}</Text>
      <Box gap={1}>
        {visible.map((pile, i) => {
          const absIdx = scroll + i
          const top = topOf(pile)
          return (
            <Box key={absIdx} flexDirection="column">
              <Text>{(i + 1) % 10}{selected === absIdx ? '←' : ' '}</Text>
              {isStandardCard(top) ? (
                <Card
                  id={top.id}
                  suit={top.suit}
                  value={top.value}
                  faceUp
                  selected={selected === absIdx}
                  variant="mini"
                />
              ) : null}
              {pile.length > 1 && <Text dimColor>+{pile.length - 1}</Text>}
            </Box>
          )
        })}
      </Box>
      <Text dimColor>
        Showing {scroll + 1}-{Math.min(scroll + MAX_VISIBLE, piles.length)} of {piles.length}
      </Text>
      {phase === 'playing' && <Text>[1-0] select | [←/→] scroll</Text>}
      {phase !== 'playing' && <Text>[r] new game</Text>}
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <AccordionGame />
  </DeckProvider>
)

export default App
```

## Key Concepts

- `createStandardDeck()` generates 52 cards with unique `id`s
- `isStandardCard(card)` type guard before accessing `suit` / `value`
- `Card` with `variant="mini"` for compact display
- Scrollable view with `MAX_VISIBLE` piles shown at once, arrow keys to scroll
- Matching logic uses `card.value` (not `card.rank`) and `card.suit`
- Each pile is a `TCard[]` — moving stacks the entire pile onto the target
