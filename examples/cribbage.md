# Cribbage

A two-player Cribbage implementation using `ink-playing-cards` and Ink, focused on the two mechanics no other example touches: **pegging** (scoring points as cards are played, up to a running count of 31) and **15/pair/run hand scoring**.

_Mechanics highlighted: pegging, combinatorial hand scoring (fifteens, pairs, runs)._

> Simplifications: the crib/discard phase is skipped (each player keeps a 4-card hand instead of cutting 6 down to 4), and run-scoring doesn't multiply for duplicate-rank "double runs" the way full Cribbage rules do. The pegging and hand-scoring math itself is real, including fifteens, pairs, runs, flushes (4 in hand, 5 if the starter matches), and "his nobs" (holding the jack of the starter's suit).

## Full Implementation

```tsx
import React, { useState, useEffect, useCallback } from 'react'
import { render, Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  useHand,
  CardStack,
  isStandardCard,
  type TCard,
  type TCardValue,
} from 'ink-playing-cards'

const PLAYER = 'player'
const CPU = 'cpu'
const STARTER = 'starter'

type Phase = 'dealing' | 'pegging' | 'scoring' | 'done'

const RANKS: TCardValue[] = [
  'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K',
]
const rankIndex = (v: TCardValue) => RANKS.indexOf(v)
const cardPoints = (v: TCardValue) =>
  v === 'A' ? 1 : ['J', 'Q', 'K'].includes(v) ? 10 : Number(v)

// Count every subset of the hand that sums to 15 — worth 2 pegging points each.
const scoreFifteens = (values: TCardValue[]): number => {
  let hits = 0
  const n = values.length
  for (let mask = 1; mask < 1 << n; mask++) {
    let sum = 0
    for (let i = 0; i < n; i++) if (mask & (1 << i)) sum += cardPoints(values[i])
    if (sum === 15) hits++
  }
  return hits * 2
}

const scorePairs = (values: TCardValue[]): number => {
  let points = 0
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      if (values[i] === values[j]) points += 2
    }
  }
  return points
}

// Simplified: longest contiguous run of unique ranks (no double-run multiplier).
const scoreRuns = (values: TCardValue[]): number => {
  const ranks = [...new Set(values.map(rankIndex))].sort((a, b) => a - b)
  let best = 1
  let run = 1
  for (let i = 1; i < ranks.length; i++) {
    if (ranks[i] === ranks[i - 1] + 1) {
      run++
    } else {
      best = Math.max(best, run)
      run = 1
    }
  }
  return Math.max(best, run) >= 3 ? Math.max(best, run) : 0
}

// 4 points if all hand cards share a suit, 5 if the starter matches it too.
const scoreFlush = (handCards: TCard[], starter: TCard): number => {
  if (!handCards.every((c) => isStandardCard(c))) return 0
  const suits = handCards.map((c) => (isStandardCard(c) ? c.suit : undefined))
  if (!suits.every((s) => s === suits[0])) return 0
  return isStandardCard(starter) && starter.suit === suits[0] ? 5 : 4
}

// "His nobs": 1 point for holding the jack matching the starter's suit.
const scoreNobs = (handCards: TCard[], starter: TCard): number => {
  if (!isStandardCard(starter)) return 0
  const hasNobs = handCards.some((c) => isStandardCard(c) && c.value === 'J' && c.suit === starter.suit)
  return hasNobs ? 1 : 0
}

const scoreHand = (handCards: TCard[], starter: TCard): number => {
  const values = [...handCards.map((c) => getValue(c)!), getValue(starter)!]
  return (
    scoreFifteens(values) +
    scorePairs(values) +
    scoreRuns(values) +
    scoreFlush(handCards, starter) +
    scoreNobs(handCards, starter)
  )
}

// Points earned by the card that was JUST added to the current pegging run.
const scorePeg = (played: TCardValue[], count: number) => {
  const notes: string[] = []
  let points = 0

  if (count === 15) {
    points += 2
    notes.push('15')
  }
  if (count === 31) {
    points += 2
    notes.push('31')
  }

  let matchLen = 1
  for (let i = played.length - 1; i > 0 && played[i] === played[i - 1]; i--) matchLen++
  if (matchLen === 2) {
    points += 2
    notes.push('pair')
  } else if (matchLen === 3) {
    points += 6
    notes.push('three of a kind')
  } else if (matchLen >= 4) {
    points += 12
    notes.push('four of a kind')
  }

  for (let len = Math.min(played.length, 7); len >= 3; len--) {
    const ranks = played.slice(-len).map(rankIndex).sort((a, b) => a - b)
    const isRun = ranks.every((r, i) => i === 0 || r === ranks[i - 1] + 1)
    if (isRun) {
      points += len
      notes.push(`run of ${len}`)
      break
    }
  }

  return { points, reason: notes.join(' + ') }
}

const getValue = (card: TCard): TCardValue | undefined =>
  isStandardCard(card) ? card.value : undefined

const CribbageGame: React.FC = () => {
  const { shuffle, deal, draw } = useDeck()
  const { hand: playerHand, playCard: playerPlayCard } = useHand(PLAYER)
  const { hand: cpuHand, playCard: cpuPlayCard } = useHand(CPU)
  const { hand: starterHand } = useHand(STARTER)

  const [phase, setPhase] = useState<Phase>('dealing')
  const [turn, setTurn] = useState<'player' | 'cpu'>('player')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [message, setMessage] = useState('Dealing...')
  const [handSnapshot, setHandSnapshot] = useState<{ player: TCard[]; cpu: TCard[] }>({
    player: [],
    cpu: [],
  })
  const [roundPlayed, setRoundPlayed] = useState<TCard[]>([])
  const [count, setCount] = useState(0)
  const [pegPoints, setPegPoints] = useState({ player: 0, cpu: 0 })
  const [handPoints, setHandPoints] = useState({ player: 0, cpu: 0 })
  const [lastPlayer, setLastPlayer] = useState<'player' | 'cpu' | null>(null)

  useEffect(() => {
    shuffle()
    const timer = setTimeout(() => {
      deal(4, [PLAYER, CPU])
      setTimeout(() => draw(1, STARTER), 50)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  // Snapshot the dealt hands before pegging empties them — hand scoring needs
  // the original 4 cards even after they've all been played to the table.
  useEffect(() => {
    if (
      phase === 'dealing' &&
      playerHand.length === 4 &&
      cpuHand.length === 4 &&
      starterHand.length === 1
    ) {
      setHandSnapshot({ player: [...playerHand], cpu: [...cpuHand] })
      setPhase('pegging')
      setMessage('Pegging — play a card without pushing the count past 31.')
    }
  }, [phase, playerHand, cpuHand, starterHand])

  const canPlay = (hand: TCard[]) =>
    hand.some((c) => {
      const v = getValue(c)
      return v !== undefined && count + cardPoints(v) <= 31
    })

  const playFrom = useCallback(
    (who: 'player' | 'cpu', card: TCard) => {
      const value = getValue(card)
      if (!value) return
      const newRound = [...roundPlayed, card]
      const newCount = count + cardPoints(value)
      const { points, reason } = scorePeg(newRound.map((c) => getValue(c)!), newCount)

      if (who === 'player') playerPlayCard(card.id)
      else cpuPlayCard(card.id)

      setRoundPlayed(newRound)
      setCount(newCount)
      setLastPlayer(who)

      if (points > 0) {
        setPegPoints((p) => ({ ...p, [who]: p[who] + points }))
        setMessage(
          `${who === 'player' ? 'You' : 'CPU'} play ${value} (${newCount}) — ${reason} for ${points}!`
        )
      } else {
        setMessage(`${who === 'player' ? 'You' : 'CPU'} play ${value} (${newCount}).`)
      }

      if (newCount === 31) {
        setTimeout(() => {
          setRoundPlayed([])
          setCount(0)
        }, 400)
      }

      setTurn(who === 'player' ? 'cpu' : 'player')
    },
    [roundPlayed, count, playerPlayCard, cpuPlayCard]
  )

  // Handle "go" (no legal card) and move to hand-scoring once both hands are empty.
  useEffect(() => {
    if (phase !== 'pegging') return
    if (playerHand.length === 0 && cpuHand.length === 0) {
      setPhase('scoring')
      return
    }

    const hand = turn === 'player' ? playerHand : cpuHand
    if (hand.length > 0 && canPlay(hand)) return

    const otherHand = turn === 'player' ? cpuHand : playerHand
    const otherCanPlay = otherHand.length > 0 && canPlay(otherHand)
    if (otherCanPlay) {
      setMessage(`${turn === 'player' ? 'You have' : 'CPU has'} no legal card — go.`)
      setTurn(turn === 'player' ? 'cpu' : 'player')
    } else if (count > 0) {
      const timer = setTimeout(() => {
        if (lastPlayer) setPegPoints((p) => ({ ...p, [lastPlayer]: p[lastPlayer] + 1 }))
        setMessage(`Go — count resets. ${lastPlayer === 'player' ? 'You' : 'CPU'} score 1 for last card.`)
        setRoundPlayed([])
        setCount(0)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [phase, turn, playerHand, cpuHand, count, lastPlayer])

  // CPU always plays its lowest legal card.
  useEffect(() => {
    if (phase !== 'pegging' || turn !== 'cpu') return
    const legal = cpuHand.filter((c) => {
      const v = getValue(c)
      return v !== undefined && count + cardPoints(v) <= 31
    })
    if (legal.length === 0) return
    const lowest = legal.reduce((best, c) =>
      cardPoints(getValue(c)!) < cardPoints(getValue(best)!) ? c : best
    )
    const timer = setTimeout(() => playFrom('cpu', lowest), 500)
    return () => clearTimeout(timer)
  }, [phase, turn, cpuHand, count, playFrom])

  // Score both hands against the starter once pegging ends.
  useEffect(() => {
    if (phase !== 'scoring') return
    const starter = starterHand[0]
    if (!starter) return
    setHandPoints({
      player: scoreHand(handSnapshot.player, starter),
      cpu: scoreHand(handSnapshot.cpu, starter),
    })
    setPhase('done')
  }, [phase, starterHand, handSnapshot])

  useInput((input, key) => {
    if (phase !== 'pegging' || turn !== 'player' || playerHand.length === 0) return
    if (key.leftArrow) setSelectedIndex((i) => Math.max(0, i - 1))
    else if (key.rightArrow) setSelectedIndex((i) => Math.min(playerHand.length - 1, i + 1))
    else if (key.return) {
      const card = playerHand[selectedIndex]
      const value = getValue(card)
      if (value && count + cardPoints(value) <= 31) playFrom('player', card)
    }
  })

  useEffect(() => {
    if (selectedIndex >= playerHand.length) setSelectedIndex(Math.max(0, playerHand.length - 1))
  }, [playerHand.length])

  const starterValue = starterHand[0] ? getValue(starterHand[0]) : undefined
  const totalPlayer = pegPoints.player + handPoints.player
  const totalCpu = pegPoints.cpu + handPoints.cpu

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Cribbage — Pegging &amp; Hand Scoring</Text>
      <Text> </Text>
      <Box gap={2}>
        <Text>Starter: {starterValue ?? '—'}</Text>
        <Text>Count: {count}</Text>
        <Text>
          Peg — You: {pegPoints.player} CPU: {pegPoints.cpu}
        </Text>
      </Box>
      <Text> </Text>
      <Text>{message}</Text>
      <Text> </Text>

      <CardStack cards={cpuHand} name="CPU hand" isFaceUp={false} stackDirection="horizontal" maxDisplay={6} />
      <CardStack cards={roundPlayed} name="Play area" isFaceUp stackDirection="horizontal" maxDisplay={8} />
      <CardStack cards={playerHand} name="Your hand" isFaceUp stackDirection="horizontal" maxDisplay={6} />

      {phase === 'pegging' && turn === 'player' && (
        <Text dimColor>← → to select, Enter to play (count stays ≤ 31)</Text>
      )}

      {phase === 'done' && (
        <Box flexDirection="column">
          <Text> </Text>
          <Text>
            Hand scores — You: {handPoints.player} CPU: {handPoints.cpu}
          </Text>
          <Text bold>
            {totalPlayer === totalCpu
              ? "It's a tie!"
              : totalPlayer > totalCpu
                ? 'You win the hand!'
                : 'CPU wins the hand!'}
          </Text>
        </Box>
      )}
    </Box>
  )
}

const App: React.FC = () => (
  <DeckProvider>
    <CribbageGame />
  </DeckProvider>
)

render(<App />)
```
</content>
