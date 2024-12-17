import { type TCard } from '../types/index.js'

export type GameState = {
  currentPlayer: any
  players: any[]
  turn: number
  phase: string

  delayedEffects: any[]
  addDelayedEffect(turn: number, effect: () => void): void

  // ... other game state properties
}

export type CardEffect = {
  apply(gameState: GameState, eventData: any): void
}

export class ConditionalEffect implements CardEffect {
  constructor(
    private readonly condition: (gameState: GameState) => boolean,
    private readonly effect: CardEffect
  ) {}

  apply(gameState: GameState, eventData: any): void {
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

  apply(gameState: GameState, eventData: any): void {
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

  apply(gameState: GameState, _eventData: any): void {
    if (this.condition(gameState)) {
      this.applyEffect(gameState)
    } else {
      this.removeEffect(gameState)
    }
  }
}

export class DelayedEffect implements CardEffect {
  constructor(
    private readonly delay: number,
    private readonly effect: CardEffect
  ) {}

  apply(gameState: GameState, eventData: any): void {
    const currentTurn = gameState.turn
    gameState.addDelayedEffect(currentTurn + this.delay, () => {
      this.effect.apply(gameState, eventData)
    })
  }
}

export class TargetedEffect implements CardEffect {
  constructor(
    private readonly targetSelector: (gameState: GameState) => any,
    private readonly effect: CardEffect
  ) {}

  apply(gameState: GameState, eventData: any): void {
    const target = this.targetSelector(gameState)
    if (target) {
      this.effect.apply(gameState, { ...eventData, target })
    }
  }
}

export class DrawCardEffect implements CardEffect {
  constructor(private readonly count = 1) {}

  apply(gameState: GameState, _eventData: any): void {
    for (let i = 0; i < this.count; i++) {
      gameState.currentPlayer.drawCard()
    }
  }
}

export class DamageEffect implements CardEffect {
  constructor(private readonly damage: number) {}

  apply(_gameState: GameState, eventData: any): void {
    if (eventData.target) {
      eventData.target.takeDamage(this.damage)
    }
  }
}

export function attachEffectToCard(card: TCard, effect: CardEffect): void {
  card.effects ||= []
  card.effects.push(effect)
}

export class EffectManager {
  applyCardEffects(card: TCard, gameState: GameState, eventData: any): void {
    if (card.effects) {
      for (const effect of card.effects) {
        effect.apply(gameState, eventData)
      }
    }
  }

  // ApplyContinuousEffects(gameState: GameState): void {
  //   // Assuming gameState has a method to get all active continuous effects
  //   const continuousEffects = gameState.getActiveContinuousEffects()
  //   for (const effect of continuousEffects) {
  //     effect.apply(gameState, {})
  //   }
  // }
}
