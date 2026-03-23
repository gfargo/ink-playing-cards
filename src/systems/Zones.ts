import { type TCard } from '../types/index.js'

/**
 * Pure utility functions for zone operations.
 * These return new arrays instead of mutating, making them safe for use in reducers.
 */

/**
 * Shuffle an array of cards using Fisher-Yates. Returns a new array.
 */
export function shuffleCards(cards: TCard[]): TCard[] {
  const shuffled = [...cards]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const index = Math.floor(Math.random() * (i + 1))
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
