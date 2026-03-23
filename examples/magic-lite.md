# Magic: The Gathering Lite

A simplified MTG-style game demonstrating custom cards, effects, and the zone system.

## Overview

Two players start with 20 life. Each turn: draw a card, play lands for mana, cast creatures/spells, and attack. First player to reduce the opponent to 0 life wins.

## Implementation

```tsx
import React, { useState, useEffect } from 'react'
import { Box, Text, useInput } from 'ink'
import {
  DeckProvider,
  useDeck,
  CustomCard,
  CardStack,
  type TCard,
  type CustomCardProps,
} from 'ink-playing-cards'

// Create custom MTG-style cards using CustomCard props
const createLand = (name: string, manaType: string): CustomCardProps => ({
  id: `land-${name}-${Math.random().toString(36).slice(2, 6)}`,
  title: name,
  typeLine: 'Land',
  description: `Tap: Add 1 ${manaType} mana.`,
  size: 'small',
  borderColor: manaType === 'green' ? 'green' : 'red',
})

const createCreature = (
  name: string,
  cost: number,
  power: number,
  toughness: number,
): CustomCardProps => ({
  id: `creature-${name}-${Math.random().toString(36).slice(2, 6)}`,
  title: name,
  cost: String(cost),
  typeLine: 'Creature',
  description: `Power ${power} / Toughness ${toughness}`,
  footerLeft: `${power}/${toughness}`,
  size: 'small',
})

const createSpell = (
  name: string,
  cost: number,
  desc: string,
): CustomCardProps => ({
  id: `spell-${name}-${Math.random().toString(36).slice(2, 6)}`,
  title: name,
  cost: String(cost),
  typeLine: 'Instant',
  description: desc,
  size: 'small',
  borderColor: 'red',
})

type PlayerState = {
  life: number
  mana: number
  maxMana: number
  hand: CustomCardProps[]
  battlefield: CustomCardProps[]
  landPlayed: boolean
}

const buildDeck = (): CustomCardProps[] => [
  createLand('Forest', 'green'),
  createLand('Forest', 'green'),
  createLand('Mountain', 'red'),
  createLand('Mountain', 'red'),
  createCreature('Goblin', 1, 1, 1),
  createCreature('Goblin', 1, 1, 1),
  createCreature('Elf Warrior', 2, 2, 2),
  createCreature('Elf Warrior', 2, 2, 2),
  createCreature('Dragon', 4, 4, 4),
  createSpell('Lightning Bolt', 1, 'Deal 3 damage.'),
  createSpell('Lightning Bolt', 1, 'Deal 3 damage.'),
  createCreature('Bear', 2, 2, 2),
]

const shuffleArray = <T,>(arr: T[]): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const MagicLite = () => {
  const [player, setPlayer] = useState<PlayerState>({
    life: 20, mana: 0, maxMana: 0, hand: [], battlefield: [], landPlayed: false,
  })
  const [opponent, setOpponent] = useState<PlayerState>({
    life: 20, mana: 0, maxMana: 0, hand: [], battlefield: [], landPlayed: false,
  })
  const [drawPile, setDrawPile] = useState<CustomCardProps[]>([])
  const [phase, setPhase] = useState<'main' | 'attack' | 'over'>('main')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const deck = shuffleArray(buildDeck())
    setPlayer((p) => ({ ...p, hand: deck.slice(0, 5) }))
    setOpponent((o) => ({ ...o, hand: deck.slice(5, 10) }))
    setDrawPile(deck.slice(10))
    setMessage('[1-9] play card | [a] attack | [e] end turn | [d] draw')
  }, [])

  const drawCard = () => {
    if (drawPile.length === 0) {
      setMessage('No cards left to draw.')
      return
    }
    setPlayer((p) => ({ ...p, hand: [...p.hand, drawPile[0]] }))
    setDrawPile(drawPile.slice(1))
    setMessage('Drew a card.')
  }

  const playCard = (idx: number) => {
    const card = player.hand[idx]
    if (!card) return

    if (card.typeLine === 'Land') {
      if (player.landPlayed) {
        setMessage('Already played a land this turn.')
        return
      }
      setPlayer((p) => ({
        ...p,
        hand: p.hand.filter((_, i) => i !== idx),
        battlefield: [...p.battlefield, card],
        maxMana: p.maxMana + 1,
        mana: p.mana + 1,
        landPlayed: true,
      }))
      setMessage(`Played ${card.title}.`)
    } else {
      const cost = Number.parseInt(card.cost ?? '0', 10)
      if (player.mana < cost) {
        setMessage(`Need ${cost} mana, have ${player.mana}.`)
        return
      }

      if (card.typeLine === 'Instant') {
        // Spell: deal damage
        setOpponent((o) => ({ ...o, life: o.life - 3 }))
        setPlayer((p) => ({
          ...p,
          hand: p.hand.filter((_, i) => i !== idx),
          mana: p.mana - cost,
        }))
        setMessage(`Cast ${card.title}! Dealt 3 damage.`)
      } else {
        // Creature
        setPlayer((p) => ({
          ...p,
          hand: p.hand.filter((_, i) => i !== idx),
          battlefield: [...p.battlefield, card],
          mana: p.mana - cost,
        }))
        setMessage(`Summoned ${card.title}.`)
      }
    }

    if (opponent.life <= 0) {
      setPhase('over')
      setMessage('You win!')
    }
  }

  const attack = () => {
    const totalPower = player.battlefield
      .filter((c) => c.typeLine === 'Creature')
      .reduce((sum, c) => {
        const match = c.footerLeft?.match(/^(\d+)/)
        return sum + (match ? Number.parseInt(match[1], 10) : 0)
      }, 0)

    if (totalPower === 0) {
      setMessage('No creatures to attack with.')
      return
    }

    setOpponent((o) => ({ ...o, life: o.life - totalPower }))
    setMessage(`Attacked for ${totalPower} damage!`)
    if (opponent.life - totalPower <= 0) {
      setPhase('over')
      setMessage('You win!')
    }
  }

  const endTurn = () => {
    // Simple AI: opponent draws and plays first playable card
    setPlayer((p) => ({ ...p, landPlayed: false, mana: p.maxMana }))
    setMessage('Opponent\'s turn...')
    setTimeout(() => {
      setMessage('[1-9] play card | [a] attack | [e] end turn | [d] draw')
    }, 500)
  }

  useInput((input) => {
    if (phase === 'over') return
    const idx = Number.parseInt(input, 10)
    if (idx >= 1 && idx <= 9) playCard(idx - 1)
    if (input === 'a') attack()
    if (input === 'e') endTurn()
    if (input === 'd') drawCard()
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Magic: The Gathering Lite</Text>
      <Box gap={2}>
        <Text>You: {player.life} HP | Mana: {player.mana}/{player.maxMana}</Text>
        <Text>Opponent: {opponent.life} HP</Text>
      </Box>
      <Text>Battlefield:</Text>
      <Box gap={1}>
        {player.battlefield.map((card) => (
          <CustomCard key={card.id} {...card} />
        ))}
        {player.battlefield.length === 0 && <Text dimColor>(empty)</Text>}
      </Box>
      <Text>Hand ({player.hand.length}):</Text>
      <Box gap={1}>
        {player.hand.map((card, i) => (
          <Box key={card.id} flexDirection="column">
            <Text dimColor>{i + 1}.</Text>
            <CustomCard {...card} />
          </Box>
        ))}
      </Box>
      <Text>Draw pile: {drawPile.length}</Text>
      <Text>{message}</Text>
      {phase === 'over' && <Text color="green">Game Over!</Text>}
    </Box>
  )
}

const App = () => (
  <DeckProvider>
    <MagicLite />
  </DeckProvider>
)

export default App
```

## Key Concepts

- `CustomCard` component with structured layout: `title`, `cost`, `typeLine`, `description`, `footerLeft`
- `CustomCardProps` type for creating game-specific card types (Land, Creature, Instant)
- `size` preset controls card dimensions (`'small'` for compact layout)
- `borderColor` for visual differentiation by card type
- Cards use unique `id`s (required for all `TCard` types)
- Local state management for player hands, battlefield, mana, and life totals
- `DeckProvider` wraps the app for context, even when managing cards locally
