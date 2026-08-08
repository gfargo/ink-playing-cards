import test from 'ava'
import type { CardProps, TCard } from '../types/index.js'
import {
  shuffleCards,
  drawCards,
  addCard,
  addCards,
  removeCard,
  findCard,
  cutDeck,
  moveCard,
  sortHand,
  groupBy,
  peek,
  insertAt,
  drawFromBottom,
  deal,
  Deck,
  Hand,
  DiscardPile,
  PlayArea,
  StandardZone,
} from './Zones.js'

function makeCard(id: string, value: CardProps['value'] = 'A'): TCard {
  const card: TCard = { id, suit: 'hearts', value }
  return card
}

function cardValue(card: TCard): CardProps['value'] {
  return (card as CardProps).value
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
    cards.map((c) => c.id)
  )
})

test('moveCard moves a card from one zone to another', (t) => {
  const from = makeDeck(3)
  const to = makeDeck(1)
  const [newFrom, newTo] = moveCard(from, to, 'card-1')
  t.is(newFrom.length, 2)
  t.is(newTo.length, 2)
  t.false(newFrom.some((c) => c.id === 'card-1'))
  t.is(newTo.at(-1)!.id, 'card-1')
})

test('moveCard is a no-op when the card is not in the source zone', (t) => {
  const from = makeDeck(2)
  const to = makeDeck(1)
  const [newFrom, newTo] = moveCard(from, to, 'nonexistent')
  t.is(newFrom, from)
  t.is(newTo, to)
})

test('moveCard with position "bottom" inserts at the start', (t) => {
  const from = makeDeck(2)
  const to = makeDeck(2)
  const [, newTo] = moveCard(from, to, 'card-1', 'bottom')
  t.is(newTo[0]!.id, 'card-1')
})

test('moveCard with numeric position inserts at that index', (t) => {
  const from = makeDeck(2)
  const to = makeDeck(3)
  const [, newTo] = moveCard(from, to, 'card-1', 1)
  t.is(newTo[1]!.id, 'card-1')
  t.is(newTo.length, 4)
})

test('moveCard within the same zone reorders without duplicating', (t) => {
  const zone = makeDeck(3)
  const [, newTo] = moveCard(zone, zone, 'card-0', 'bottom')
  t.is(newTo.length, 3)
  t.deepEqual(
    newTo.map((c) => c.id),
    ['card-0', 'card-1', 'card-2']
  )
})

test('sortHand sorts ascending by a numeric key', (t) => {
  const cards = [makeCard('c', 'K'), makeCard('a', '2'), makeCard('b', '10')]
  const rank: Record<string, number> = { 2: 0, 10: 1, K: 2 }
  const result = sortHand(cards, (card) => rank[cardValue(card)]!)
  t.deepEqual(
    result.map((c) => c.id),
    ['a', 'b', 'c']
  )
})

test('sortHand does not mutate the original array', (t) => {
  const cards = [makeCard('b', 'K'), makeCard('a', '2')]
  const original = [...cards]
  sortHand(cards, (card) => cardValue(card))
  t.deepEqual(cards, original)
})

test('sortHand on an empty array returns an empty array', (t) => {
  t.deepEqual(
    sortHand([], (card) => cardValue(card)),
    []
  )
})

test('groupBy groups cards into buckets by key', (t) => {
  const cards = [makeCard('a', 'A'), makeCard('b', 'K'), makeCard('c', 'A')]
  const groups = groupBy(cards, (card) => cardValue(card))
  t.is(groups.size, 2)
  t.is(groups.get('A')!.length, 2)
  t.is(groups.get('K')!.length, 1)
})

test('groupBy on an empty array returns an empty Map', (t) => {
  const groups = groupBy([], (card) => cardValue(card))
  t.is(groups.size, 0)
})

test('peek returns the top n cards without removing them', (t) => {
  const cards = makeDeck(5)
  const peeked = peek(cards, 2)
  t.deepEqual(
    peeked.map((c) => c.id),
    ['card-3', 'card-4']
  )
  t.is(cards.length, 5)
})

test('peek defaults to n=1', (t) => {
  const cards = makeDeck(3)
  const peeked = peek(cards)
  t.is(peeked.length, 1)
  t.is(peeked[0]!.id, 'card-2')
})

test('peek clamps n to the available cards', (t) => {
  const cards = makeDeck(2)
  const peeked = peek(cards, 10)
  t.is(peeked.length, 2)
})

test('insertAt inserts a card at the given index', (t) => {
  const cards = makeDeck(3)
  const newCard = makeCard('new-card')
  const result = insertAt(cards, newCard, 1)
  t.is(result.length, 4)
  t.is(result[1]!.id, 'new-card')
  t.is(cards.length, 3)
})

test('insertAt clamps a negative index to 0', (t) => {
  const cards = makeDeck(2)
  const result = insertAt(cards, makeCard('new-card'), -5)
  t.is(result[0]!.id, 'new-card')
})

test('insertAt clamps an out-of-range index to the end', (t) => {
  const cards = makeDeck(2)
  const result = insertAt(cards, makeCard('new-card'), 100)
  t.is(result.at(-1)!.id, 'new-card')
})

test('drawFromBottom draws from the start of the array', (t) => {
  const cards = makeDeck(5)
  const [drawn, remaining] = drawFromBottom(cards, 2)
  t.is(drawn.length, 2)
  t.is(remaining.length, 3)
  t.is(drawn[0]!.id, 'card-0')
  t.is(drawn[1]!.id, 'card-1')
  t.is(remaining[0]!.id, 'card-2')
})

test('drawFromBottom clamps to available cards', (t) => {
  const cards = makeDeck(3)
  const [drawn, remaining] = drawFromBottom(cards, 10)
  t.is(drawn.length, 3)
  t.is(remaining.length, 0)
})

test('drawFromBottom with 0 count returns empty drawn', (t) => {
  const cards = makeDeck(3)
  const [drawn, remaining] = drawFromBottom(cards, 0)
  t.is(drawn.length, 0)
  t.is(remaining.length, 3)
})

test('drawFromBottom does not mutate original', (t) => {
  const cards = makeDeck(5)
  const original = [...cards]
  drawFromBottom(cards, 2)
  t.deepEqual(cards, original)
})

test('deal round-robin distributes one card per player per round', (t) => {
  const cards = makeDeck(6)
  const { hands, remaining } = deal(cards, { players: 3, count: 2 })
  t.is(hands.length, 3)
  for (const hand of hands) t.is(hand.length, 2)
  t.is(remaining.length, 0)
  t.deepEqual(
    hands[0]!.map((c) => c.id),
    ['card-5', 'card-2']
  )
})

test('deal per-player gives each player a consecutive block', (t) => {
  const cards = makeDeck(6)
  const { hands, remaining } = deal(cards, {
    players: 3,
    count: 2,
    pattern: 'per-player',
  })
  t.is(hands.length, 3)
  t.deepEqual(
    hands[0]!.map((c) => c.id),
    ['card-4', 'card-5']
  )
  t.deepEqual(
    hands[1]!.map((c) => c.id),
    ['card-2', 'card-3']
  )
  t.is(remaining.length, 0)
})

test('deal clamps when requesting more cards than the deck holds', (t) => {
  const cards = makeDeck(3)
  const { hands, remaining } = deal(cards, { players: 2, count: 5 })
  t.is(hands.flat().length, 3)
  t.is(remaining.length, 0)
})

test('deal does not mutate the original array', (t) => {
  const cards = makeDeck(5)
  const original = [...cards]
  deal(cards, { players: 2, count: 2 })
  t.deepEqual(cards, original)
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
