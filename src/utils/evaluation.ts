import type { TCard, TCardValue } from '../types/index.js'
import { isStandardCard } from './cards.js'

/**
 * Ace-high rank order for standard playing card values. Excludes `JOKER`,
 * which has no place in a linear rank/run sequence.
 */
export const RANK_ORDER: TCardValue[] = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
]

/**
 * Ace-high rank index for a card value (0 = '2' … 12 = 'A').
 * Returns -1 for `JOKER`, which has no position in the rank order.
 */
export function rankIndex(value: TCardValue): number {
  return RANK_ORDER.indexOf(value)
}

/**
 * Point value of a card: A=1, J/Q/K=10, numeric cards their face value.
 * Non-standard cards (custom, tarot, joker) are worth 0.
 */
export function cardPointValue(card: TCard): number {
  if (!isStandardCard(card)) return 0
  if (card.value === 'JOKER') return 0
  if (card.value === 'A') return 1
  if (card.value === 'J' || card.value === 'Q' || card.value === 'K') return 10
  return Number.parseInt(card.value, 10)
}

/**
 * Blackjack total for a set of cards, treating Aces as 11 when it keeps the
 * hand at or under 21, and as 1 otherwise (soft-ace handling).
 */
export function blackjackTotal(cards: TCard[]): number {
  let score = 0
  let aces = 0

  for (const card of cards) {
    if (!isStandardCard(card) || card.value === 'JOKER') continue
    if (card.value === 'A') {
      aces++
    } else if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
      score += 10
    } else {
      score += Number.parseInt(card.value, 10)
    }
  }

  for (let i = 0; i < aces; i++) {
    score += score + 11 <= 21 ? 11 : 1
  }

  return score
}

/**
 * True if 3 or more cards share the same rank (value), regardless of suit.
 */
export function isSet(cards: TCard[]): boolean {
  if (cards.length < 3) return false
  const values = cards.map((card) =>
    isStandardCard(card) ? card.value : undefined
  )
  return values.every((value) => value !== undefined && value === values[0])
}

/**
 * True if 3 or more standard cards form a consecutive same-suit run
 * (ace-high only; no wraparound).
 */
export function isRun(cards: TCard[]): boolean {
  if (cards.length < 3) return false
  if (!cards.every((card) => isStandardCard(card))) return false
  const standard = cards.filter((card) => isStandardCard(card))
  if (standard.some((card) => card.value === 'JOKER')) return false

  const suits = new Set(standard.map((card) => card.suit))
  if (suits.size !== 1) return false

  const ranks = standard
    .map((card) => rankIndex(card.value))
    .sort((a, b) => a - b)
  return ranks.every((rank, i) => i === 0 || rank === ranks[i - 1]! + 1)
}

/**
 * True if the cards form a valid meld: either a set (matching rank) or a
 * run (consecutive same-suit).
 */
export function isValidMeld(cards: TCard[]): boolean {
  return isSet(cards) || isRun(cards)
}

/** Poker hand categories, ordered lowest to highest. */
export const PokerHandRank = {
  HighCard: 0,
  Pair: 1,
  TwoPair: 2,
  ThreeOfAKind: 3,
  Straight: 4,
  Flush: 5,
  FullHouse: 6,
  FourOfAKind: 7,
  StraightFlush: 8,
} as const

export type PokerHandRankValue =
  (typeof PokerHandRank)[keyof typeof PokerHandRank]

export type PokerHandResult = {
  rank: PokerHandRankValue
  name: string
  /** Card values sorted by (frequency desc, rank desc) for kicker tiebreaks. */
  kickers: TCardValue[]
}

const POKER_HAND_NAMES: Record<PokerHandRankValue, string> = {
  [PokerHandRank.HighCard]: 'High Card',
  [PokerHandRank.Pair]: 'Pair',
  [PokerHandRank.TwoPair]: 'Two Pair',
  [PokerHandRank.ThreeOfAKind]: 'Three of a Kind',
  [PokerHandRank.Straight]: 'Straight',
  [PokerHandRank.Flush]: 'Flush',
  [PokerHandRank.FullHouse]: 'Full House',
  [PokerHandRank.FourOfAKind]: 'Four of a Kind',
  [PokerHandRank.StraightFlush]: 'Straight Flush',
}

/**
 * Evaluates a 5-card poker hand, returning its category rank/name plus a
 * kicker list (values ordered by frequency then rank) for tiebreaking.
 * Hands with fewer than 5 standard cards are treated as High Card.
 */
export function evaluatePokerHand(cards: TCard[]): PokerHandResult {
  const standard = cards
    .filter((card) => isStandardCard(card))
    .filter((card) => card.value !== 'JOKER')
  if (standard.length < 5) {
    return {
      rank: PokerHandRank.HighCard,
      name: POKER_HAND_NAMES[PokerHandRank.HighCard],
      kickers: [],
    }
  }

  const values = standard.map((card) => card.value)
  const suits = standard.map((card) => card.suit)

  const counts: Partial<Record<TCardValue, number>> = {}
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1

  const kickers = (Object.keys(counts) as TCardValue[]).sort((a, b) => {
    const freqDiff = counts[b]! - counts[a]!
    return freqDiff === 0 ? rankIndex(b) - rankIndex(a) : freqDiff
  })
  const freq = Object.values(counts).sort((a, b) => b - a)

  const isFlush = new Set(suits).size === 1
  const sortedUnique = [...new Set(values)].sort(
    (a, b) => rankIndex(a) - rankIndex(b)
  )
  const isStraight =
    sortedUnique.length === 5 &&
    rankIndex(sortedUnique[4]!) - rankIndex(sortedUnique[0]!) === 4

  const isLowStraight =
    sortedUnique.length === 5 && sortedUnique.join(',') === '2,3,4,5,A'

  const anyStraight = isStraight || isLowStraight

  const rank: PokerHandRankValue =
    isFlush && anyStraight
      ? PokerHandRank.StraightFlush
      : freq[0] === 4
        ? PokerHandRank.FourOfAKind
        : freq[0] === 3 && freq[1] === 2
          ? PokerHandRank.FullHouse
          : isFlush
            ? PokerHandRank.Flush
            : anyStraight
              ? PokerHandRank.Straight
              : freq[0] === 3
                ? PokerHandRank.ThreeOfAKind
                : freq[0] === 2 && freq[1] === 2
                  ? PokerHandRank.TwoPair
                  : freq[0] === 2
                    ? PokerHandRank.Pair
                    : PokerHandRank.HighCard

  // The wheel (A-2-3-4-5) is the lowest straight: its Ace counts low, so it
  // must compare below a 6-high straight despite `rankIndex('A')` being
  // high. Reorder its kickers to lead with the 5 and trail with the Ace so
  // `comparePokerHands`'s lockstep walk ranks it correctly.
  const orderedKickers = isLowStraight
    ? (['5', '4', '3', '2', 'A'] as TCardValue[])
    : kickers

  return { rank, name: POKER_HAND_NAMES[rank], kickers: orderedKickers }
}

/**
 * Compares two poker hands: higher category wins; ties resolve by walking
 * each hand's kickers (frequency-then-rank ordered) in lockstep. Returns a
 * positive number if `a` wins, negative if `b` wins, 0 for a true tie.
 */
export function comparePokerHands(a: TCard[], b: TCard[]): number {
  const handA = evaluatePokerHand(a)
  const handB = evaluatePokerHand(b)

  if (handA.rank !== handB.rank) return handA.rank - handB.rank

  const length = Math.max(handA.kickers.length, handB.kickers.length)
  for (let i = 0; i < length; i++) {
    const kickerA = handA.kickers[i]
    const kickerB = handB.kickers[i]
    const rankA = kickerA === undefined ? -1 : rankIndex(kickerA)
    const rankB = kickerB === undefined ? -1 : rankIndex(kickerB)
    if (rankA !== rankB) return rankA - rankB
  }

  return 0
}
