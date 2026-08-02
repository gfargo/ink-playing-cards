# Rummy

A two-player Rummy implementation using `ink-playing-cards` and Ink — draw, meld sets or runs, discard. Demonstrates **melding**, a mechanic none of the other examples cover.

_Mechanics highlighted: meld detection (sets of equal rank, runs of consecutive same-suit cards), draw/discard turn structure._

> Simplification: the library's zone primitives only move cards *out of* a hand (`playCard`, `discard`), so there's no built-in "meld zone" — melded cards are moved to the shared play area via `playCard` and then grouped and labeled locally in React state (the same technique `go-fish.md` uses to model a mechanic the reducer doesn't have a dedicated action for). Players always draw from the stock pile, never the discard pile.

## Full Implementation

```tsx
import React, { useState, useEffect } from 'react'
import { render, Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  useHand,
  Card,
  MiniCard,
  isStandardCard,
  type TCard,
  type TCardValue,
  type TSuit,
} from 'ink-playing-cards'

const PLAYER = 'player'
const CPU = 'cpu'

const RANKS: TCardValue[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const rankIndex = (v: TCardValue) => RANKS.indexOf(v)
const getValue = (card: TCard): TCardValue | undefined => (isStandardCard(card) ? card.value : undefined)
const cardPoints = (v: TCardValue) => (v === 'A' ? 1 : ['J', 'Q', 'K'].includes(v) ? 10 : Number(v))

const isValidMeld = (cards: TCard[]): boolean => {
  if (cards.length < 3) return false
  const values = cards.map((c) => getValue(c))
  if (values.every((v) => v && v === values[0])) return true
  if (!cards.every((c) => isStandardCard(c))) return false
  const suits = new Set(cards.map((c) => (isStandardCard(c) ? c.suit : '')))
  if (suits.size !== 1) return false
  const ranks = cards.map((c) => rankIndex(getValue(c)!)).sort((a, b) => a - b)
  return ranks.every((r, i) => i === 0 || r === ranks[i - 1] + 1)
}

// Greedy meld finder for the CPU: pull out same-rank sets first, then
// same-suit runs from what's left. Not optimal, just good enough to shed cards.
const findMelds = (hand: TCard[]): { melds: TCard[][]; remaining: TCard[] } => {
  let pool = [...hand]
  const melds: TCard[][] = []

  const byValue = new Map<TCardValue, TCard[]>()
  for (const c of pool) {
    const v = getValue(c)
    if (v) byValue.set(v, [...(byValue.get(v) ?? []), c])
  }
  for (const group of byValue.values()) {
    if (group.length >= 3) {
      melds.push(group)
      pool = pool.filter((c) => !group.includes(c))
    }
  }

  const bySuit = new Map<TSuit, TCard[]>()
  for (const c of pool) {
    if (isStandardCard(c)) bySuit.set(c.suit, [...(bySuit.get(c.suit) ?? []), c])
  }
  for (const cards of bySuit.values()) {
    const sorted = [...cards].sort((a, b) => rankIndex(getValue(a)!) - rankIndex(getValue(b)!))
    let run: TCard[] = []
    const flush = () => {
      if (run.length >= 3) {
        melds.push(run)
        pool = pool.filter((c) => !run.includes(c))
      }
      run = []
    }
    for (const card of sorted) {
      if (run.length === 0) {
        run.push(card)
        continue
      }
      const prevRank = rankIndex(getValue(run[run.length - 1])!)
      const rank = rankIndex(getValue(card)!)
      if (rank === prevRank + 1) run.push(card)
      else {
        flush()
        run.push(card)
      }
    }
    flush()
  }

  return { melds, remaining: pool }
}

type Phase = 'dealing' | 'playing' | 'done'

const RummyGame: React.FC = () => {
  const { deck, shuffle, deal, draw } = useDeck()
  const { hand: playerHand, playCard: playerPlayCard, discard: playerDiscard } = useHand(PLAYER)
  const { hand: cpuHand, playCard: cpuPlayCard, discard: cpuDiscard } = useHand(CPU)

  const [phase, setPhase] = useState<Phase>('dealing')
  const [turn, setTurn] = useState<'player' | 'cpu'>('player')
  const [hasDrawn, setHasDrawn] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [playerMelds, setPlayerMelds] = useState<TCard[][]>([])
  const [cpuMelds, setCpuMelds] = useState<TCard[][]>([])
  const [message, setMessage] = useState('Dealing...')

  useEffect(() => {
    shuffle()
    const timer = setTimeout(() => {
      deal(7, [PLAYER, CPU])
      setPhase('playing')
      setMessage('Your turn — you drew a card. Space to select for a meld, m to meld, Enter to discard.')
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  // Draw at the start of the player's turn.
  useEffect(() => {
    if (phase !== 'playing' || turn !== 'player' || hasDrawn) return
    draw(1, PLAYER)
    setHasDrawn(true)
  }, [phase, turn, hasDrawn])

  // Full CPU turn: draw, greedily meld, discard the highest-value leftover card.
  // The card about to be drawn is known ahead of time (top of `deck`), so the
  // whole turn can be resolved from local values instead of chaining effects
  // across several renders.
  useEffect(() => {
    if (phase !== 'playing' || turn !== 'cpu') return
    const timer = setTimeout(() => {
      const drawnCard = deck[deck.length - 1]
      if (!drawnCard) {
        setTurn('player')
        setHasDrawn(false)
        return
      }
      draw(1, CPU)
      const simulatedHand = [...cpuHand, drawnCard]
      const { melds, remaining } = findMelds(simulatedHand)
      for (const card of melds.flat()) cpuPlayCard(card.id)
      if (melds.length > 0) setCpuMelds((m) => [...m, ...melds])

      if (remaining.length === 0) {
        setMessage('CPU melded its entire hand — CPU wins!')
        setPhase('done')
        return
      }

      const worst = remaining.reduce((w, c) => (cardPoints(getValue(c)!) > cardPoints(getValue(w)!) ? c : w))
      setTimeout(() => {
        cpuDiscard(worst.id)
        if (remaining.length - 1 === 0) {
          setMessage(`CPU melded ${melds.length} group(s), discarded ${getValue(worst)}, and went out — CPU wins!`)
          setPhase('done')
          return
        }
        setMessage(`CPU melded ${melds.length} group(s) and discarded ${getValue(worst)}.`)
        setTurn('player')
        setHasDrawn(false)
      }, 500)
    }, 600)
    return () => clearTimeout(timer)
  }, [phase, turn])

  const toggleSelect = (cardId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }

  const attemptMeld = () => {
    const cards = playerHand.filter((c) => selected.has(c.id))
    if (!isValidMeld(cards)) {
      setMessage('Not a valid meld — needs 3+ of a rank, or 3+ consecutive same-suit cards.')
      return
    }
    for (const card of cards) playerPlayCard(card.id)
    setPlayerMelds((m) => [...m, cards])
    setSelected(new Set())
    setMessage(`Melded ${cards.length} cards!`)
    if (playerHand.length - cards.length === 0) {
      setMessage('You melded your entire hand — you win!')
      setPhase('done')
    }
  }

  const discardAndPass = (card: TCard) => {
    playerDiscard(card.id)
    if (playerHand.length - 1 === 0) {
      setMessage(`You discarded ${getValue(card)} and went out — you win!`)
      setPhase('done')
      return
    }
    setMessage(`You discarded ${getValue(card)}. CPU's turn.`)
    setTurn('cpu')
    setHasDrawn(false)
    setSelected(new Set())
  }

  useInput((input, key) => {
    if (phase !== 'playing' || turn !== 'player' || !hasDrawn || playerHand.length === 0) return

    if (key.leftArrow) setSelectedIndex((i) => Math.max(0, i - 1))
    else if (key.rightArrow) setSelectedIndex((i) => Math.min(playerHand.length - 1, i + 1))
    else if (input === ' ') toggleSelect(playerHand[selectedIndex].id)
    else if (input === 'm') attemptMeld()
    else if (key.return) {
      if (selected.size > 0) {
        setMessage('Clear your meld selection (space) before discarding.')
        return
      }
      discardAndPass(playerHand[selectedIndex])
    }
  })

  useEffect(() => {
    if (selectedIndex >= playerHand.length) setSelectedIndex(Math.max(0, playerHand.length - 1))
  }, [playerHand.length])

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Rummy</Text>
      <Text> </Text>
      <Box gap={2}>
        <Text>Stock: {deck.length}</Text>
        <Text>CPU hand: {cpuHand.length}</Text>
      </Box>
      <Text> </Text>
      <Text>{message}</Text>
      <Text> </Text>

      {cpuMelds.map((group, i) => (
        <Box key={`cpu-meld-${i}`} gap={1}>
          <Text dimColor>CPU meld {i + 1}:</Text>
          {group.map((card) =>
            isStandardCard(card) ? (
              <MiniCard key={card.id} id={card.id} suit={card.suit} value={card.value} faceUp />
            ) : null
          )}
        </Box>
      ))}

      {playerMelds.map((group, i) => (
        <Box key={`player-meld-${i}`} gap={1}>
          <Text dimColor>Your meld {i + 1}:</Text>
          {group.map((card) =>
            isStandardCard(card) ? (
              <MiniCard key={card.id} id={card.id} suit={card.suit} value={card.value} faceUp />
            ) : null
          )}
        </Box>
      ))}
      <Text> </Text>

      <Box gap={1}>
        {playerHand.map((card, i) =>
          isStandardCard(card) ? (
            <Box key={card.id} flexDirection="column" alignItems="center">
              <Card id={card.id} suit={card.suit} value={card.value} faceUp variant="simple" />
              <Text color={selected.has(card.id) ? 'green' : i === selectedIndex ? 'yellow' : undefined}>
                {selected.has(card.id) ? '✓ selected' : i === selectedIndex ? '▲ cursor' : ' '}
              </Text>
            </Box>
          ) : null
        )}
      </Box>

      {phase === 'playing' && turn === 'player' && (
        <Text dimColor>← → select · space toggle · m meld selected · Enter discard cursor card</Text>
      )}
    </Box>
  )
}

const App: React.FC = () => (
  <DeckProvider>
    <RummyGame />
  </DeckProvider>
)

render(<App />)
```
</content>
