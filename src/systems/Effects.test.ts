import test from 'ava'
import type {
  CardEffect,
  GameEventData,
  GameState,
  TCard,
} from '../types/index.js'
import {
  ConditionalEffect,
  TriggeredEffect,
  ContinuousEffect,
  DelayedEffect,
  TargetedEffect,
  DrawCardEffect,
  DamageEffect,
  attachEffectToCard,
  EffectManager,
} from './Effects.js'

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    currentPlayerId: 'p1',
    players: [],
    turn: 1,
    phase: 'main',
    zones: { deck: [], hands: {}, discardPile: [], playArea: [] },
    ...overrides,
  }
}

function makeEvent(
  type: string,
  extra: Record<string, unknown> = {}
): GameEventData {
  return { type, ...extra }
}

class SpyEffect implements CardEffect {
  calls: Array<{ gameState: GameState; eventData: GameEventData }> = []
  apply(gameState: GameState, eventData: GameEventData): void {
    this.calls.push({ gameState, eventData })
  }
}

test('ConditionalEffect applies when condition is true', (t) => {
  const spy = new SpyEffect()
  const effect = new ConditionalEffect(() => true, spy)
  effect.apply(makeGameState(), makeEvent('X'))
  t.is(spy.calls.length, 1)
})

test('ConditionalEffect skips when condition is false', (t) => {
  const spy = new SpyEffect()
  const effect = new ConditionalEffect(() => false, spy)
  effect.apply(makeGameState(), makeEvent('X'))
  t.is(spy.calls.length, 0)
})

test('ConditionalEffect passes game state to condition', (t) => {
  const spy = new SpyEffect()
  const effect = new ConditionalEffect((gs) => gs.turn > 2, spy)
  effect.apply(makeGameState({ turn: 1 }), makeEvent('X'))
  t.is(spy.calls.length, 0)
  effect.apply(makeGameState({ turn: 3 }), makeEvent('X'))
  t.is(spy.calls.length, 1)
})

test('TriggeredEffect fires on matching event type', (t) => {
  const spy = new SpyEffect()
  const effect = new TriggeredEffect('CARDS_DRAWN', spy)
  effect.apply(makeGameState(), makeEvent('CARDS_DRAWN'))
  t.is(spy.calls.length, 1)
})

test('TriggeredEffect ignores non-matching event type', (t) => {
  const spy = new SpyEffect()
  const effect = new TriggeredEffect('CARDS_DRAWN', spy)
  effect.apply(makeGameState(), makeEvent('CARD_PLAYED'))
  t.is(spy.calls.length, 0)
})

test('ContinuousEffect applies when condition is true', (t) => {
  let applied = false
  let removed = false
  const effect = new ContinuousEffect(
    () => true,
    () => {
      applied = true
    },
    () => {
      removed = true
    }
  )
  effect.apply(makeGameState(), makeEvent('X'))
  t.true(applied)
  t.false(removed)
})

test('ContinuousEffect removes when condition is false', (t) => {
  let applied = false
  let removed = false
  const effect = new ContinuousEffect(
    () => false,
    () => {
      applied = true
    },
    () => {
      removed = true
    }
  )
  effect.apply(makeGameState(), makeEvent('X'))
  t.false(applied)
  t.true(removed)
})

test('TargetedEffect applies when target is found', (t) => {
  const spy = new SpyEffect()
  const effect = new TargetedEffect(() => 'some-target', spy)
  effect.apply(makeGameState(), makeEvent('X'))
  t.is(spy.calls.length, 1)
  t.is(spy.calls[0]!.eventData.target, 'some-target')
})

test('TargetedEffect skips when target is null', (t) => {
  const spy = new SpyEffect()
  const effect = new TargetedEffect(() => null, spy)
  effect.apply(makeGameState(), makeEvent('X'))
  t.is(spy.calls.length, 0)
})

test('DelayedEffect does not fire before delay', (t) => {
  const spy = new SpyEffect()
  const effect = new DelayedEffect(3, spy)
  // First call registers the turn
  effect.apply(makeGameState({ turn: 1 }), makeEvent('X'))
  t.is(spy.calls.length, 0)
  // Turn 2 — not yet
  effect.apply(makeGameState({ turn: 2 }), makeEvent('X'))
  t.is(spy.calls.length, 0)
  // Turn 3 — not yet (need turn 1 + 3 = 4)
  effect.apply(makeGameState({ turn: 3 }), makeEvent('X'))
  t.is(spy.calls.length, 0)
})

test('DelayedEffect fires after delay turns', (t) => {
  const spy = new SpyEffect()
  const effect = new DelayedEffect(2, spy)
  effect.apply(makeGameState({ turn: 5 }), makeEvent('X'))
  t.is(spy.calls.length, 0)
  effect.apply(makeGameState({ turn: 7 }), makeEvent('X'))
  t.is(spy.calls.length, 1)
})

test('DelayedEffect resets after firing', (t) => {
  const spy = new SpyEffect()
  const effect = new DelayedEffect(1, spy)
  effect.apply(makeGameState({ turn: 0 }), makeEvent('X'))
  effect.apply(makeGameState({ turn: 1 }), makeEvent('X'))
  t.is(spy.calls.length, 1)
  // Re-register
  effect.apply(makeGameState({ turn: 2 }), makeEvent('X'))
  t.is(spy.calls.length, 1)
  effect.apply(makeGameState({ turn: 3 }), makeEvent('X'))
  t.is(spy.calls.length, 2)
})

test('DrawCardEffect moves cards from deck to hand', (t) => {
  const effect = new DrawCardEffect(2)
  const gs = makeGameState({
    currentPlayerId: 'p1',
    zones: {
      deck: [
        { id: 'c1', suit: 'hearts', value: 'A' },
        { id: 'c2', suit: 'spades', value: 'K' },
        { id: 'c3', suit: 'clubs', value: 'Q' },
      ],
      hands: { p1: [] },
      discardPile: [],
      playArea: [],
    },
  })
  effect.apply(gs, makeEvent('X'))
  t.is(gs.zones.deck.length, 1)
  t.is(gs.zones.hands['p1']!.length, 2)
})

test('DrawCardEffect uses playerId from event data', (t) => {
  const effect = new DrawCardEffect(1)
  const gs = makeGameState({
    zones: {
      deck: [{ id: 'c1', suit: 'hearts', value: 'A' }],
      hands: { p2: [] },
      discardPile: [],
      playArea: [],
    },
  })
  effect.apply(gs, makeEvent('X', { playerId: 'p2' }))
  t.is(gs.zones.hands['p2']!.length, 1)
})

test('DrawCardEffect clamps to available cards', (t) => {
  const effect = new DrawCardEffect(5)
  const gs = makeGameState({
    zones: {
      deck: [{ id: 'c1', suit: 'hearts', value: 'A' }],
      hands: { p1: [] },
      discardPile: [],
      playArea: [],
    },
  })
  effect.apply(gs, makeEvent('X'))
  t.is(gs.zones.deck.length, 0)
  t.is(gs.zones.hands['p1']!.length, 1)
})

test('DamageEffect reduces target life', (t) => {
  const effect = new DamageEffect(3)
  const target = { life: 20 }
  effect.apply(makeGameState(), makeEvent('X', { target }))
  t.is(target.life, 17)
})

test('DamageEffect reduces target health', (t) => {
  const effect = new DamageEffect(5)
  const target = { health: 10 }
  effect.apply(makeGameState(), makeEvent('X', { target }))
  t.is(target.health, 5)
})

test('DamageEffect does nothing without target', (t) => {
  const effect = new DamageEffect(5)
  effect.apply(makeGameState(), makeEvent('X'))
  t.pass()
})

test('attachEffectToCard adds effect to card without existing effects', (t) => {
  const card: TCard = { id: 'c1', suit: 'hearts', value: 'A' }
  const spy = new SpyEffect()
  attachEffectToCard(card, spy)
  t.is(card.effects!.length, 1)
  t.is(card.effects![0], spy)
})

test('attachEffectToCard appends to existing effects', (t) => {
  const existing = new SpyEffect()
  const card: TCard = {
    id: 'c1',
    suit: 'hearts',
    value: 'A',
    effects: [existing],
  }
  const spy = new SpyEffect()
  attachEffectToCard(card, spy)
  t.is(card.effects!.length, 2)
})

test('EffectManager applies all effects on a card', (t) => {
  const spy1 = new SpyEffect()
  const spy2 = new SpyEffect()
  const card: TCard = {
    id: 'c1',
    suit: 'hearts',
    value: 'A',
    effects: [spy1, spy2],
  }
  const manager = new EffectManager()
  manager.applyCardEffects(card, makeGameState(), makeEvent('X'))
  t.is(spy1.calls.length, 1)
  t.is(spy2.calls.length, 1)
})

test('EffectManager does nothing when card has no effects', (t) => {
  const card: TCard = { id: 'c1', suit: 'hearts', value: 'A' }
  const manager = new EffectManager()
  manager.applyCardEffects(card, makeGameState(), makeEvent('X'))
  t.pass()
})
