# Blackjack

A single-player Blackjack implementation using `ink-playing-cards` and Ink.

## Overview

The player competes against the dealer. Goal: get a hand value closer to 21 than the dealer without going over.

## Implementation

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  Card,
  CardStack,
  type TCard,
  isStandardCard,
} from 'ink-playing-cards'

// Calculate hand value, handling Aces as 11 or 1
const calculateScore = (cards: TCard[]): number => {
  let score = 0
  let aces = 0

  for (const card of cards) {
    if (!isStandardCard(card)) continue
    if (card.value === 'A') {
      aces++
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      score += 10
    } else {
      score += Number.parseInt(card.value, 10)
    }
  }

  for (let i = 0; i < aces; i++) {
    score += score + 11 <= 21 ? 11 : 1
  }

  return score
}

const BlackjackGame = () => {
  const { deck, hands, shuffle, draw, reset } = useDeck()
  const [phase, setPhase] = useState<'deal' | 'playing' | 'dealer' | 'over'>('deal')
  const [message, setMessage] = useState('')

  const playerHand = hands['player'] ?? []
  const dealerHand = hands['dealer'] ?? []
  const playerScore = calculateScore(playerHand)
  const dealerScore = calculateScore(dealerHand)

  // Deal initial hands
  useEffect(() => {
    shuffle()
    draw(2, 'player')
    draw(2, 'dealer')
    setPhase('playing')
  }, [])

  // Check for bust after each draw
  useEffect(() => {
    if (phase === 'playing' && playerScore > 21) {
      setPhase('over')
      setMessage('Bust! You lose.')
    }
  }, [playerScore, phase])

  const hit = () => {
    if (phase === 'playing') {
      draw(1, 'player')
    }
  }

  const stand = () => {
    if (phase !== 'playing') return
    setPhase('dealer')

    // Dealer draws until 17+
    const dealerDraw = () => {
      const score = calculateScore(hands['dealer'] ?? [])
      if (score < 17 && deck.length > 0) {
        draw(1, 'dealer')
      }
    }

    dealerDraw()
  }

  // Resolve dealer turn
  useEffect(() => {
    if (phase !== 'dealer') return
    if (dealerScore < 17 && deck.length > 0) {
      draw(1, 'dealer')
      return
    }

    // Dealer done drawing — resolve
    if (dealerScore > 21) {
      setMessage('Dealer busts! You win!')
    } else if (dealerScore >= playerScore) {
      setMessage('Dealer wins!')
    } else {
      setMessage('You win!')
    }

    setPhase('over')
  }, [dealerScore, phase])

  const newGame = () => {
    reset()
    setMessage('')
    setPhase('deal')
    setTimeout(() => {
      shuffle()
      draw(2, 'player')
      draw(2, 'dealer')
      setPhase('playing')
    }, 0)
  }

  useInput((input) => {
    if (phase === 'playing') {
      if (input === 'h') hit()
      if (input === 's') stand()
    }

    if (phase === 'over' && input === 'n') {
      newGame()
    }
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Blackjack</Text>
      <Text>
        Dealer ({phase === 'playing' ? '?' : dealerScore}):
      </Text>
      <Box gap={1}>
        {dealerHand.map((card, i) =>
          isStandardCard(card) ? (
            <Card
              key={card.id}
              id={card.id}
              suit={card.suit}
              value={card.value}
              faceUp={i === 0 || phase !== 'playing'}
              variant="simple"
            />
          ) : null
        )}
      </Box>
      <Text>You ({playerScore}):</Text>
      <CardStack cards={playerHand} name="Player" isFaceUp variant="simple" maxDisplay={10} />
      {message ? <Text color="yellow">{message}</Text> : null}
      {phase === 'playing' && <Text>[h] Hit | [s] Stand</Text>}
      {phase === 'over' && <Text>[n] New game</Text>}
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <BlackjackGame />
  </DeckProvider>
)

export default App
```

## Key Concepts

- `useDeck` provides `deck`, `hands`, `shuffle`, `draw`, `reset`
- `draw(count, playerId)` dispatches an action — cards appear in `hands['playerId']` after re-render
- `hands` is `Record<string, TCard[]>` — access with bracket notation
- `isStandardCard(card)` type guard to safely access `suit` and `value`
- Individual `Card` components for the dealer (to control face-up/down per card)
- `CardStack` for the player hand (all face up)
- Game phases managed with local `useState`
