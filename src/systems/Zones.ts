import { type Card } from '../types/index.js'

export type Zone = {
  name: string
  cards: Card[]
  addCard(card: Card): void
  removeCard(card: Card): void
  shuffle(): void
}

export class StandardZone implements Zone {
  constructor(
    public name: string,
    public cards: Card[] = []
  ) {}

  addCard(card: Card): void {
    this.cards.push(card)
  }

  removeCard(card: Card): void {
    const index = this.cards.findIndex((c) => c.id === card.id)
    if (index !== -1) {
      this.cards.splice(index, 1)
    }
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const index = Math.floor(Math.random() * (i + 1))
      // @ts-ignore
      ;[this.cards[i], this.cards[index]] = [this.cards[index], this.cards[i]]
    }
  }
}

export class Deck extends StandardZone {
  constructor(cards: Card[] = []) {
    super('Deck', cards)
  }

  drawCard(): Card | undefined {
    return this.cards.pop()
  }
}

export class Hand extends StandardZone {
  constructor(cards: Card[] = []) {
    super('Hand', cards)
  }
}

export class DiscardPile extends StandardZone {
  constructor(cards: Card[] = []) {
    super('Discard Pile', cards)
  }
}

export class PlayArea extends StandardZone {
  constructor(cards: Card[] = []) {
    super('Play Area', cards)
  }
}
