# Five Card Draw Poker

A terminal poker game built with `ink-playing-cards` and `ink`. Two players (you vs CPU) are dealt five cards each. Select cards to discard, draw replacements, and the best hand wins.

## How to Play

- **1–5**: Toggle card selection for discard
- **d**: Discard selected cards and draw replacements
- **n**: Deal a new round

## Implementation

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  useHand,
  Card,
  isStandardCard,
  type TCard,
  type CardProps,
} from 'ink-playing-cards'

// --- Hand evaluation ---

const VALUE_ORDER = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']

function valueIndex(v: string): number {
  return VALUE_ORDER.indexOf(v)
}

type HandResult = { rank: number; name: string }

function evaluateHand(cards: TCard[]): HandResult {
  const std = cards.filter(isStandardCard)
  if (std.length < 5) return { rank: 0, name: 'High Card' }

  const values = std.map((c) => c.value)
  const suits = std.map((c) => c.suit)

  const counts: Record<string, number> = {}
  for (const v of values) counts[v] = (counts[v] ?? 0) + 1
  const freq = Object.values(counts).sort((a, b) => b - a)

  const isFlush = new Set(suits).size === 1
  const sorted = [...new Set(values)].sort((a, b) => valueIndex(a) - valueIndex(b))
  const isStraight =
    sorted.length === 5 &&
    valueIndex(sorted[4]!) - valueIndex(sorted[0]!) === 4

  // Check ace-low straight (A-2-3-4-5)
  const isLowStraight =
    sorted.length === 5 &&
    sorted.join(',') === '2,3,4,5,A'

  const anyStraight = isStraight || isLowStraight

  if (isFlush && anyStraight) return { rank: 8, name: 'Straight Flush' }
  if (freq[0] === 4) return { rank: 7, name: 'Four of a Kind' }
  if (freq[0] === 3 && freq[1] === 2) return { rank: 6, name: 'Full House' }
  if (isFlush) return { rank: 5, name: 'Flush' }
  if (anyStraight) return { rank: 4, name: 'Straight' }
  if (freq[0] === 3) return { rank: 3, name: 'Three of a Kind' }
  if (freq[0] === 2 && freq[1] === 2) return { rank: 2, name: 'Two Pair' }
  if (freq[0] === 2) return { rank: 1, name: 'Pair' }
  return { rank: 0, name: 'High Card' }
}

// --- Game component ---

type Phase = 'deal' | 'select' | 'result'

function PokerGame() {
  const { deck, hands, shuffle, deal, reset } = useDeck()
  const { hand: playerHand, discard: discardCard, drawCard } = useHand('player')
  const cpuHand = hands['cpu'] ?? []

  const [phase, setPhase] = useState<Phase>('deal')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [result, setResult] = useState('')

  // Deal initial hands on mount
  useEffect(() => {
    startRound()
  }, [])

  function startRound() {
    reset()
    // After reset, we need to shuffle and deal on next tick
    setTimeout(() => {
      shuffle()
      deal(5, ['player', 'cpu'])
      setPhase('select')
      setSelected(new Set())
      setResult('')
    }, 0)
  }

  function handleDiscard() {
    // Discard selected cards, then draw replacements
    const indices = [...selected].sort((a, b) => b - a)
    const cardIds = indices
      .map((i) => playerHand[i]?.id)
      .filter(Boolean) as string[]

    for (const id of cardIds) {
      discardCard(id)
    }

    // Draw the same number of replacement cards
    if (cardIds.length > 0) {
      drawCard(cardIds.length)
    }

    // Evaluate after state settles
    setTimeout(() => showResult(), 0)
  }

  function showResult() {
    setPhase('result')
    const pResult = evaluateHand(playerHand)
    const cResult = evaluateHand(cpuHand)

    if (pResult.rank > cResult.rank) {
      setResult(`You win! ${pResult.name} beats ${cResult.name}`)
    } else if (cResult.rank > pResult.rank) {
      setResult(`CPU wins! ${cResult.name} beats ${pResult.name}`)
    } else {
      setResult(`Tie! Both have ${pResult.name}`)
    }
  }

  useInput((input) => {
    if (phase === 'select') {
      const num = parseInt(input, 10)
      if (num >= 1 && num <= 5) {
        setSelected((prev) => {
          const next = new Set(prev)
          if (next.has(num - 1)) {
            next.delete(num - 1)
          } else {
            next.add(num - 1)
          }
          return next
        })
      }

      if (input === 'd') {
        handleDiscard()
      }
    }

    if (phase === 'result' && input === 'n') {
      startRound()
    }
  })

  // --- Render ---

  const playerEval = evaluateHand(playerHand)

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="yellow">
        ♠ Five Card Draw Poker ♠
      </Text>
      <Text dimColor>Deck: {deck.length} cards remaining</Text>
      <Box marginY={1} />

      {/* CPU hand */}
      <Text bold>CPU Hand:</Text>
      <Box gap={1}>
        {cpuHand.map((card) =>
          isStandardCard(card) ? (
            <Card
              key={card.id}
              id={card.id}
              suit={card.suit}
              value={card.value}
              faceUp={phase === 'result'}
              variant="mini"
            />
          ) : null
        )}
      </Box>
      <Box marginY={1} />

      {/* Player hand */}
      <Text bold>Your Hand: ({playerEval.name})</Text>
      <Box gap={1}>
        {playerHand.map((card, i) =>
          isStandardCard(card) ? (
            <Card
              key={card.id}
              id={card.id}
              suit={card.suit}
              value={card.value}
              faceUp
              selected={selected.has(i)}
              variant="mini"
            />
          ) : null
        )}
      </Box>

      {/* Card labels */}
      <Box gap={1}>
        {playerHand.map((_, i) => (
          <Box key={i} width={6} justifyContent="center">
            <Text dimColor>{selected.has(i) ? '✗' : ' '} {i + 1}</Text>
          </Box>
        ))}
      </Box>
      <Box marginY={1} />

      {/* Controls */}
      {phase === 'select' && (
        <Box flexDirection="column">
          <Text color="cyan">
            Press 1-5 to toggle cards for discard, then D to draw
          </Text>
          <Text dimColor>
            Selected: {selected.size === 0 ? 'none' : [...selected].map((i) => i + 1).join(', ')}
          </Text>
        </Box>
      )}

      {phase === 'result' && (
        <Box flexDirection="column">
          <Text bold color={result.startsWith('You') ? 'green' : 'red'}>
            {result}
          </Text>
          <Text color="cyan">Press N for a new round</Text>
        </Box>
      )}
    </Box>
  )
}

// --- App entry point ---

function App() {
  return (
    <DeckProvider>
      <PokerGame />
    </DeckProvider>
  )
}

export default App
```

## API Patterns Used

| Concept            | API                                                       |
| ------------------ | --------------------------------------------------------- |
| State provider     | `<DeckProvider>` wraps the app                            |
| Deck operations    | `useDeck()` → `{ deck, hands, shuffle, deal, reset }`    |
| Per-player hand    | `useHand('player')` → `{ hand, drawCard, discard }`      |
| Access other hands | `hands['cpu']` from `useDeck()`                           |
| Deck size          | `deck.length` (plain `TCard[]` array)                     |
| Card properties    | `card.id`, `card.suit`, `card.value`                      |
| Type narrowing     | `isStandardCard(card)` before accessing `suit`/`value`    |
| Rendering          | `<Card id suit value faceUp selected variant="mini" />`   |
| Discard flow       | `discard(cardId)` then `drawCard(count)`                  |
| New round          | `reset()` → `shuffle()` → `deal(5, ['player', 'cpu'])`   |
