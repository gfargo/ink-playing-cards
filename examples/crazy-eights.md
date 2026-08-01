# Crazy Eights

A two-player Crazy Eights implementation using `ink-playing-cards` and Ink — match the suit or value on top of the discard pile, or play an 8 to change the active suit on the fly.

_Mechanics highlighted: suit/value matching against a shared discard pile, wild cards that redirect play._

> Uses the library's real `discardPile` zone (via `useHand(...).discard`) as the shared table pile — no local simulation needed here, since "play a card face-up onto a shared pile" is exactly what `discard` already does.

## Full Implementation

```tsx
import React, { useState, useEffect } from 'react'
import { render, Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  useHand,
  Card,
  isStandardCard,
  type TCard,
  type TCardValue,
  type TSuit,
} from 'ink-playing-cards'

const PLAYER = 'player'
const CPU = 'cpu'
const FLIP = 'flip'

const getValue = (card: TCard): TCardValue | undefined => (isStandardCard(card) ? card.value : undefined)
const suitOf = (card: TCard): TSuit | undefined => (isStandardCard(card) ? card.suit : undefined)

const cardMatches = (card: TCard, top: TCard | undefined, activeSuit?: TSuit): boolean => {
  const value = getValue(card)
  if (value === '8') return true
  if (!top) return true
  if (activeSuit) return suitOf(card) === activeSuit || value === getValue(top)
  return suitOf(card) === suitOf(top) || value === getValue(top)
}

const SUIT_KEYS: Record<string, TSuit> = { h: 'hearts', d: 'diamonds', c: 'clubs', s: 'spades' }

type Phase = 'dealing' | 'playing' | 'done'

const CrazyEightsGame: React.FC = () => {
  const { deck, discardPile, shuffle, deal, draw } = useDeck()
  const { hand: playerHand, discard: playerDiscard } = useHand(PLAYER)
  const { hand: cpuHand, discard: cpuDiscard } = useHand(CPU)
  const { hand: flipHand, discard: flipDiscard } = useHand(FLIP)

  const [phase, setPhase] = useState<Phase>('dealing')
  const [turn, setTurn] = useState<'player' | 'cpu'>('player')
  const [activeSuit, setActiveSuit] = useState<TSuit | undefined>(undefined)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [chooseSuitMode, setChooseSuitMode] = useState(false)
  const [message, setMessage] = useState('Dealing...')

  useEffect(() => {
    shuffle()
    const timer = setTimeout(() => {
      deal(7, [PLAYER, CPU])
      setTimeout(() => draw(1, FLIP), 50)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  // Flip the starting card face-up onto the discard pile.
  useEffect(() => {
    if (phase === 'dealing' && flipHand.length === 1 && discardPile.length === 0) {
      flipDiscard(flipHand[0].id)
      setPhase('playing')
      setMessage('Match the top card by suit or value, or play an 8 to switch suits.')
    }
  }, [phase, flipHand, discardPile.length])

  const topCard = discardPile[discardPile.length - 1]

  // CPU turn: play the first matching card, drawing until one turns up
  // (or the deck runs out).
  useEffect(() => {
    if (phase !== 'playing' || turn !== 'cpu') return
    const timer = setTimeout(() => {
      const playable = cpuHand.find((c) => cardMatches(c, topCard, activeSuit))
      if (playable) {
        cpuDiscard(playable.id)
        const value = getValue(playable)
        if (value === '8') {
          const counts: Record<TSuit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 }
          for (const c of cpuHand) {
            const s = suitOf(c)
            if (s && c.id !== playable.id) counts[s]++
          }
          const bestSuit = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'spades') as TSuit
          setActiveSuit(bestSuit)
          setMessage(`CPU plays an 8 and calls ${bestSuit}.`)
        } else {
          setActiveSuit(undefined)
          setMessage(`CPU plays ${value} of ${suitOf(playable)}.`)
        }
        setTurn('player')
      } else if (deck.length > 0) {
        draw(1, CPU)
        setMessage('CPU draws a card...')
      } else {
        setMessage('CPU has no move and the deck is empty — your turn.')
        setTurn('player')
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [phase, turn, cpuHand, topCard, activeSuit, deck.length])

  useEffect(() => {
    if (phase === 'playing' && (playerHand.length === 0 || cpuHand.length === 0)) setPhase('done')
  }, [phase, playerHand.length, cpuHand.length])

  useInput((input, key) => {
    if (phase !== 'playing') return

    if (chooseSuitMode) {
      const suit = SUIT_KEYS[input.toLowerCase()]
      if (suit) {
        setActiveSuit(suit)
        setChooseSuitMode(false)
        setMessage(`You call ${suit}.`)
        setTurn('cpu')
      }
      return
    }

    if (turn !== 'player' || playerHand.length === 0) return

    if (key.leftArrow) setSelectedIndex((i) => Math.max(0, i - 1))
    else if (key.rightArrow) setSelectedIndex((i) => Math.min(playerHand.length - 1, i + 1))
    else if (input === 'd') {
      if (deck.length > 0) {
        draw(1, PLAYER)
        setMessage('You draw a card.')
      }
    } else if (input === 'x') {
      setMessage('You pass.')
      setTurn('cpu')
    } else if (key.return) {
      const card = playerHand[selectedIndex]
      if (!cardMatches(card, topCard, activeSuit)) {
        setMessage('Does not match the current suit or value.')
        return
      }
      playerDiscard(card.id)
      if (getValue(card) === '8') {
        setChooseSuitMode(true)
        setMessage('Wild 8! Press h/d/c/s to name the next suit.')
      } else {
        setActiveSuit(undefined)
        setMessage(`You play ${getValue(card)} of ${suitOf(card)}.`)
        setTurn('cpu')
      }
    }
  })

  useEffect(() => {
    if (selectedIndex >= playerHand.length) setSelectedIndex(Math.max(0, playerHand.length - 1))
  }, [playerHand.length])

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Crazy Eights</Text>
      <Text> </Text>
      <Box gap={2}>
        <Text>Deck: {deck.length}</Text>
        <Text>CPU hand: {cpuHand.length}</Text>
        {activeSuit && <Text color="yellow">Active suit: {activeSuit}</Text>}
      </Box>
      <Text> </Text>
      <Text>{message}</Text>
      <Text> </Text>

      {topCard && isStandardCard(topCard) && (
        <Box flexDirection="column" alignItems="center">
          <Text dimColor>Top of pile</Text>
          <Card id={topCard.id} suit={topCard.suit} value={topCard.value} faceUp variant="simple" />
        </Box>
      )}
      <Text> </Text>

      <Box gap={1}>
        {playerHand.map((card, i) =>
          isStandardCard(card) ? (
            <Card
              key={card.id}
              id={card.id}
              suit={card.suit}
              value={card.value}
              faceUp
              variant="simple"
              selected={i === selectedIndex}
            />
          ) : null
        )}
      </Box>

      {phase === 'playing' && turn === 'player' && !chooseSuitMode && (
        <Text dimColor>← → select · Enter play · d draw · x pass</Text>
      )}
      {chooseSuitMode && <Text dimColor>Name the suit: h=hearts d=diamonds c=clubs s=spades</Text>}
      {phase === 'done' && (
        <Text bold>{playerHand.length === 0 ? 'You win!' : 'CPU wins!'}</Text>
      )}
    </Box>
  )
}

const App: React.FC = () => (
  <DeckProvider>
    <CrazyEightsGame />
  </DeckProvider>
)

render(<App />)
```
</content>
