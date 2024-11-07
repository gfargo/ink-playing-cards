export type GameEvent = {
  type: string
  data: any
}

export type EventListener = {
  handleEvent(event: GameEvent): void
}

export class EventManager {
  private readonly listeners = new Map<string, EventListener[]>()

  addEventListener(eventType: string, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }

    this.listeners.get(eventType)!.push(listener)
  }

  removeEventListener(eventType: string, listener: EventListener): void {
    if (this.listeners.has(eventType)) {
      const typeListeners = this.listeners.get(eventType)!
      const index = typeListeners.indexOf(listener)
      if (index !== -1) {
        typeListeners.splice(index, 1)
      }
    }
  }

  dispatchEvent(event: GameEvent): void {
    if (this.listeners.has(event.type)) {
      for (const listener of this.listeners.get(event.type)!) {
        listener.handleEvent(event)
      }
    }
  }
}
