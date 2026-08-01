# Hearts

A four-player Hearts implementation using `ink-playing-cards` and Ink — you against three CPU opponents, standard 52-card deck, no trump suit. Demonstrates trick-taking where the goal is to **avoid** points rather than win them.

_Mechanics highlighted: multi-player trick-taking, suit-following, penalty-point avoidance scoring._

> Simplifications: the pre-play card-passing phase is skipped, the player always leads the first trick (instead of whoever holds the 2♣), and hearts may be led at any time (no "hearts broken" restriction). Suit-following, trick resolution, and penalty scoring (1 per heart, 13 for Q♠) are real.

## Full Implementation

```tsx
import React, { useState, useEffect } from 'react'
import { render, Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  useHand,
  CardStack,
  Card,
  isStandardCard,
  type TCard,
  type TSuit,
} from 'ink-playing-cards'

const PLAYER = 'player'
const WEST = 'west'
const NORTH = 'north'
const EAST = 'east'
const ORDER = [PLAYER, WEST, NORTH, EAST]
const NAMES: Record<string, string> = { player: 'You', west: 'West', north: 'North', east: 'East' }

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const rankValue = (card: TCard) => (isStandardCard(card) ? RANKS.indexOf(card.value) : -1)
const suitOf = (card: TCard): TSuit | undefined => (isStandardCard(card) ? card.suit : undefined)

const penaltyOf = (card: TCard): number => {
  if (!isStandardCard(card)) return 0
  if (card.suit === 'hearts') return 1
  if (card.suit === 'spades' && card.value === 'Q') return 13
  return 0
}

type Played = { playerId: string; card: TCard }

const HeartsGame: React.FC = () => {
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
  const [trick, setTrick] = useState<Played[]>([])
  const [leaderIndex, setLeaderIndex] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({ player: 0, west: 0, north: 0, east: 0 })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [message, setMessage] = useState('Dealing...')
  const [resolving, setResolving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    shuffle()
    const timer = setTimeout(() => {
      deal(13, ORDER)
      setDealt(true)
      setMessage('Your lead — pick any card.')
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const rotation = [...ORDER.slice(leaderIndex), ...ORDER.slice(0, leaderIndex)]
  const currentPlayer = rotation[trick.length]
  const leadSuit = trick.length > 0 ? suitOf(trick[0].card) : undefined

  const validCards = (playerId: string): TCard[] => {
    const hand = hands[playerId]
    if (!leadSuit) return hand
    const followers = hand.filter((c) => suitOf(c) === leadSuit)
    return followers.length > 0 ? followers : hand
  }

  const play = (playerId: string, card: TCard) => {
    playFns[playerId](card.id)
    setTrick((t) => [...t, { playerId, card }])
  }

  // CPU auto-play: lowest legal card.
  useEffect(() => {
    if (!dealt || done || resolving || currentPlayer === PLAYER || trick.length === 4) return
    const legal = validCards(currentPlayer)
    if (legal.length === 0) return
    const lowest = legal.reduce((best, c) => (rankValue(c) < rankValue(best) ? c : best))
    const timer = setTimeout(() => play(currentPlayer, lowest), 450)
    return () => clearTimeout(timer)
  }, [dealt, done, resolving, currentPlayer, trick.length])

  // Resolve a completed trick.
  useEffect(() => {
    if (trick.length !== 4 || resolving) return
    setResolving(true)
    const timer = setTimeout(() => {
      const contenders = trick.filter((p) => suitOf(p.card) === leadSuit)
      const winner = contenders.reduce((best, p) => (rankValue(p.card) > rankValue(best.card) ? p : best))
      const points = trick.reduce((sum, p) => sum + penaltyOf(p.card), 0)
      setScores((s) => ({ ...s, [winner.playerId]: s[winner.playerId] + points }))
      setMessage(`${NAMES[winner.playerId]} takes the trick (+${points}).`)
      setLeaderIndex(ORDER.indexOf(winner.playerId))
      setTrick([])
      setResolving(false)
      if (hands[winner.playerId].length === 0 && playerHand.length === 0) setDone(true)
    }, 700)
    return () => clearTimeout(timer)
  }, [trick, resolving, leadSuit])

  useInput((input, key) => {
    if (!dealt || done || currentPlayer !== PLAYER || trick.length === 4) return
    const legal = validCards(PLAYER)
    if (key.leftArrow) setSelectedIndex((i) => Math.max(0, i - 1))
    else if (key.rightArrow) setSelectedIndex((i) => Math.min(playerHand.length - 1, i + 1))
    else if (key.return) {
      const card = playerHand[selectedIndex]
      if (legal.some((c) => c.id === card.id)) play(PLAYER, card)
      else setMessage(`Must follow suit (${leadSuit}) if you can.`)
    }
  })

  useEffect(() => {
    if (selectedIndex >= playerHand.length) setSelectedIndex(Math.max(0, playerHand.length - 1))
  }, [playerHand.length])

  const winner = Object.entries(scores).reduce((best, entry) => (entry[1] < best[1] ? entry : best))

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Hearts</Text>
      <Text> </Text>
      <Box gap={2}>
        {ORDER.map((id) => (
          <Text key={id}>
            {NAMES[id]}: {scores[id]}
          </Text>
        ))}
      </Box>
      <Text> </Text>
      <Text>{message}</Text>
      <Text> </Text>

      <Box gap={1}>
        {trick.map(({ playerId, card }) =>
          isStandardCard(card) ? (
            <Box key={card.id} flexDirection="column" alignItems="center">
              <Text dimColor>{NAMES[playerId]}</Text>
              <Card id={card.id} suit={card.suit} value={card.value} faceUp variant="simple" />
            </Box>
          ) : null
        )}
      </Box>
      <Text> </Text>

      <Text dimColor>
        West: {westHand.length} | North: {northHand.length} | East: {eastHand.length}
      </Text>
      <CardStack cards={playerHand} name="Your hand" isFaceUp stackDirection="horizontal" maxDisplay={13} />

      {!done && currentPlayer === PLAYER && trick.length < 4 && (
        <Text dimColor>← → to select, Enter to play{leadSuit ? ` (follow ${leadSuit} if possible)` : ''}</Text>
      )}
      {done && <Text bold>Game over — lowest points wins: {NAMES[winner[0]]} with {winner[1]}!</Text>}
    </Box>
  )
}

const App: React.FC = () => (
  <DeckProvider>
    <HeartsGame />
  </DeckProvider>
)

render(<App />)
```
</content>
