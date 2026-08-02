# Spades

A four-player Spades implementation using `ink-playing-cards` and Ink — you against three CPU opponents. Adds a **bidding phase** on top of trick-taking, plus a fixed trump suit (spades always beat everything else).

_Mechanics highlighted: bidding, trump-suit trick-taking, bid-vs-tricks-won scoring._

> Simplifications: bids are capped at 0–9 (adjusted with ↑/↓ for keyboard simplicity — real Spades allows bids up to 13), and there are no partnerships (each of the 4 players scores individually instead of as two teams). Suit-following, spade-breaking (spades can't lead a trick until broken, unless that's all a player holds), spades-always-trump resolution, and bid-based scoring (10×bid + overtricks, a penalty for missing bid, or a flat ±50 for a nil bid) are real.

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
const TRUMP: TSuit = 'spades'

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const rankValue = (card: TCard) => (isStandardCard(card) ? RANKS.indexOf(card.value) : -1)
const suitOf = (card: TCard): TSuit | undefined => (isStandardCard(card) ? card.suit : undefined)

const estimateBid = (hand: TCard[]): number => {
  let bid = 0
  for (const card of hand) {
    if (!isStandardCard(card)) continue
    if (card.suit === TRUMP && ['J', 'Q', 'K', 'A'].includes(card.value)) bid++
    else if (card.value === 'A') bid++
  }
  return Math.min(9, bid)
}

type Played = { playerId: string; card: TCard }
type Phase = 'bidding' | 'playing' | 'done'

const SpadesGame: React.FC = () => {
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
  const [phase, setPhase] = useState<Phase>('bidding')
  const [bidderIndex, setBidderIndex] = useState(0)
  const [pendingBid, setPendingBid] = useState(3)
  const [bids, setBids] = useState<Record<string, number | null>>({
    player: null,
    west: null,
    north: null,
    east: null,
  })

  const [trick, setTrick] = useState<Played[]>([])
  const [leaderIndex, setLeaderIndex] = useState(0)
  const [spadesBroken, setSpadesBroken] = useState(false)
  const [tricksWon, setTricksWon] = useState<Record<string, number>>({ player: 0, west: 0, north: 0, east: 0 })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [message, setMessage] = useState('Dealing...')
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    shuffle()
    const timer = setTimeout(() => {
      deal(13, ORDER)
      setDealt(true)
      setMessage('Bid how many tricks you expect to win.')
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  // CPU bidding.
  useEffect(() => {
    if (!dealt || phase !== 'bidding' || bidderIndex === 4) return
    const bidder = ORDER[bidderIndex]
    if (bidder === PLAYER) return
    const timer = setTimeout(() => {
      const bid = estimateBid(hands[bidder])
      setBids((b) => ({ ...b, [bidder]: bid }))
      setMessage(`${NAMES[bidder]} bids ${bid}.`)
      setBidderIndex((i) => i + 1)
    }, 500)
    return () => clearTimeout(timer)
  }, [dealt, phase, bidderIndex])

  useEffect(() => {
    if (bidderIndex === 4 && phase === 'bidding') {
      setPhase('playing')
      setMessage('Bidding complete — your lead.')
    }
  }, [bidderIndex, phase])

  const rotation = [...ORDER.slice(leaderIndex), ...ORDER.slice(0, leaderIndex)]
  const currentPlayer = rotation[trick.length]
  const leadSuit = trick.length > 0 ? suitOf(trick[0].card) : undefined

  const validCards = (playerId: string): TCard[] => {
    const hand = hands[playerId]
    if (!leadSuit) {
      if (!spadesBroken) {
        const nonSpades = hand.filter((c) => suitOf(c) !== TRUMP)
        if (nonSpades.length > 0) return nonSpades
      }
      return hand
    }
    const followers = hand.filter((c) => suitOf(c) === leadSuit)
    return followers.length > 0 ? followers : hand
  }

  const play = (playerId: string, card: TCard) => {
    playFns[playerId](card.id)
    setTrick((t) => [...t, { playerId, card }])
    if (suitOf(card) === TRUMP) setSpadesBroken(true)
  }

  useEffect(() => {
    if (phase !== 'playing' || resolving || currentPlayer === PLAYER || trick.length === 4) return
    const legal = validCards(currentPlayer)
    if (legal.length === 0) return
    const lowest = legal.reduce((best, c) => (rankValue(c) < rankValue(best) ? c : best))
    const timer = setTimeout(() => play(currentPlayer, lowest), 450)
    return () => clearTimeout(timer)
  }, [phase, resolving, currentPlayer, trick.length])

  useEffect(() => {
    if (trick.length !== 4 || resolving) return
    setResolving(true)
    const timer = setTimeout(() => {
      const spadesPlayed = trick.filter((p) => suitOf(p.card) === TRUMP)
      const pool = spadesPlayed.length > 0 ? spadesPlayed : trick.filter((p) => suitOf(p.card) === leadSuit)
      const winner = pool.reduce((best, p) => (rankValue(p.card) > rankValue(best.card) ? p : best))
      setTricksWon((t) => ({ ...t, [winner.playerId]: t[winner.playerId] + 1 }))
      setMessage(`${NAMES[winner.playerId]} takes the trick.`)
      setLeaderIndex(ORDER.indexOf(winner.playerId))
      setTrick([])
      setResolving(false)
      if (hands[winner.playerId].length === 0 && playerHand.length <= 1) setPhase('done')
    }, 700)
    return () => clearTimeout(timer)
  }, [trick, resolving, leadSuit])

  useInput((input, key) => {
    if (phase === 'bidding' && bidderIndex === 0) {
      if (key.upArrow) setPendingBid((b) => Math.min(9, b + 1))
      else if (key.downArrow) setPendingBid((b) => Math.max(0, b - 1))
      else if (key.return) {
        setBids((b) => ({ ...b, player: pendingBid }))
        setMessage(`You bid ${pendingBid}.`)
        setBidderIndex(1)
      }
      return
    }

    if (phase !== 'playing' || currentPlayer !== PLAYER || trick.length === 4) return
    const legal = validCards(PLAYER)
    if (key.leftArrow) setSelectedIndex((i) => Math.max(0, i - 1))
    else if (key.rightArrow) setSelectedIndex((i) => Math.min(playerHand.length - 1, i + 1))
    else if (key.return) {
      const card = playerHand[selectedIndex]
      if (legal.some((c) => c.id === card.id)) play(PLAYER, card)
      else if (!leadSuit) setMessage('Spades are not broken yet — lead a different suit.')
      else setMessage(`Must follow suit (${leadSuit}) if you can.`)
    }
  })

  useEffect(() => {
    if (selectedIndex >= playerHand.length) setSelectedIndex(Math.max(0, playerHand.length - 1))
  }, [playerHand.length])

  const finalScore = (id: string) => {
    const bid = bids[id] ?? 0
    const won = tricksWon[id]
    if (bid === 0) return won === 0 ? 50 : -50
    return won >= bid ? 10 * bid + (won - bid) : -10 * bid
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Spades ({TRUMP} is trump)</Text>
      <Text> </Text>

      {phase === 'bidding' && (
        <Box flexDirection="column">
          <Text>{message}</Text>
          {bidderIndex === 0 && <Text>Your bid: {pendingBid} (↑/↓ to change, Enter to confirm)</Text>}
        </Box>
      )}

      {phase !== 'bidding' && (
        <Box flexDirection="column">
          <Box gap={2}>
            {ORDER.map((id) => (
              <Text key={id}>
                {NAMES[id]}: {tricksWon[id]}/{bids[id]}
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
        </Box>
      )}

      <CardStack cards={playerHand} name="Your hand" isFaceUp stackDirection="horizontal" maxDisplay={13} />

      {phase === 'playing' && currentPlayer === PLAYER && trick.length < 4 && (
        <Text dimColor>← → to select, Enter to play{leadSuit ? ` (follow ${leadSuit} if possible)` : ''}</Text>
      )}
      {phase === 'done' && (
        <Box flexDirection="column">
          <Text> </Text>
          {ORDER.map((id) => (
            <Text key={id}>
              {NAMES[id]}: bid {bids[id]}, won {tricksWon[id]} → {finalScore(id)} pts
            </Text>
          ))}
        </Box>
      )}
    </Box>
  )
}

const App: React.FC = () => (
  <DeckProvider>
    <SpadesGame />
  </DeckProvider>
)

render(<App />)
```
</content>
