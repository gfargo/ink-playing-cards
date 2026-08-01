# Durak

A two-player Durak ("fool") implementation using `ink-playing-cards` and Ink on the traditional **36-card deck** (6 through Ace) — attack with a card, the defender beats it with a higher card of the same suit or any trump, or takes the card into their hand.

_Mechanics highlighted: attack/defend combat resolution, a trump suit that beats every other suit, cards moving back into a hand (taking)._

> The shared reducer's zone primitives only move cards *out of* a hand (`playCard`, `discard`) — there's no way to move cards back into one, which "taking" requires. So after using `useDeck`/`useHand` once to shuffle and pull the whole deck out, the rest of the game (dealing, attacking, defending, taking, refilling) is modeled in local React state, same spirit as `go-fish.md`'s simulated transfer. Also simplified: only one attack card per round instead of Durak's usual multi-card throw-ins.

## Full Implementation

```tsx
import React, { useState, useEffect } from 'react'
import { render, Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  useHand,
  Card,
  createStandardDeck,
  isStandardCard,
  type TCard,
  type TCardValue,
  type TSuit,
} from 'ink-playing-cards'

const STOCK = 'stock'
const HAND_SIZE = 6

const DURAK_VALUES: TCardValue[] = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const DURAK_DECK = createStandardDeck().filter((c) => isStandardCard(c) && DURAK_VALUES.includes(c.value))

const rankOf = (v: TCardValue) => DURAK_VALUES.indexOf(v)
const getValue = (c: TCard): TCardValue | undefined => (isStandardCard(c) ? c.value : undefined)
const suitOf = (c: TCard): TSuit | undefined => (isStandardCard(c) ? c.suit : undefined)

const beats = (defender: TCard, attacker: TCard, trump: TSuit): boolean => {
  const dv = getValue(defender)
  const av = getValue(attacker)
  const ds = suitOf(defender)
  const as = suitOf(attacker)
  if (!dv || !av) return false
  if (ds === as) return rankOf(dv) > rankOf(av)
  return ds === trump && as !== trump
}

type Role = 'player' | 'cpu'
type Phase = 'attack' | 'defend' | 'done'

const DurakGame: React.FC = () => {
  const { shuffle, draw } = useDeck()
  const { hand: stock } = useHand(STOCK)

  const [initialized, setInitialized] = useState(false)
  const [playerHand, setPlayerHand] = useState<TCard[]>([])
  const [cpuHand, setCpuHand] = useState<TCard[]>([])
  const [talon, setTalon] = useState<TCard[]>([])
  const [trumpCard, setTrumpCard] = useState<TCard | null>(null)
  const [bitaCount, setBitaCount] = useState(0)
  const [attacker, setAttacker] = useState<Role>('player')
  const [phase, setPhase] = useState<Phase>('attack')
  const [attackCard, setAttackCard] = useState<TCard | null>(null)
  const [defendCard, setDefendCard] = useState<TCard | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [message, setMessage] = useState('Shuffling...')
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    shuffle()
    const timer = setTimeout(() => draw(36, STOCK), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (initialized || stock.length !== 36) return
    const trump = stock[0]
    const rest = stock.slice(1)
    setTrumpCard(trump)
    setPlayerHand(rest.slice(0, HAND_SIZE))
    setCpuHand(rest.slice(HAND_SIZE, HAND_SIZE * 2))
    setTalon(rest.slice(HAND_SIZE * 2))
    setInitialized(true)
    setMessage(`Trump is ${suitOf(trump)}. You attack first.`)
  }, [initialized, stock])

  const trumpSuit = trumpCard ? suitOf(trumpCard) : undefined
  const defender: Role = attacker === 'player' ? 'cpu' : 'player'

  const refill = (hands: { player: TCard[]; cpu: TCard[] }, pile: TCard[], first: Role) => {
    let remaining = [...pile]
    const take = (hand: TCard[]) => {
      const needed = Math.max(0, HAND_SIZE - hand.length)
      const drawn = remaining.slice(0, needed)
      remaining = remaining.slice(needed)
      return [...hand, ...drawn]
    }
    const order: Role[] = first === 'player' ? ['player', 'cpu'] : ['cpu', 'player']
    const next = { player: hands.player, cpu: hands.cpu }
    for (const role of order) next[role] = take(next[role])
    return { hands: next, talon: remaining }
  }

  // `currentHands` must reflect any card removed by the caller THIS render —
  // state setters are async, so the outer playerHand/cpuHand may still be stale.
  const resolveRound = (
    outcome: 'defended' | 'taken',
    finalAttack: TCard,
    finalDefend: TCard | null,
    currentHands: { player: TCard[]; cpu: TCard[] }
  ) => {
    setResolving(true)
    setTimeout(() => {
      let nextPlayerHand = currentHands.player
      let nextCpuHand = currentHands.cpu
      let nextAttacker = attacker

      if (outcome === 'defended') {
        setBitaCount((n) => n + (finalDefend ? 2 : 1))
        nextAttacker = defender
        setMessage(`${defender === 'player' ? 'You' : 'CPU'} beat the attack — roles swap.`)
      } else {
        const taken = [finalAttack, ...(finalDefend ? [finalDefend] : [])]
        if (defender === 'player') nextPlayerHand = [...currentHands.player, ...taken]
        else nextCpuHand = [...currentHands.cpu, ...taken]
        setMessage(`${defender === 'player' ? 'You take' : 'CPU takes'} the cards — same attacker again.`)
      }

      const { hands, talon: nextTalon } = refill({ player: nextPlayerHand, cpu: nextCpuHand }, talon, nextAttacker)

      setPlayerHand(hands.player)
      setCpuHand(hands.cpu)
      setTalon(nextTalon)
      setAttacker(nextAttacker)
      setAttackCard(null)
      setDefendCard(null)
      setResolving(false)

      if (nextTalon.length === 0 && hands.player.length === 0 && hands.cpu.length === 0) {
        setPhase('done')
        setMessage("Talon's empty and both hands are empty — a draw!")
      } else if (nextTalon.length === 0 && hands.player.length === 0) {
        setPhase('done')
        setMessage('You ran out of cards first — you win!')
      } else if (nextTalon.length === 0 && hands.cpu.length === 0) {
        setPhase('done')
        setMessage('CPU ran out of cards first — CPU wins!')
      } else {
        setPhase('attack')
      }
    }, 700)
  }

  // CPU attacks with its lowest non-trump card (or lowest trump if that's all it has).
  useEffect(() => {
    if (!initialized || phase !== 'attack' || attacker !== 'cpu' || resolving || !trumpSuit) return
    const timer = setTimeout(() => {
      const nonTrump = cpuHand.filter((c) => suitOf(c) !== trumpSuit)
      const pool = nonTrump.length > 0 ? nonTrump : cpuHand
      const card = pool.reduce((low, c) => (rankOf(getValue(c)!) < rankOf(getValue(low)!) ? c : low))
      setCpuHand((h) => h.filter((c) => c.id !== card.id))
      setAttackCard(card)
      setMessage(`CPU attacks with ${getValue(card)} of ${suitOf(card)}.`)
      setPhase('defend')
    }, 600)
    return () => clearTimeout(timer)
  }, [initialized, phase, attacker, resolving, cpuHand, trumpSuit])

  // CPU defends with the cheapest card that beats the attack, or takes.
  useEffect(() => {
    if (!initialized || phase !== 'defend' || defender !== 'cpu' || resolving || !attackCard || !trumpSuit) return
    const timer = setTimeout(() => {
      const candidates = cpuHand.filter((c) => beats(c, attackCard, trumpSuit))
      if (candidates.length === 0) {
        setMessage('CPU has no way to beat it and takes the cards.')
        resolveRound('taken', attackCard, null, { player: playerHand, cpu: cpuHand })
        return
      }
      const card = candidates.reduce((low, c) => (rankOf(getValue(c)!) < rankOf(getValue(low)!) ? c : low))
      const nextCpuHand = cpuHand.filter((c) => c.id !== card.id)
      setCpuHand(nextCpuHand)
      setDefendCard(card)
      setMessage(`CPU beats it with ${getValue(card)} of ${suitOf(card)}.`)
      resolveRound('defended', attackCard, card, { player: playerHand, cpu: nextCpuHand })
    }, 700)
    return () => clearTimeout(timer)
  }, [initialized, phase, defender, resolving, attackCard, cpuHand, trumpSuit])

  useInput((input, key) => {
    if (!initialized || phase === 'done' || resolving || !trumpSuit) return

    if (phase === 'attack' && attacker === 'player') {
      if (key.leftArrow) setSelectedIndex((i) => Math.max(0, i - 1))
      else if (key.rightArrow) setSelectedIndex((i) => Math.min(playerHand.length - 1, i + 1))
      else if (key.return && playerHand[selectedIndex]) {
        const card = playerHand[selectedIndex]
        setPlayerHand((h) => h.filter((c) => c.id !== card.id))
        setAttackCard(card)
        setMessage(`You attack with ${getValue(card)} of ${suitOf(card)}.`)
        setPhase('defend')
      }
      return
    }

    if (phase === 'defend' && defender === 'player' && attackCard) {
      if (input === 't') {
        setMessage('You take the attack card.')
        resolveRound('taken', attackCard, null, { player: playerHand, cpu: cpuHand })
        return
      }
      if (key.leftArrow) setSelectedIndex((i) => Math.max(0, i - 1))
      else if (key.rightArrow) setSelectedIndex((i) => Math.min(playerHand.length - 1, i + 1))
      else if (key.return && playerHand[selectedIndex]) {
        const card = playerHand[selectedIndex]
        if (!beats(card, attackCard, trumpSuit)) {
          setMessage('That card does not beat the attack.')
          return
        }
        const nextPlayerHand = playerHand.filter((c) => c.id !== card.id)
        setPlayerHand(nextPlayerHand)
        setDefendCard(card)
        setMessage(`You beat it with ${getValue(card)} of ${suitOf(card)}.`)
        resolveRound('defended', attackCard, card, { player: nextPlayerHand, cpu: cpuHand })
      }
    }
  })

  useEffect(() => {
    if (selectedIndex >= playerHand.length) setSelectedIndex(Math.max(0, playerHand.length - 1))
  }, [playerHand.length])

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Durak — Attack &amp; Defend</Text>
      <Text> </Text>
      {trumpCard && isStandardCard(trumpCard) && (
        <Box gap={2}>
          <Text>
            Trump: {trumpCard.value} of {trumpCard.suit}
          </Text>
          <Text>Talon: {talon.length}</Text>
          <Text>Bita: {bitaCount}</Text>
          <Text>CPU hand: {cpuHand.length}</Text>
        </Box>
      )}
      <Text> </Text>
      <Text>{message}</Text>
      <Text> </Text>

      <Box gap={2}>
        {attackCard && isStandardCard(attackCard) && (
          <Box flexDirection="column" alignItems="center">
            <Text dimColor>Attack</Text>
            <Card id={attackCard.id} suit={attackCard.suit} value={attackCard.value} faceUp variant="simple" />
          </Box>
        )}
        {defendCard && isStandardCard(defendCard) && (
          <Box flexDirection="column" alignItems="center">
            <Text dimColor>Defend</Text>
            <Card id={defendCard.id} suit={defendCard.suit} value={defendCard.value} faceUp variant="simple" />
          </Box>
        )}
      </Box>
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

      {phase === 'attack' && attacker === 'player' && <Text dimColor>← → to select, Enter to attack</Text>}
      {phase === 'defend' && defender === 'player' && (
        <Text dimColor>← → to select, Enter to beat it, t to take</Text>
      )}
      {phase === 'done' && <Text bold>{message}</Text>}
    </Box>
  )
}

const App: React.FC = () => (
  <DeckProvider initialCards={DURAK_DECK}>
    <DurakGame />
  </DeckProvider>
)

render(<App />)
```
</content>
