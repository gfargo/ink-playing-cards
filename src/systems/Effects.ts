import {
  type CardEffect,
  type EffectManagerInterface,
  type GameEventData,
  type GameState,
  type TCard,
} from '../types/index.js'

export class ConditionalEffect implements CardEffect {
  constructor(
    private readonly condition: (gameState: GameState) => boolean,
    private readonly effect: CardEffect
  ) {}

  apply(gameState: GameState, eventData: GameEventData): void {
    if (this.condition(gameState)) {
      this.effect.apply(gameState, eventData)
    }
  }
}

export class TriggeredEffect implements CardEffect {
  constructor(
    private readonly triggerEvent: string,
    private readonly effect: CardEffect
  ) {}

  apply(gameState: GameState, eventData: GameEventData): void {
    if (eventData.type === this.triggerEvent) {
      this.effect.apply(gameState, eventData)
    }
  }
}

export class ContinuousEffect implements CardEffect {
  constructor(
    private readonly condition: (gameState: GameState) => boolean,
    private readonly applyEffect: (gameState: GameState) => void,
    private readonly removeEffect: (gameState: GameState) => void
  ) {}

  apply(gameState: GameState, _eventData: GameEventData): void {
    if (this.condition(gameState)) {
      this.applyEffect(gameState)
    } else {
      this.removeEffect(gameState)
    }
  }
}

export class DelayedEffect implements CardEffect {
  private turnRegistered: number | undefined

  constructor(
    readonly delay: number,
    readonly effect: CardEffect
  ) {}

  apply(gameState: GameState, eventData: GameEventData): void {
    if (this.turnRegistered === undefined) {
      this.turnRegistered = gameState.turn
      return
    }

    if (gameState.turn >= this.turnRegistered + this.delay) {
      this.effect.apply(gameState, eventData)
      this.turnRegistered = undefined
    }
  }
}

export class TargetedEffect implements CardEffect {
  constructor(
    private readonly targetSelector: (gameState: GameState) => unknown,
    private readonly effect: CardEffect
  ) {}

  apply(gameState: GameState, eventData: GameEventData): void {
    const target = this.targetSelector(gameState)
    if (target) {
      this.effect.apply(gameState, { ...eventData, target })
    }
  }
}

export class DrawCardEffect implements CardEffect {
  readonly count: number

  constructor(count = 1) {
    this.count = count
  }

  apply(gameState: GameState, eventData: GameEventData): void {
    const playerId = eventData.playerId ?? gameState.currentPlayerId
    const { deck } = gameState.zones
    const drawCount = Math.min(this.count, deck.length)
    const drawn = deck.splice(deck.length - drawCount, drawCount)
    const hand = gameState.zones.hands[playerId] ?? []
    gameState.zones.hands[playerId] = [...hand, ...drawn]
  }
}

export class DamageEffect implements CardEffect {
  constructor(readonly damage: number) {}

  apply(_gameState: GameState, eventData: GameEventData): void {
    const target = eventData.target as
      | { life?: number; health?: number }
      | undefined
    if (target) {
      if (typeof target.life === 'number') {
        target.life -= this.damage
      } else if (typeof target.health === 'number') {
        target.health -= this.damage
      }
    }
  }
}

export function attachEffectToCard(card: TCard, effect: CardEffect): void {
  card.effects ||= []
  card.effects.push(effect)
}

export class EffectManager implements EffectManagerInterface {
  applyCardEffects(
    card: TCard,
    gameState: GameState,
    eventData: GameEventData
  ): void {
    if (card.effects) {
      for (const effect of card.effects) {
        effect.apply(gameState, eventData)
      }
    }
  }
}

export { type GameState, type CardEffect } from '../types/index.js'
