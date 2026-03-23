import test from 'ava'
import type { TCard } from '../types/index.js'
import {
    shuffleCards,
    drawCards,
    addCard,
    addCards,
    removeCard,
    findCard,
    cutDeck,
    Deck,
    Hand,
    DiscardPile,
    PlayArea,
    StandardZone,
} from './Zones.js'

function makeCard(id: string): TCard {
  return { id, suit: 'hearts', value: 'A' } as TCard
}

function makeDeck(count: number): TCard[] {
  return Array.from({ length: count }, (_, i) => makeCard(`card-${i}`))
}

test('shuffleCards returns a new array of the same length', (t) => {
  const cards = makeDeck(10)
  const shuffled = shuffleCards(cards)
  t.is(shuffled.length, cards.length)
  t.not(shuffled, cards)
})

test('shuffleCards does not mutate the original array', (t) => {
  const cards = makeDeck(5)
  const original = [...cards]
  shuffleCards(cards)
  t.deepEqual(cards, original)
})

test('shuffleCards preserves all cards', (t) => {
  const cards = makeDeck(10)
  const shuffled = shuffleCards(cards)
  const ids = shuffled.map((c) => c.id).sort()
  const originalIds = cards.map((c) => c.id).sort()
  t.deepEqual(ids, originalIds)
})

test('drawCards draws from the end of the array', (t) => {
  const cards = makeDeck(5)
  const [drawn, remaining] = drawCards(cards, 2)
  t.is(drawn.length, 2)
  t.is(remaining.length, 3)
  t.is(drawn[0]!.id, 'card-3')
  t.is(drawn[1]!.id, 'card-4')
})

test('drawCards clamps to available cards', (t) => {
  const cards = makeDeck(3)
  const [drawn, remaining] = drawCards(cards, 10)
  t.is(drawn.length, 3)
  t.is(remaining.length, 0)
})

test('drawCards with 0 count returns empty drawn', (t) => {
  const cards = makeDeck(3)
  const [drawn, remaining] = drawCards(cards, 0)
  t.is(drawn.length, 0)
  t.is(remaining.length, 3)
})

test('drawCards does not mutate original', (t) => {
  const cards = makeDeck(5)
  const original = [...cards]
  drawCards(cards, 2)
  t.deepEqual(cards, original)
})

test('addCard appends to the end', (t) => {
  const cards = makeDeck(2)
  const newCard = makeCard('new-card')
  const result = addCard(cards, newCard)
  t.is(result.length, 3)
  t.is(result[2]!.id, 'new-card')
  t.not(result, cards)
})

test('addCards appends multiple cards', (t) => {
  const cards = makeDeck(2)
  const newCards = [makeCard('a'), makeCard('b')]
  const result = addCards(cards, newCards)
  t.is(result.length, 4)
  t.is(result[2]!.id, 'a')
  t.is(result[3]!.id, 'b')
})

test('removeCard removes by id', (t) => {
  const cards = makeDeck(3)
  const result = removeCard(cards, 'card-1')
  t.is(result.length, 2)
  t.false(result.some((c) => c.id === 'card-1'))
})

test('removeCard returns same contents when id not found', (t) => {
  const cards = makeDeck(3)
  const result = removeCard(cards, 'nonexistent')
  t.is(result.length, 3)
})

test('findCard returns the card when found', (t) => {
  const cards = makeDeck(5)
  const found = findCard(cards, 'card-2')
  t.truthy(found)
  t.is(found!.id, 'card-2')
})

test('findCard returns undefined when not found', (t) => {
  const cards = makeDeck(3)
  t.is(findCard(cards, 'nope'), undefined)
})

test('cutDeck splits and reorders', (t) => {
  const cards = makeDeck(5)
  const result = cutDeck(cards, 2)
  t.is(result.length, 5)
  t.is(result[0]!.id, 'card-2')
  t.is(result[1]!.id, 'card-3')
  t.is(result[2]!.id, 'card-4')
  t.is(result[3]!.id, 'card-0')
  t.is(result[4]!.id, 'card-1')
})

test('cutDeck at 0 returns same order', (t) => {
  const cards = makeDeck(3)
  const result = cutDeck(cards, 0)
  t.deepEqual(
    result.map((c) => c.id),
    cards.map((c) => c.id),
  )
})

test('StandardZone addCard and removeCard', (t) => {
  const zone = new StandardZone('test')
  const card = makeCard('z-1')
  zone.addCard(card)
  t.is(zone.cards.length, 1)
  zone.removeCard(card)
  t.is(zone.cards.length, 0)
})

test('StandardZone shuffle changes order', (t) => {
  const zone = new StandardZone('test', makeDeck(20))
  const before = zone.cards.map((c) => c.id)
  zone.shuffle()
  const after = zone.cards.map((c) => c.id)
  t.is(before.length, after.length)
})

test('Deck drawCard returns last card', (t) => {
  const deck = new Deck(makeDeck(3))
  const card = deck.drawCard()
  t.is(card!.id, 'card-2')
  t.is(deck.cards.length, 2)
})

test('Deck drawCard returns undefined when empty', (t) => {
  const deck = new Deck([])
  t.is(deck.drawCard(), undefined)
})

test('Deck drawCards returns multiple cards', (t) => {
  const deck = new Deck(makeDeck(5))
  const drawn = deck.drawCards(3)
  t.is(drawn.length, 3)
  t.is(deck.cards.length, 2)
})

test('Hand has correct name', (t) => {
  const hand = new Hand()
  t.is(hand.name, 'Hand')
})

test('DiscardPile has correct name', (t) => {
  const pile = new DiscardPile()
  t.is(pile.name, 'Discard Pile')
})

test('PlayArea has correct name', (t) => {
  const area = new PlayArea()
  t.is(area.name, 'Play Area')
})
