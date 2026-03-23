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
  constructor(
    readonly delay: number,
    readonly effect: CardEffect
  ) {}

  apply(gameState: GameState, _eventData: GameEventData): void {
    // Delayed effects are evaluated by the game loop.
    // Check if the current turn has reached the target turn,
    // then call this.effect.apply() to resolve.
    void gameState
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
  constructor(private readonly count = 1) {}

  apply(gameState: GameState, _eventData: GameEventData): void {
    // Signal that the current player should draw cards.
    // The actual draw is handled by the reducer/game loop.
    void gameState
    void this.count
  }
}

export class DamageEffect implements CardEffect {
  constructor(private readonly damage: number) {}

  apply(_gameState: GameState, eventData: GameEventData): void {
    // Apply damage to the target if present in event data.
    void eventData
    void this.damage
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
