import test from 'ava'
import {
  isStandardCard,
  type BackArtwork,
  type CardEffect,
  type TCard,
} from '../types/index.js'
import { hydrate, serialize, stripCard } from './Serialization.js'

function makeCard(
  id: string,
  overrides: { effects?: CardEffect[]; faceUp?: boolean } = {}
): TCard {
  const card: TCard = { id, suit: 'hearts', value: 'A', ...overrides }
  return card
}

function makeCards(count: number): TCard[] {
  return Array.from({ length: count }, (_, i) => makeCard(`card-${i}`))
}

const backArtwork: BackArtwork = {
  ascii: 'ascii-back',
  simple: 'simple-back',
  minimal: '?',
}

function makeDeckState(
  overrides: {
    deck?: TCard[]
    hands?: Record<string, TCard[]>
    discardPile?: TCard[]
    playArea?: TCard[]
    custom?: Record<string, TCard[]>
    players?: string[]
  } = {}
) {
  return {
    zones: {
      deck: overrides.deck ?? makeCards(3),
      hands: overrides.hands ?? {},
      discardPile: overrides.discardPile ?? [],
      playArea: overrides.playArea ?? [],
      custom: overrides.custom ?? {},
    },
    players: overrides.players ?? [],
    backArtwork,
  }
}

test('stripCard removes effects but preserves other card properties', (t) => {
  const effect: CardEffect = { apply: () => undefined }
  const card = makeCard('c1', { effects: [effect], faceUp: true })
  const stripped = stripCard(card)
  t.is(stripped.id, 'c1')
  t.true(isStandardCard(stripped))
  t.true(isStandardCard(stripped) && stripped.suit === 'hearts')
  t.true(isStandardCard(stripped) && stripped.value === 'A')
  t.is(stripped.faceUp, true)
  t.is(stripped.effects, undefined)
})

test('serialize produces a JSON.stringify-safe snapshot with a version', (t) => {
  const snapshot = serialize({ deck: makeDeckState() })
  t.is(snapshot.version, 1)
  t.notThrows(() => JSON.stringify(snapshot))
})

test('serialize strips effects from every zone', (t) => {
  const effect: CardEffect = { apply: () => undefined }
  const deck = [makeCard('d1', { effects: [effect] })]
  const hands = { p1: [makeCard('h1', { effects: [effect] })] }
  const snapshot = serialize({ deck: makeDeckState({ deck, hands }) })
  t.is(snapshot.zones.deck[0]!.effects, undefined)
  t.is(snapshot.zones.hands['p1']![0]!.effects, undefined)
})

test('hydrate(serialize(x)) round-trips zones, players, and backArtwork', (t) => {
  const deckState = makeDeckState({
    deck: makeCards(5),
    hands: { p1: makeCards(2) },
    discardPile: makeCards(1),
    playArea: makeCards(1),
    custom: { sideboard: makeCards(2) },
    players: ['p1', 'p2'],
  })
  const snapshot = serialize({ deck: deckState })
  const { deck } = hydrate(snapshot)

  t.deepEqual(deck.zones, deckState.zones)
  t.deepEqual(deck.players, deckState.players)
  t.deepEqual(deck.backArtwork, deckState.backArtwork)
})

test('round-trip survives JSON.parse(JSON.stringify(snapshot)) (network path)', (t) => {
  const deckState = makeDeckState({
    deck: makeCards(3),
    custom: { sideboard: makeCards(1) },
    players: ['p1'],
  })
  const gameState = {
    currentPlayerId: 'p1',
    players: ['p1'],
    turn: 4,
    phase: 'playing',
  }
  const snapshot = serialize({ deck: deckState, game: gameState, rngSeed: 42 })
  // eslint-disable-next-line unicorn/prefer-structured-clone -- simulating an actual JSON-over-the-wire hop, not a general deep clone
  const wire = JSON.parse(JSON.stringify(snapshot)) as typeof snapshot
  const { deck, game } = hydrate(wire)

  t.deepEqual(deck.zones, deckState.zones)
  t.deepEqual(deck.players, deckState.players)
  t.deepEqual(game, gameState)
  t.is(wire.rngSeed, 42)
})

test('custom zones survive round-trip', (t) => {
  const deckState = makeDeckState({
    custom: { sideboard: makeCards(2), graveyard: makeCards(1) },
  })
  const { deck } = hydrate(serialize({ deck: deckState }))
  t.deepEqual(deck.zones.custom, deckState.zones.custom)
})

test('rngSeed round-trips when present', (t) => {
  const snapshot = serialize({ deck: makeDeckState(), rngSeed: 123 })
  t.is(snapshot.rngSeed, 123)
})

test('rngSeed is undefined when absent, without crashing hydrate', (t) => {
  const snapshot = serialize({ deck: makeDeckState() })
  t.is(snapshot.rngSeed, undefined)
  t.notThrows(() => hydrate(snapshot))
})

test('hydrate defaults game fields when no game state was serialized', (t) => {
  const snapshot = serialize({ deck: makeDeckState({ players: ['p1'] }) })
  const { game } = hydrate(snapshot)
  t.is(game.currentPlayerId, 'p1')
  t.is(game.turn, 0)
  t.is(game.phase, 'setup')
})

test('hydrate does not alias the snapshot zone arrays (defensive copy)', (t) => {
  const snapshot = serialize({ deck: makeDeckState({ deck: makeCards(2) }) })
  const { deck } = hydrate(snapshot)
  deck.zones.deck.push(makeCard('mutated'))
  t.is(snapshot.zones.deck.length, 2)
})
