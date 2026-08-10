import test from 'ava'
import type { CardProps, TCard } from '../types/index.js'
import {
  RANK_ORDER,
  rankIndex,
  cardPointValue,
  blackjackTotal,
  isSet,
  isRun,
  isValidMeld,
  evaluatePokerHand,
  comparePokerHands,
  PokerHandRank,
} from './evaluation.js'

let uid = 0
const card = (suit: CardProps['suit'], value: CardProps['value']): TCard => ({
  id: `${suit}-${value}-${uid++}`,
  suit,
  value,
})

const custom = (id: string): TCard => ({ id, title: 'Widget' })

// RankIndex / RANK_ORDER

test('rankIndex orders values ace-high', (t) => {
  t.is(rankIndex('2'), 0)
  t.is(rankIndex('K'), 11)
  t.is(rankIndex('A'), 12)
  t.is(RANK_ORDER.length, 13)
})

test('rankIndex returns -1 for JOKER', (t) => {
  t.is(rankIndex('JOKER'), -1)
})

// CardPointValue

test('cardPointValue: A=1, face cards=10, numeric=face value', (t) => {
  t.is(cardPointValue(card('hearts', 'A')), 1)
  t.is(cardPointValue(card('spades', 'K')), 10)
  t.is(cardPointValue(card('clubs', 'Q')), 10)
  t.is(cardPointValue(card('diamonds', 'J')), 10)
  t.is(cardPointValue(card('hearts', '7')), 7)
})

test('cardPointValue: non-standard card is 0', (t) => {
  t.is(cardPointValue(custom('c1')), 0)
})

// BlackjackTotal

test('blackjackTotal: A+K is 21', (t) => {
  t.is(blackjackTotal([card('hearts', 'A'), card('spades', 'K')]), 21)
})

test('blackjackTotal: A+A+9 is 21 with one soft ace', (t) => {
  t.is(
    blackjackTotal([
      card('hearts', 'A'),
      card('spades', 'A'),
      card('clubs', '9'),
    ]),
    21
  )
})

test('blackjackTotal: A+K+K demotes the ace to avoid busting', (t) => {
  t.is(
    blackjackTotal([
      card('hearts', 'A'),
      card('spades', 'K'),
      card('clubs', 'K'),
    ]),
    21
  )
})

test('blackjackTotal: 10+7+5 busts at 22', (t) => {
  t.is(
    blackjackTotal([
      card('hearts', '10'),
      card('spades', '7'),
      card('clubs', '5'),
    ]),
    22
  )
})

test('blackjackTotal: empty hand is 0', (t) => {
  t.is(blackjackTotal([]), 0)
})

test('blackjackTotal: ignores non-standard cards', (t) => {
  t.is(blackjackTotal([card('hearts', 'K'), custom('c1')]), 10)
})

// IsSet

test('isSet: three of a kind across suits is a set', (t) => {
  t.true(isSet([card('hearts', '7'), card('spades', '7'), card('clubs', '7')]))
})

test('isSet: two of a kind is not a set', (t) => {
  t.false(isSet([card('hearts', '7'), card('spades', '7')]))
})

test('isSet: a run is not a set', (t) => {
  t.false(
    isSet([card('hearts', '5'), card('hearts', '6'), card('hearts', '7')])
  )
})

// IsRun

test('isRun: three consecutive same-suit cards is a run', (t) => {
  t.true(isRun([card('hearts', '5'), card('hearts', '6'), card('hearts', '7')]))
})

test('isRun: mixed suits is not a run', (t) => {
  t.false(
    isRun([card('hearts', '5'), card('diamonds', '6'), card('hearts', '7')])
  )
})

test('isRun: fewer than 3 cards is not a run', (t) => {
  t.false(isRun([card('hearts', '5'), card('hearts', '6')]))
})

// IsValidMeld

test('isValidMeld: accepts sets and runs, rejects neither', (t) => {
  t.true(
    isValidMeld([card('hearts', '7'), card('spades', '7'), card('clubs', '7')])
  )
  t.true(
    isValidMeld([card('hearts', '5'), card('hearts', '6'), card('hearts', '7')])
  )
  t.false(
    isValidMeld([
      card('hearts', '5'),
      card('diamonds', '9'),
      card('clubs', '2'),
    ])
  )
})

// EvaluatePokerHand

test('evaluatePokerHand: high card', (t) => {
  const hand = evaluatePokerHand([
    card('hearts', '2'),
    card('spades', '5'),
    card('clubs', '9'),
    card('diamonds', 'J'),
    card('hearts', 'K'),
  ])
  t.is(hand.rank, PokerHandRank.HighCard)
  t.is(hand.name, 'High Card')
})

test('evaluatePokerHand: pair', (t) => {
  const hand = evaluatePokerHand([
    card('hearts', '2'),
    card('spades', '2'),
    card('clubs', '9'),
    card('diamonds', 'J'),
    card('hearts', 'K'),
  ])
  t.is(hand.rank, PokerHandRank.Pair)
})

test('evaluatePokerHand: two pair', (t) => {
  const hand = evaluatePokerHand([
    card('hearts', '2'),
    card('spades', '2'),
    card('clubs', '9'),
    card('diamonds', '9'),
    card('hearts', 'K'),
  ])
  t.is(hand.rank, PokerHandRank.TwoPair)
})

test('evaluatePokerHand: three of a kind', (t) => {
  const hand = evaluatePokerHand([
    card('hearts', '2'),
    card('spades', '2'),
    card('clubs', '2'),
    card('diamonds', '9'),
    card('hearts', 'K'),
  ])
  t.is(hand.rank, PokerHandRank.ThreeOfAKind)
})

test('evaluatePokerHand: straight', (t) => {
  const hand = evaluatePokerHand([
    card('hearts', '5'),
    card('spades', '6'),
    card('clubs', '7'),
    card('diamonds', '8'),
    card('hearts', '9'),
  ])
  t.is(hand.rank, PokerHandRank.Straight)
})

test('evaluatePokerHand: ace-low straight (wheel)', (t) => {
  const hand = evaluatePokerHand([
    card('hearts', 'A'),
    card('spades', '2'),
    card('clubs', '3'),
    card('diamonds', '4'),
    card('hearts', '5'),
  ])
  t.is(hand.rank, PokerHandRank.Straight)
})

test('evaluatePokerHand: ace-high straight (broadway)', (t) => {
  const hand = evaluatePokerHand([
    card('hearts', '10'),
    card('spades', 'J'),
    card('clubs', 'Q'),
    card('diamonds', 'K'),
    card('hearts', 'A'),
  ])
  t.is(hand.rank, PokerHandRank.Straight)
})

test('evaluatePokerHand: flush', (t) => {
  const hand = evaluatePokerHand([
    card('hearts', '2'),
    card('hearts', '5'),
    card('hearts', '9'),
    card('hearts', 'J'),
    card('hearts', 'K'),
  ])
  t.is(hand.rank, PokerHandRank.Flush)
})

test('evaluatePokerHand: full house', (t) => {
  const hand = evaluatePokerHand([
    card('hearts', '2'),
    card('spades', '2'),
    card('clubs', '2'),
    card('diamonds', '9'),
    card('hearts', '9'),
  ])
  t.is(hand.rank, PokerHandRank.FullHouse)
})

test('evaluatePokerHand: four of a kind', (t) => {
  const hand = evaluatePokerHand([
    card('hearts', '2'),
    card('spades', '2'),
    card('clubs', '2'),
    card('diamonds', '2'),
    card('hearts', '9'),
  ])
  t.is(hand.rank, PokerHandRank.FourOfAKind)
})

test('evaluatePokerHand: straight flush', (t) => {
  const hand = evaluatePokerHand([
    card('hearts', '5'),
    card('hearts', '6'),
    card('hearts', '7'),
    card('hearts', '8'),
    card('hearts', '9'),
  ])
  t.is(hand.rank, PokerHandRank.StraightFlush)
})

test('evaluatePokerHand: fewer than 5 standard cards is High Card', (t) => {
  const hand = evaluatePokerHand([
    card('hearts', '2'),
    card('spades', '2'),
    custom('c1'),
  ])
  t.is(hand.rank, PokerHandRank.HighCard)
})

// ComparePokerHands

test('comparePokerHands: higher category wins', (t) => {
  const flush = [
    card('hearts', '2'),
    card('hearts', '5'),
    card('hearts', '9'),
    card('hearts', 'J'),
    card('hearts', 'K'),
  ]
  const pair = [
    card('clubs', '2'),
    card('diamonds', '2'),
    card('spades', '9'),
    card('clubs', 'J'),
    card('diamonds', 'K'),
  ]
  t.true(comparePokerHands(flush, pair) > 0)
  t.true(comparePokerHands(pair, flush) < 0)
})

test('comparePokerHands: same category resolves by kicker (pair of kings beats pair of queens)', (t) => {
  const kings = [
    card('hearts', 'K'),
    card('spades', 'K'),
    card('clubs', '4'),
    card('diamonds', '7'),
    card('hearts', '9'),
  ]
  const queens = [
    card('clubs', 'Q'),
    card('diamonds', 'Q'),
    card('spades', '4'),
    card('clubs', '7'),
    card('diamonds', '9'),
  ]
  t.true(comparePokerHands(kings, queens) > 0)
})

test('comparePokerHands: two pair resolves by top pair', (t) => {
  const acesAndTwos = [
    card('hearts', 'A'),
    card('spades', 'A'),
    card('clubs', '2'),
    card('diamonds', '2'),
    card('hearts', '9'),
  ]
  const kingsAndQueens = [
    card('clubs', 'K'),
    card('diamonds', 'K'),
    card('spades', 'Q'),
    card('clubs', 'Q'),
    card('diamonds', '9'),
  ]
  t.true(comparePokerHands(acesAndTwos, kingsAndQueens) > 0)
})

test('comparePokerHands: identical hands tie', (t) => {
  const a = [
    card('hearts', 'K'),
    card('spades', 'K'),
    card('clubs', '4'),
    card('diamonds', '7'),
    card('hearts', '9'),
  ]
  const b = [
    card('diamonds', 'K'),
    card('clubs', 'K'),
    card('hearts', '4'),
    card('spades', '7'),
    card('clubs', '9'),
  ]
  t.is(comparePokerHands(a, b), 0)
})

test('comparePokerHands: wheel (ace-low straight) loses to a 6-high straight', (t) => {
  const wheel = [
    card('hearts', 'A'),
    card('spades', '2'),
    card('clubs', '3'),
    card('diamonds', '4'),
    card('hearts', '5'),
  ]
  const sixHigh = [
    card('clubs', '2'),
    card('diamonds', '3'),
    card('spades', '4'),
    card('hearts', '5'),
    card('clubs', '6'),
  ]
  t.true(comparePokerHands(wheel, sixHigh) < 0)
  t.true(comparePokerHands(sixHigh, wheel) > 0)
})

test('comparePokerHands: wheel straight flush loses to a 6-high straight flush', (t) => {
  const wheelFlush = [
    card('hearts', 'A'),
    card('hearts', '2'),
    card('hearts', '3'),
    card('hearts', '4'),
    card('hearts', '5'),
  ]
  const sixHighFlush = [
    card('clubs', '2'),
    card('clubs', '3'),
    card('clubs', '4'),
    card('clubs', '5'),
    card('clubs', '6'),
  ]
  t.true(comparePokerHands(wheelFlush, sixHighFlush) < 0)
  t.true(comparePokerHands(sixHighFlush, wheelFlush) > 0)
})

// EvaluatePokerHand: more than 5 cards (best-of-N)

test('evaluatePokerHand: 7 cards picks the flush embedded among off-suit noise', (t) => {
  const seven = [
    card('hearts', '2'),
    card('hearts', '5'),
    card('hearts', '9'),
    card('hearts', 'J'),
    card('hearts', 'K'),
    card('clubs', '4'),
    card('diamonds', '8'),
  ]
  t.is(evaluatePokerHand(seven).rank, PokerHandRank.Flush)
})

test('evaluatePokerHand: 7 cards picks a straight buried among noise', (t) => {
  const seven = [
    card('clubs', '2'),
    card('diamonds', '3'),
    card('spades', '4'),
    card('hearts', '5'),
    card('clubs', '6'),
    card('hearts', 'K'),
    card('diamonds', 'K'),
  ]
  t.is(evaluatePokerHand(seven).rank, PokerHandRank.Straight)
})

test('evaluatePokerHand: 7 cards returns the best 5-card category, not a lesser one', (t) => {
  const sevenWithTrips = [
    card('hearts', '9'),
    card('spades', '9'),
    card('clubs', '9'),
    card('diamonds', '2'),
    card('hearts', '4'),
    card('clubs', '7'),
    card('diamonds', 'K'),
  ]
  t.is(evaluatePokerHand(sevenWithTrips).rank, PokerHandRank.ThreeOfAKind)
})

test('comparePokerHands: 7-card wheel straight still loses to a 7-card 6-high straight', (t) => {
  const wheel = [
    card('hearts', 'A'),
    card('spades', '2'),
    card('clubs', '3'),
    card('diamonds', '4'),
    card('hearts', '5'),
    card('clubs', '9'),
    card('diamonds', 'J'),
  ]
  const sixHigh = [
    card('clubs', '2'),
    card('diamonds', '3'),
    card('spades', '4'),
    card('hearts', '5'),
    card('clubs', '6'),
    card('hearts', '9'),
    card('diamonds', 'J'),
  ]
  t.true(comparePokerHands(wheel, sixHigh) < 0)
  t.true(comparePokerHands(sixHigh, wheel) > 0)
})
