# Uno

A single-player Uno game (player vs 3 AI opponents) using `CustomCard` for Uno-specific cards.

## Rules

1. Each player starts with 7 cards.
2. Match the top discard card by color or value.
3. Special cards: Skip, Reverse, Draw Two, Wild, Wild Draw Four.
4. First player to empty their hand wins.

## Implementation

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  CustomCard,
  type CustomCardProps,
} from 'ink-playing-cards'

const UNO_COLORS = ['red', 'blue', 'green', 'yellow'] as const
const UNO_NUMBERS = ['0','1','2','3','4','5','6','7','8','9']
const UNO_ACTIONS = ['Skip', 'Reverse', 'Draw Two']
const UNO_WILDS = ['Wild', 'Wild Draw Four']

type UnoCard = CustomCardProps & {
  color: string
  unoValue: string
  isWild: boolean
}

let cardCounter = 0
const makeUnoCard = (color: string, unoValue: string): UnoCard => {
  const isWild = UNO_WILDS.includes(unoValue)
  return {
    id: `uno-${++cardCounter}`,
    title: unoValue,
    description: isWild ? 'Choose a color' : '',
    size: 'small' as const,
    borderColor: isWild ? 'white' : color,
    textColor: color || 'white',
    color: isWild ? '' : color,
    unoValue,
    isWild,
  }
}

const buildUnoDeck = (): UnoCard[] => {
  const cards: UnoCard[] = []
  for (const color of UNO_COLORS) {
    for (const num of UNO_NUMBERS) {
      cards.push(makeUnoCard(color, num))
      if (num !== '0') cards.push(makeUnoCard(color, num))
    }
    for (const action of UNO_ACTIONS) {
      cards.push(makeUnoCard(color, action))
      cards.push(makeUnoCard(color, action))
    }
  }
  for (const wild of UNO_WILDS) {
    for (let i = 0; i < 4; i++) cards.push(makeUnoCard('', wild))
  }
  return cards
}

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const UnoGame = () => {
  const [hands, setHands] = useState<UnoCard[][]>([[], [], [], []])
  const [drawPile, setDrawPile] = useState<UnoCard[]>([])
  const [currentCard, setCurrentCard] = useState<UnoCard | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [direction, setDirection] = useState(1)
  const [phase, setPhase] = useState<'playing' | 'over'>('playing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const deck = shuffleArray(buildUnoDeck())
    const newHands = [
      deck.slice(0, 7),
      deck.slice(7, 14),
      deck.slice(14, 21),
      deck.slice(21, 28),
    ]
    setHands(newHands)
    setCurrentCard(deck[28])
    setDrawPile(deck.slice(29))
    setMessage('Your turn. Press 1-9 to play a card, [d] to draw.')
  }, [])

  const isValidPlay = (card: UnoCard): boolean => {
    if (!currentCard) return false
    return (
      card.isWild ||
      card.color === currentCard.color ||
      card.unoValue === currentCard.unoValue
    )
  }

  const nextPlayer = (skip = false): number => {
    const step = skip ? direction * 2 : direction
    return ((currentPlayer + step) % 4 + 4) % 4
  }

  const playCard = (playerIdx: number, cardIdx: number) => {
    const card = hands[playerIdx][cardIdx]
    if (!card || !isValidPlay(card)) {
      setMessage('Invalid play.')
      return
    }

    const newHands = hands.map((h, i) =>
      i === playerIdx ? h.filter((_, j) => j !== cardIdx) : h
    )
    setHands(newHands)

    let playedCard = card
    if (card.isWild) {
      // Pick most common color in hand (or random for AI)
      const chosenColor = playerIdx === 0
        ? UNO_COLORS[Math.floor(Math.random() * 4)]
        : UNO_COLORS[Math.floor(Math.random() * 4)]
      playedCard = { ...card, color: chosenColor, borderColor: chosenColor }
    }

    setCurrentCard(playedCard)

    if (newHands[playerIdx].length === 0) {
      setPhase('over')
      setMessage(`Player ${playerIdx + 1} wins!`)
      return
    }

    let nextDir = direction
    if (card.unoValue === 'Reverse') nextDir = direction * -1
    setDirection(nextDir)

    let next = ((playerIdx + (card.unoValue === 'Skip' ? nextDir * 2 : nextDir)) % 4 + 4) % 4

    if (card.unoValue === 'Draw Two') {
      const target = ((playerIdx + nextDir) % 4 + 4) % 4
      const drawn = drawPile.slice(0, 2)
      setDrawPile(drawPile.slice(2))
      const nh = [...newHands]
      nh[target] = [...nh[target], ...drawn]
      setHands(nh)
      next = ((target + nextDir) % 4 + 4) % 4
    }

    if (card.unoValue === 'Wild Draw Four') {
      const target = ((playerIdx + nextDir) % 4 + 4) % 4
      const drawn = drawPile.slice(0, 4)
      setDrawPile(drawPile.slice(4))
      const nh = [...newHands]
      nh[target] = [...nh[target], ...drawn]
      setHands(nh)
      next = ((target + nextDir) % 4 + 4) % 4
    }

    setCurrentPlayer(next)
    if (next !== 0) {
      setTimeout(() => aiTurn(next, newHands, playedCard, nextDir), 500)
    } else {
      setMessage('Your turn. Press 1-9 to play, [d] to draw.')
    }
  }

  const aiTurn = (
    playerIdx: number,
    currentHands: UnoCard[][],
    topCard: UnoCard,
    dir: number,
  ) => {
    const hand = currentHands[playerIdx]
    const playable = hand.findIndex(
      (c) => c.isWild || c.color === topCard.color || c.unoValue === topCard.unoValue
    )

    if (playable >= 0) {
      playCard(playerIdx, playable)
    } else {
      // Draw a card
      if (drawPile.length > 0) {
        const drawn = drawPile[0]
        setDrawPile((dp) => dp.slice(1))
        const nh = currentHands.map((h, i) =>
          i === playerIdx ? [...h, drawn] : h
        )
        setHands(nh)
      }

      const next = ((playerIdx + dir) % 4 + 4) % 4
      setCurrentPlayer(next)
      if (next !== 0) {
        setTimeout(() => aiTurn(next, currentHands, topCard, dir), 500)
      } else {
        setMessage('Your turn. Press 1-9 to play, [d] to draw.')
      }
    }
  }

  const drawCard = () => {
    if (drawPile.length === 0) {
      setMessage('No cards to draw.')
      return
    }
    const card = drawPile[0]
    setDrawPile(drawPile.slice(1))
    const nh = hands.map((h, i) => (i === 0 ? [...h, card] : h))
    setHands(nh)
    setMessage('Drew a card. Press 1-9 to play, [d] to draw again.')
  }

  useInput((input) => {
    if (phase === 'over' || currentPlayer !== 0) return
    const idx = Number.parseInt(input, 10)
    if (idx >= 1 && idx <= 9) playCard(0, idx - 1)
    if (input === 'd') drawCard()
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Uno</Text>
      {currentCard && (
        <Box>
          <Text>Current: </Text>
          <CustomCard {...currentCard} />
        </Box>
      )}
      <Text>Your hand ({hands[0].length}):</Text>
      <Box gap={1} flexWrap="wrap">
        {hands[0].map((card, i) => (
          <Box key={card.id} flexDirection="column">
            <Text dimColor>{i + 1}</Text>
            <CustomCard {...card} />
          </Box>
        ))}
      </Box>
      {hands.slice(1).map((hand, i) => (
        <Text key={i}>Player {i + 2}: {hand.length} cards</Text>
      ))}
      <Text>Draw pile: {drawPile.length}</Text>
      <Text>{message}</Text>
      {phase === 'over' && <Text color="green">Game Over!</Text>}
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <UnoGame />
  </DeckProvider>
)

export default App
```

## Key Concepts

- `CustomCard` component renders Uno cards with `title`, `borderColor`, `textColor`, `size`
- Custom `UnoCard` type extends `CustomCardProps` with `color`, `unoValue`, `isWild`
- Each card has a unique `id` (required for all `TCard` types)
- Deck is built and shuffled locally — Uno uses a custom deck, not a standard 52-card deck
- `DeckProvider` wraps the app for context even though cards are managed in local state
- AI opponents play automatically with `setTimeout` for turn delays
- Special cards (Skip, Reverse, Draw Two, Wild) modify game flow
