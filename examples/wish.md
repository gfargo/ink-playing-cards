# Wish

A simple matching game — remove all cards by pairing cards of the same rank. Clear the board and make a wish!

## Rules

1. Use 32 cards: 7, 8, 9, 10, J, Q, K, A of all four suits.
2. Deal into 8 piles of 4 cards each, top card face up.
3. Select two piles whose top cards share the same rank to remove them.
4. When a card is removed, the next card in that pile flips face up.
5. Win if all cards are removed. Lose if no matching pairs remain.

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
  type TCardValue,
} from 'ink-playing-cards'

const WISH_VALUES: TCardValue[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A']

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const WishGame = () => {
  const [piles, setPiles] = useState<TCard[][]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [phase, setPhase] = useState<'playing' | 'won' | 'lost'>('playing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    startGame()
  }, [])

  const startGame = () => {
    const allCards = createStandardDeck()
    const wishCards = allCards.filter(
      (c) => isStandardCard(c) && WISH_VALUES.includes(c.value)
    )
    const shuffled = shuffleArray(wishCards)
    const newPiles: TCard[][] = []
    for (let i = 0; i < 8; i++) {
      newPiles.push(shuffled.slice(i * 4, i * 4 + 4))
    }
    setPiles(newPiles)
    setSelected(null)
    setPhase('playing')
    setMessage('Select two piles with matching top cards (1-8).')
  }

  const topCard = (pile: TCard[]) => pile[pile.length - 1]

  const selectPile = (idx: number) => {
    if (phase !== 'playing') return
    const pile = piles[idx]
    if (!pile || pile.length === 0) {
      setMessage('Pile is empty.')
      return
    }

    if (selected === null) {
      setSelected(idx)
      const card = topCard(pile)
      setMessage(
        `Selected pile ${idx + 1} (${isStandardCard(card) ? card.value : '?'}). Pick a matching pile.`
      )
    } else if (selected === idx) {
      setSelected(null)
      setMessage('Deselected.')
    } else {
      const card1 = topCard(piles[selected])
      const card2 = topCard(pile)
      if (
        isStandardCard(card1) && isStandardCard(card2) &&
        card1.value === card2.value
      ) {
        // Match — remove both top cards
        const next = piles.map((p, i) => {
          if (i === selected || i === idx) return p.slice(0, -1)
          return p
        })
        setPiles(next)
        setSelected(null)
        setMessage('Match!')
        checkState(next)
      } else {
        setSelected(idx)
        setMessage('No match. Try another pile.')
      }
    }
  }

  const checkState = (currentPiles: TCard[][]) => {
    if (currentPiles.every((p) => p.length === 0)) {
      setPhase('won')
      setMessage('You cleared the board! Make a wish! ✨')
      return
    }

    // Check if any valid moves remain
    const tops = currentPiles
      .filter((p) => p.length > 0)
      .map((p) => {
        const c = topCard(p)
        return isStandardCard(c) ? c.value : null
      })
      .filter(Boolean)

    const hasDuplicates = new Set(tops).size < tops.length
    if (!hasDuplicates) {
      setPhase('lost')
      setMessage('No more matches possible. Game over.')
    }
  }

  useInput((input) => {
    if (phase !== 'playing') {
      if (input === 'r') startGame()
      return
    }
    const idx = Number.parseInt(input, 10)
    if (idx >= 1 && idx <= 8) selectPile(idx - 1)
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Wish Card Game</Text>
      <Text>{message}</Text>
      <Box gap={1}>
        {piles.map((pile, i) => (
          <Box key={i} flexDirection="column">
            <Text>{i + 1}{selected === i ? '←' : ' '}</Text>
            {pile.length > 0 && isStandardCard(topCard(pile)) ? (
              <Card
                id={topCard(pile).id}
                suit={(topCard(pile) as any).suit}
                value={(topCard(pile) as any).value}
                faceUp
                selected={selected === i}
                variant="mini"
              />
            ) : (
              <Text dimColor>empty</Text>
            )}
            <Text dimColor>({pile.length})</Text>
          </Box>
        ))}
      </Box>
      {phase === 'playing' && <Text>[1-8] select pile | [r] restart</Text>}
      {phase === 'won' && <Text color="green">Make a wish! [r] new game</Text>}
      {phase === 'lost' && <Text color="red">No moves left. [r] new game</Text>}
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <WishGame />
  </DeckProvider>
)

export default App
```

## Key Concepts

- `createStandardDeck()` generates all 52 cards, then filtered to the 32 needed for Wish
- `isStandardCard(card)` type guard for safe access to `suit` and `value`
- Cards managed in local state piles — each pile is a `TCard[]` array
- `Card` with `variant="mini"` for compact display
- Matching logic compares `card.value` (not `card.rank` — the library uses `value`)
- Win detection: all piles empty. Loss detection: no duplicate values among top cards
