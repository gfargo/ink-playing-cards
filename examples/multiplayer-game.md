# Multiplayer Game

A simple multiplayer card game where players take turns drawing cards. First player to collect all four suits wins.

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

const PLAYER_IDS = ['alice', 'bob', 'charlie']
const PLAYER_NAMES: Record<string, string> = {
  alice: 'Alice',
  bob: 'Bob',
  charlie: 'Charlie',
}

const MultiplayerGame = () => {
  const { deck, hands, shuffle, draw, addPlayer } = useDeck()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [winner, setWinner] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    for (const id of PLAYER_IDS) {
      addPlayer(id)
    }
    shuffle()
    setInitialized(true)
    setMessage('Press [space] to draw a card.')
  }, [])

  const currentId = PLAYER_IDS[currentIdx]
  const currentName = PLAYER_NAMES[currentId]

  const checkWin = (playerId: string): boolean => {
    const hand = hands[playerId] ?? []
    const suits = new Set(
      hand.filter(isStandardCard).map((c) => c.suit)
    )
    return suits.size === 4
  }

  const drawAndCheck = () => {
    if (winner || deck.length === 0) return
    draw(1, currentId)
  }

  // Check for winner after hands update
  useEffect(() => {
    if (!initialized || winner) return
    const hand = hands[currentId] ?? []
    if (hand.length === 0) return

    if (checkWin(currentId)) {
      setWinner(currentId)
      setMessage(`${currentName} wins!`)
    } else {
      setCurrentIdx((currentIdx + 1) % PLAYER_IDS.length)
      const nextName = PLAYER_NAMES[PLAYER_IDS[(currentIdx + 1) % PLAYER_IDS.length]]
      setMessage(`${nextName}'s turn. Press [space] to draw.`)
    }
  }, [hands])

  useInput((input) => {
    if (input === ' ' && !winner) {
      drawAndCheck()
    }
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Suit Collector — First to all 4 suits wins!</Text>
      {PLAYER_IDS.map((id) => {
        const hand = hands[id] ?? []
        return (
          <Box key={id} flexDirection="column">
            <Text>
              {PLAYER_NAMES[id]} ({hand.length} cards)
              {id === currentId && !winner ? ' ← current' : ''}
              {id === winner ? ' 🏆' : ''}
            </Text>
            {hand.length > 0 && (
              <CardStack
                cards={hand}
                name={PLAYER_NAMES[id]}
                isFaceUp
                variant="mini"
                maxDisplay={8}
              />
            )}
          </Box>
        )
      })}
      <Text>Deck: {deck.length} cards remaining</Text>
      <Text>{message}</Text>
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <MultiplayerGame />
  </DeckProvider>
)

export default App
```

## Key Concepts

- `addPlayer(id)` registers players with the `DeckProvider` before drawing
- `draw(count, playerId)` dispatches an action — cards appear in `hands[playerId]` after re-render
- `hands` is `Record<string, TCard[]>` — access with bracket notation
- `isStandardCard(card)` type guard for safe access to `suit` and `value`
- `CardStack` displays each player's hand compactly
- Turn management via local `useState` index cycling through player IDs
- `deck.length` to check remaining cards (not `deck.cards.length`)
