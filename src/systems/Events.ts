import {
  type EventListenerInterface,
  type EventListenerOptions,
  type EventManagerInterface,
  type GameEventData,
} from '../types/index.js'

export type GameEvent = GameEventData

export class EventManager implements EventManagerInterface {
  private readonly listeners = new Map<string, EventListenerInterface[]>()
  private readonly onceListeners = new WeakSet<EventListenerInterface>()

  addEventListener(
    eventType: string,
    listener: EventListenerInterface,
    options?: EventListenerOptions
  ): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }

    this.listeners.get(eventType)!.push(listener)

    if (options?.once) {
      this.onceListeners.add(listener)
    }
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
    const typeListeners = this.listeners.get(event.type)
    if (!typeListeners) {
      return
    }

    // Iterate a snapshot so listeners added/removed mid-dispatch (including
    // by other listeners) don't affect this dispatch pass.
    const snapshot = [...typeListeners]
    for (const listener of snapshot) {
      if (this.onceListeners.has(listener)) {
        this.removeEventListener(event.type, listener)
        this.onceListeners.delete(listener)
      }

      try {
        listener.handleEvent(event)
      } catch (error) {
        console.error(`EventManager: listener for "${event.type}" threw`, error)
      }
    }
  }

  removeAllListeners(): void {
    this.listeners.clear()
  }
}

export { type EventListenerInterface as EventListener } from '../types/index.js'
