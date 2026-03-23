import {
  type EventListenerInterface,
  type EventManagerInterface,
  type GameEventData,
} from '../types/index.js'

export type GameEvent = GameEventData

export class EventManager implements EventManagerInterface {
  private readonly listeners = new Map<string, EventListenerInterface[]>()

  addEventListener(eventType: string, listener: EventListenerInterface): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }

    this.listeners.get(eventType)!.push(listener)
  }

  removeEventListener(
    eventType: string,
    listener: EventListenerInterface
  ): void {
    if (this.listeners.has(eventType)) {
      const typeListeners = this.listeners.get(eventType)!
      const index = typeListeners.indexOf(listener)
      if (index !== -1) {
        typeListeners.splice(index, 1)
      }
    }
  }

  dispatchEvent(event: GameEventData): void {
    if (this.listeners.has(event.type)) {
      for (const listener of this.listeners.get(event.type)!) {
        listener.handleEvent(event)
      }
    }
  }

  removeAllListeners(): void {
    this.listeners.clear()
  }
}

export { type EventListenerInterface as EventListener } from '../types/index.js'
