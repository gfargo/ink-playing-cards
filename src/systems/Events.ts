import {
  type EventListenerInterface,
  type EventListenerOptions,
  type EventManagerInterface,
  type GameEventData,
} from '../types/index.js'

export type GameEvent = GameEventData

type ListenerEntry = {
  listener: EventListenerInterface
  once: boolean
}

export class EventManager implements EventManagerInterface {
  private readonly listeners = new Map<string, ListenerEntry[]>()

  addEventListener(
    eventType: string,
    listener: EventListenerInterface,
    options?: EventListenerOptions
  ): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }

    this.listeners
      .get(eventType)!
      .push({ listener, once: Boolean(options?.once) })
  }

  removeEventListener(
    eventType: string,
    listener: EventListenerInterface
  ): void {
    if (this.listeners.has(eventType)) {
      const typeListeners = this.listeners.get(eventType)!
      const index = typeListeners.findIndex(
        (entry) => entry.listener === listener
      )
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
    for (const entry of snapshot) {
      if (entry.once) {
        // Remove this exact entry (not just any entry for this listener) so
        // duplicate registrations of the same listener are tracked
        // independently, and other event types for this listener are
        // unaffected.
        const current = this.listeners.get(event.type)
        if (current) {
          const index = current.indexOf(entry)
          if (index !== -1) {
            current.splice(index, 1)
          }
        }
      }

      try {
        entry.listener.handleEvent(event)
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
