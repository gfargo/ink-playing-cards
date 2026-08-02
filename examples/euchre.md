# Euchre

A four-player Euchre implementation using `ink-playing-cards` and Ink — you against three CPU opponents on the trimmed **24-card Euchre deck** (9 through Ace only), with the trump suit's jack ("right bower") and same-color jack ("left bower") outranking every other card.

_Mechanics highlighted: non-standard deck size via `DeckProvider`'s `initialCards`, trump-suit trick-taking with bower ranking._

> Simplification: real Euchre has a bidding round where players choose to "order up" or pass on the flipped trump card; here trump is fixed to that card's suit automatically so the example can focus on bower/trump trick resolution. Play is 5 tricks per hand, scored individually (no partnerships) rather than as two 2-player teams.

## Full Implementation

```tsx
import React, { useState, useEffect, useMemo } from 'react'
import { render, Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  useHand,
  Card,
  createStandardDeck,
  isStandardCard,
  type TCard,
  type TSuit,
  type TCardValue,
} from 'ink-playing-cards'

const PLAYER = 'player'
const WEST = 'west'
const NORTH = 'north'
const EAST = 'east'
const UPCARD = 'upcard'
const ORDER = [PLAYER, WEST, NORTH, EAST]
const NAMES: Record<string, string> = { player: 'You', west: 'West', north: 'North', east: 'East' }

const EUCHRE_VALUES: TCardValue[] = ['9', '10', 'J', 'Q', 'K', 'A']
const EUCHRE_DECK = createStandardDeck().filter((c) => isStandardCard(c) && EUCHRE_VALUES.includes(c.value))

const OPPOSITE_COLOR: Record<TSuit, TSuit> = { hearts: 'diamonds', diamonds: 'hearts', clubs: 'spades', spades: 'clubs' }
const sameColor = (suit: TSuit): TSuit => OPPOSITE_COLOR[suit]

const isRightBower = (card: TCard, trump: TSuit) => isStandardCard(card) && card.value === 'J' && card.suit === trump
const isLeftBower = (card: TCard, trump: TSuit) =>
  isStandardCard(card) && card.value === 'J' && card.suit === sameColor(trump)

// The left bower "becomes" a trump card for both following suit and ranking.
const effectiveSuit = (card: TCard, trump: TSuit): TSuit | undefined => {
  if (!isStandardCard(card)) return undefined
  return isLeftBower(card, trump) ? trump : card.suit
}

const TRUMP_RANK: Record<string, number> = { A: 14, K: 13, Q: 12, 10: 10, 9: 9 }
const PLAIN_RANK: Record<string, number> = { A: 14, K: 13, Q: 12, J: 11, 10: 10, 9: 9 }

const trickStrength = (card: TCard, leadSuit: TSuit | undefined, trump: TSuit): number => {
  if (!isStandardCard(card)) return -1
  const eff = effectiveSuit(card, trump)
  if (eff === trump) {
    if (isRightBower(card, trump)) return 200
    if (isLeftBower(card, trump)) return 190
    return 100 + (TRUMP_RANK[card.value] ?? 0)
  }
  if (eff === leadSuit) return PLAIN_RANK[card.value] ?? 0
  return -1
}

type Played = { playerId: string; card: TCard }

const EuchreGame: React.FC = () => {
  const { shuffle, deal, draw } = useDeck()
  const { hand: playerHand, playCard: playCardPlayer } = useHand(PLAYER)
  const { hand: westHand, playCard: playCardWest } = useHand(WEST)
  const { hand: northHand, playCard: playCardNorth } = useHand(NORTH)
  const { hand: eastHand, playCard: playCardEast } = useHand(EAST)
  const { hand: upcardHand } = useHand(UPCARD)

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
  const [tricksWon, setTricksWon] = useState<Record<string, number>>({ player: 0, west: 0, north: 0, east: 0 })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [message, setMessage] = useState('Dealing...')
  const [resolving, setResolving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    shuffle()
    const timer = setTimeout(() => {
      deal(5, ORDER)
      setTimeout(() => {
        draw(1, UPCARD)
        setDealt(true)
      }, 50)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  const trump: TSuit | undefined = useMemo(
    () => (upcardHand[0] && isStandardCard(upcardHand[0]) ? upcardHand[0].suit : undefined),
    [upcardHand]
  )

  useEffect(() => {
    if (dealt && trump) setMessage(`Trump is ${trump}. Your lead.`)
  }, [dealt, trump])

  const rotation = [...ORDER.slice(leaderIndex), ...ORDER.slice(0, leaderIndex)]
  const currentPlayer = rotation[trick.length]
  const leadSuit = trick.length > 0 && trump ? effectiveSuit(trick[0].card, trump) : undefined

  const validCards = (playerId: string): TCard[] => {
    if (!trump) return hands[playerId]
    const hand = hands[playerId]
    if (!leadSuit) return hand
    const followers = hand.filter((c) => effectiveSuit(c, trump) === leadSuit)
    return followers.length > 0 ? followers : hand
  }

  const play = (playerId: string, card: TCard) => {
    playFns[playerId](card.id)
    setTrick((t) => [...t, { playerId, card }])
  }

  useEffect(() => {
    if (!dealt || !trump || done || resolving || currentPlayer === PLAYER || trick.length === 4) return
    const legal = validCards(currentPlayer)
    if (legal.length === 0) return
    const weakest = legal.reduce((worst, c) =>
      trickStrength(c, leadSuit, trump) < trickStrength(worst, leadSuit, trump) ? c : worst
    )
    const timer = setTimeout(() => play(currentPlayer, weakest), 450)
    return () => clearTimeout(timer)
  }, [dealt, trump, done, resolving, currentPlayer, trick.length])

  useEffect(() => {
    if (trick.length !== 4 || resolving || !trump) return
    setResolving(true)
    const timer = setTimeout(() => {
      const winner = trick.reduce((best, p) =>
        trickStrength(p.card, leadSuit, trump) > trickStrength(best.card, leadSuit, trump) ? p : best
      )
      setTricksWon((t) => ({ ...t, [winner.playerId]: t[winner.playerId] + 1 }))
      setMessage(`${NAMES[winner.playerId]} takes the trick.`)
      setLeaderIndex(ORDER.indexOf(winner.playerId))
      setTrick([])
      setResolving(false)
      if (hands[winner.playerId].length === 0 && playerHand.length <= 1) setDone(true)
    }, 700)
    return () => clearTimeout(timer)
  }, [trick, resolving, leadSuit, trump])

  useInput((input, key) => {
    if (!dealt || !trump || done || currentPlayer !== PLAYER || trick.length === 4) return
    const legal = validCards(PLAYER)
    if (key.leftArrow) setSelectedIndex((i) => Math.max(0, i - 1))
    else if (key.rightArrow) setSelectedIndex((i) => Math.min(playerHand.length - 1, i + 1))
    else if (key.return) {
      const card = playerHand[selectedIndex]
      if (legal.some((c) => c.id === card.id)) play(PLAYER, card)
      else setMessage(`Must follow ${leadSuit} if you can (bower counts as trump).`)
    }
  })

  useEffect(() => {
    if (selectedIndex >= playerHand.length) setSelectedIndex(Math.max(0, playerHand.length - 1))
  }, [playerHand.length])

  const winner = Object.entries(tricksWon).reduce((best, entry) => (entry[1] > best[1] ? entry : best))

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Euchre — 24-card deck</Text>
      <Text> </Text>
      {trump && (
        <Box gap={2}>
          <Text>Trump: {trump}</Text>
          {ORDER.map((id) => (
            <Text key={id}>
              {NAMES[id]}: {tricksWon[id]}
            </Text>
          ))}
        </Box>
      )}
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

      {dealt && trump && !done && currentPlayer === PLAYER && trick.length < 4 && (
        <Text dimColor>← → to select, Enter to play{leadSuit ? ` (follow ${leadSuit} if possible)` : ''}</Text>
      )}
      {done && <Text bold>Hand over — {NAMES[winner[0]]} took the most tricks ({winner[1]})!</Text>}
    </Box>
  )
}

const App: React.FC = () => (
  <DeckProvider initialCards={EUCHRE_DECK}>
    <EuchreGame />
  </DeckProvider>
)

render(<App />)
```
</content>
