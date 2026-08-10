import { type TCard } from '../types/index.js'

/**
 * Pure utility functions for zone operations.
 * These return new arrays instead of mutating, making them safe for use in reducers.
 */

/**
 * Shuffle an array of cards using Fisher-Yates. Returns a new array.
 * `rng` defaults to `Math.random`; pass a seeded RNG (e.g. `mulberry32`)
 * for deterministic, replayable shuffles.
 */
export function shuffleCards(
  cards: TCard[],
  rng: () => number = Math.random
): TCard[] {
  const shuffled = [...cards]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const index = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[index]] = [shuffled[index]!, shuffled[i]!]
  }

  return shuffled
}

/**
 * Draw cards from the top of a zone (end of array).
 * Returns [drawnCards, remainingCards].
 */
export function drawCards(cards: TCard[], count: number): [TCard[], TCard[]] {
  const drawCount = Math.min(count, cards.length)
  const remaining = cards.slice(0, cards.length - drawCount)
  const drawn = cards.slice(cards.length - drawCount)
  return [drawn, remaining]
}

/**
 * Add a card to a zone. Returns a new array.
 */
export function addCard(cards: TCard[], card: TCard): TCard[] {
  return [...cards, card]
}

/**
 * Add multiple cards to a zone. Returns a new array.
 */
export function addCards(cards: TCard[], newCards: TCard[]): TCard[] {
  return [...cards, ...newCards]
}

/**
 * Remove a card by ID from a zone. Returns a new array.
 */
export function removeCard(cards: TCard[], cardId: string): TCard[] {
  return cards.filter((c) => c.id !== cardId)
}

/**
 * Find a card by ID in a zone.
 */
export function findCard(cards: TCard[], cardId: string): TCard | undefined {
  return cards.find((c) => c.id === cardId)
}

/**
 * Cut a deck at the given index. Returns a new array with bottom portion on top.
 */
export function cutDeck(cards: TCard[], index: number): TCard[] {
  return [...cards.slice(index), ...cards.slice(0, index)]
}

/**
 * Move a card by ID from one zone to another. Returns [newFrom, newTo].
 * Returns the original arrays unchanged if the card isn't found in `from`.
 * `position` controls where the card lands in `to`: 'top' (end, default),
 * 'bottom' (start), or a numeric splice index.
 */
export function moveCard(
  from: TCard[],
  to: TCard[],
  cardId: string,
  position: 'top' | 'bottom' | number = 'top'
): [TCard[], TCard[]] {
  const card = findCard(from, cardId)
  if (!card) return [from, to]

  const newFrom = removeCard(from, cardId)
  // When `to` is the same zone as `from`, insert relative to the
  // post-removal array so the card isn't duplicated by inserting into a
  // stale pre-removal snapshot.
  const insertBase = to === from ? newFrom : to
  const newTo =
    position === 'top'
      ? [...insertBase, card]
      : position === 'bottom'
        ? [card, ...insertBase]
        : [
            ...insertBase.slice(0, position),
            card,
            ...insertBase.slice(position),
          ]

  return [newFrom, newTo]
}

/**
 * Sort a hand of cards by a key extracted from each card. Returns a new array.
 * The caller supplies the key extractor since rank/suit ordering is game-specific.
 */
export function sortHand(
  cards: TCard[],
  by: (card: TCard) => number | string
): TCard[] {
  return [...cards].sort((a, b) => {
    const keyA = by(a)
    const keyB = by(b)
    if (keyA < keyB) return -1
    if (keyA > keyB) return 1
    return 0
  })
}

/**
 * Group cards into buckets by a key extracted from each card.
 * Returns an insertion-ordered Map from key to the cards sharing that key.
 */
export function groupBy<K>(
  cards: TCard[],
  keyFn: (card: TCard) => K
): Map<K, TCard[]> {
  const groups = new Map<K, TCard[]>()
  for (const card of cards) {
    const key = keyFn(card)
    const bucket = groups.get(key)
    if (bucket) {
      bucket.push(card)
    } else {
      groups.set(key, [card])
    }
  }

  return groups
}

/**
 * Look at the top `n` cards (end of array) without removing them.
 * `n` is clamped to the available card count and defaults to 1.
 */
export function peek(cards: TCard[], n = 1): TCard[] {
  const count = Math.max(0, Math.min(n, cards.length))
  return cards.slice(cards.length - count)
}

/**
 * Insert a card at a given index. Returns a new array.
 * `index` is clamped to [0, cards.length].
 */
export function insertAt(cards: TCard[], card: TCard, index: number): TCard[] {
  const clampedIndex = Math.max(0, Math.min(index, cards.length))
  return [...cards.slice(0, clampedIndex), card, ...cards.slice(clampedIndex)]
}

/**
 * Draw cards from the bottom of a zone (start of array).
 * Returns [drawnCards, remainingCards]. `count` is clamped to the available cards.
 */
export function drawFromBottom(
  cards: TCard[],
  count: number
): [TCard[], TCard[]] {
  const drawCount = Math.max(0, Math.min(count, cards.length))
  const drawn = cards.slice(0, drawCount)
  const remaining = cards.slice(drawCount)
  return [drawn, remaining]
}

export type DealPattern = 'round-robin' | 'per-player'

export type DealOptions = {
  players: number
  count: number
  pattern?: DealPattern
}

export type DealResult = {
  hands: TCard[][]
  remaining: TCard[]
}

/**
 * Deal cards from the top of a zone to a number of players.
 * `per-player` gives each player a consecutive block of `count` cards.
 * `round-robin` (default) deals one card per player per round, for `count` rounds.
 * Draws are clamped, so dealing more than the deck holds never throws.
 */
export function deal(
  cards: TCard[],
  { players, count, pattern = 'round-robin' }: DealOptions
): DealResult {
  const hands: TCard[][] = Array.from({ length: players }, () => [])
  let remaining = cards

  if (pattern === 'per-player') {
    for (let p = 0; p < players; p++) {
      const [drawn, rest] = drawCards(remaining, count)
      hands[p] = drawn
      remaining = rest
    }

    return { hands, remaining }
  }

  for (let round = 0; round < count; round++) {
    for (let p = 0; p < players; p++) {
      const [drawn, rest] = drawCards(remaining, 1)
      hands[p] = [...hands[p]!, ...drawn]
      remaining = rest
    }
  }

  return { hands, remaining }
}

// ---- Legacy class-based API for backwards compatibility ----

export type Zone = {
  name: string
  cards: TCard[]
  addCard(card: TCard): void
  removeCard(card: TCard): void
  shuffle(): void
}

export class StandardZone implements Zone {
  constructor(
    public name: string,
    public cards: TCard[] = []
  ) {}

  addCard(card: TCard): void {
    this.cards = addCard(this.cards, card)
  }

  removeCard(card: TCard): void {
    this.cards = removeCard(this.cards, card.id)
  }

  shuffle(): void {
    this.cards = shuffleCards(this.cards)
  }
}

export class Deck extends StandardZone {
  constructor(cards: TCard[] = []) {
    super('Deck', cards)
  }

  drawCard(): TCard | undefined {
    const card = this.cards.at(-1)
    if (card) {
      this.cards = this.cards.slice(0, -1)
    }

    return card
  }

  drawCards(count: number): TCard[] {
    const [drawn, remaining] = drawCards(this.cards, count)
    this.cards = remaining
    return drawn
  }
}

export class Hand extends StandardZone {
  constructor(cards: TCard[] = []) {
    super('Hand', cards)
  }
}

export class DiscardPile extends StandardZone {
  constructor(cards: TCard[] = []) {
    super('Discard Pile', cards)
  }
}

export class PlayArea extends StandardZone {
  constructor(cards: TCard[] = []) {
    super('Play Area', cards)
  }
}
