# President

A four-player President (a.k.a. Scum) implementation using `ink-playing-cards` and Ink — you against three CPU opponents. A **climbing/shedding** game: each play must be a same-rank group matching the size of the last play, at an equal-or-higher rank, until everyone passes and the pile clears.

_Mechanics highlighted: rank-climbing (not suit-matching), variable-size group plays (singles, pairs, triples...), pass-around with pile reset, first-to-empty-hand wins._

> Simplification: only the "first player out becomes President" moment is tracked — the full President/Vice-President/Scum ranking and card-passing between winners and losers of the *next* hand is skipped. Group validation, rank order (3 low, 2 high), and the pass/reset loop are real.

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
} from 'ink-playing-cards'

const PLAYER = 'player'
const WEST = 'west'
const NORTH = 'north'
const EAST = 'east'
const ORDER = [PLAYER, WEST, NORTH, EAST]
const NAMES: Record<string, string> = { player: 'You', west: 'West', north: 'North', east: 'East' }

// President ranks climb 3 (low) up to 2 (high) — Aces sit just below 2s.
const RANKS: TCardValue[] = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2']
const rankOf = (v: TCardValue) => RANKS.indexOf(v)
const getValue = (c: TCard): TCardValue | undefined => (isStandardCard(c) ? c.value : undefined)

const groupByRank = (hand: TCard[]): Map<TCardValue, TCard[]> => {
  const groups = new Map<TCardValue, TCard[]>()
  for (const card of hand) {
    const v = getValue(card)
    if (!v) continue
    groups.set(v, [...(groups.get(v) ?? []), card])
  }
  return groups
}

type Pile = { rank: TCardValue; cards: TCard[] } | null

const PresidentGame: React.FC = () => {
  const { shuffle, deal } = useDeck()
  const { hand: playerHand, playCard: playCardPlayer } = useHand(PLAYER)
  const { hand: westHand, playCard: playCardWest } = useHand(WEST)
  const { hand: northHand, playCard: playCardNorth } = useHand(NORTH)
  const { hand: eastHand, playCard: playCardEast } = useHand(EAST)

  const hands: Record<string, TCard[]> = { player: playerHand, west: westHand, north: northHand, east: eastHand }
  const playFns: Record<string, (id: string) => void> = {
    player: playCardPlayer,
    west: playCardWest,
    north: playCardNorth,
    east: playCardEast,
  }

  const [dealt, setDealt] = useState(false)
  const [turnIndex, setTurnIndex] = useState(0)
  const [pile, setPile] = useState<Pile>(null)
  const [passedSince, setPassedSince] = useState<Set<string>>(new Set())
  const [lastPlayerId, setLastPlayerId] = useState<string>(PLAYER)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [message, setMessage] = useState('Dealing...')
  const [winner, setWinner] = useState<string | null>(null)

  useEffect(() => {
    shuffle()
    const timer = setTimeout(() => {
      deal(13, ORDER)
      setDealt(true)
      setMessage('You lead — play any same-rank group.')
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const currentPlayer = ORDER[turnIndex]

  const advanceTurn = () => setTurnIndex((i) => (i + 1) % ORDER.length)

  const applyPlay = (playerId: string, cards: TCard[]) => {
    for (const card of cards) playFns[playerId](card.id)
    const rank = getValue(cards[0])!
    setPile({ rank, cards })
    setPassedSince(new Set())
    setLastPlayerId(playerId)
    setMessage(`${NAMES[playerId]} plays ${cards.length}x ${rank}.`)

    if (hands[playerId].length - cards.length === 0) {
      setWinner(playerId)
      return
    }

    if (rank === '2') {
      // 2s can't be beaten — the pile clears immediately and the same player leads again.
      setPile(null)
      setPassedSince(new Set())
      setMessage((m) => `${m} 2s reset the pile — ${NAMES[playerId]} leads again.`)
      return
    }

    advanceTurn()
  }

  const applyPass = (playerId: string) => {
    setMessage(`${NAMES[playerId]} passes.`)
    const next = new Set(passedSince)
    next.add(playerId)
    if (next.size >= ORDER.length - 1) {
      setPile(null)
      setPassedSince(new Set())
      setTurnIndex(ORDER.indexOf(lastPlayerId))
      setMessage((m) => `${m} Everyone else passed — ${NAMES[lastPlayerId]} leads again.`)
    } else {
      setPassedSince(next)
      advanceTurn()
    }
  }

  // CPU turn: play the lowest valid group, or pass.
  useEffect(() => {
    if (!dealt || winner || currentPlayer === PLAYER) return
    const timer = setTimeout(() => {
      const hand = hands[currentPlayer]
      const groups = groupByRank(hand)
      let best: TCard[] | null = null
      for (const [rank, cards] of groups) {
        if (pile && (cards.length < pile.cards.length || rankOf(rank) <= rankOf(pile.rank))) continue
        if (!pile && cards.length === 0) continue
        const size = pile ? pile.cards.length : 1
        if (cards.length < size) continue
        if (!best || rankOf(rank) < rankOf(getValue(best[0])!)) best = cards.slice(0, size)
      }
      if (best) applyPlay(currentPlayer, best)
      else if (pile) applyPass(currentPlayer)
      else {
        // Must lead something — play a single lowest card.
        const lowest = hand.reduce((low, c) => (rankOf(getValue(c)!) < rankOf(getValue(low)!) ? c : low))
        applyPlay(currentPlayer, [lowest])
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [dealt, winner, currentPlayer, pile])

  const toggleSelect = (cardId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }

  useInput((input, key) => {
    if (!dealt || winner || currentPlayer !== PLAYER) return

    if (key.leftArrow) setSelectedIndex((i) => Math.max(0, i - 1))
    else if (key.rightArrow) setSelectedIndex((i) => Math.min(playerHand.length - 1, i + 1))
    else if (input === ' ' && playerHand[selectedIndex]) toggleSelect(playerHand[selectedIndex].id)
    else if (input === 'p') {
      if (!pile) {
        setMessage('You must lead — select a group and press Enter.')
        return
      }
      setSelected(new Set())
      applyPass(PLAYER)
    } else if (key.return) {
      const cards = playerHand.filter((c) => selected.has(c.id))
      if (cards.length === 0) {
        setMessage('Select at least one card (space) first.')
        return
      }
      const rank = getValue(cards[0])
      if (!cards.every((c) => getValue(c) === rank)) {
        setMessage('All selected cards must share the same rank.')
        return
      }
      if (pile && (cards.length !== pile.cards.length || rankOf(rank!) <= rankOf(pile.rank))) {
        setMessage(`Must play exactly ${pile.cards.length} card(s) ranked above ${pile.rank}.`)
        return
      }
      setSelected(new Set())
      applyPlay(PLAYER, cards)
    }
  })

  useEffect(() => {
    if (selectedIndex >= playerHand.length) setSelectedIndex(Math.max(0, playerHand.length - 1))
  }, [playerHand.length])

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>President</Text>
      <Text> </Text>
      <Box gap={2}>
        {ORDER.map((id) => (
          <Text key={id} color={id === currentPlayer ? 'yellow' : undefined}>
            {NAMES[id]}: {hands[id].length}
          </Text>
        ))}
      </Box>
      <Text> </Text>
      <Text>{message}</Text>
      <Text> </Text>

      <Box gap={1}>
        <Text dimColor>Pile:</Text>
        {pile ? (
          pile.cards.map((card) =>
            isStandardCard(card) ? (
              <Card key={card.id} id={card.id} suit={card.suit} value={card.value} faceUp variant="simple" />
            ) : null
          )
        ) : (
          <Text dimColor>(empty — next play leads)</Text>
        )}
      </Box>
      <Text> </Text>

      <Box gap={1}>
        {playerHand.map((card, i) =>
          isStandardCard(card) ? (
            <Box key={card.id} flexDirection="column" alignItems="center">
              <Card id={card.id} suit={card.suit} value={card.value} faceUp variant="simple" />
              <Text color={selected.has(card.id) ? 'green' : i === selectedIndex ? 'yellow' : undefined}>
                {selected.has(card.id) ? '✓' : i === selectedIndex ? '▲' : ' '}
              </Text>
            </Box>
          ) : null
        )}
      </Box>

      {!winner && currentPlayer === PLAYER && (
        <Text dimColor>← → select · space toggle · Enter play group · p pass</Text>
      )}
      {winner && <Text bold>{NAMES[winner]} is out first — President!</Text>}
    </Box>
  )
}

const App: React.FC = () => (
  <DeckProvider>
    <PresidentGame />
  </DeckProvider>
)

render(<App />)
```
</content>
