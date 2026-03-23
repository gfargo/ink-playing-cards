import test from 'ava'
import type { EventListenerInterface, GameEventData } from '../types/index.js'
import { EventManager } from './Events.js'

function makeEvent(type: string): GameEventData {
  return { type }
}

function makeListener(): EventListenerInterface & { calls: GameEventData[] } {
  const calls: GameEventData[] = []
  return {
    calls,
    handleEvent(event: GameEventData) {
      calls.push(event)
    },
  }
}

test('addEventListener and dispatchEvent calls listener', (t) => {
  const em = new EventManager()
  const listener = makeListener()
  em.addEventListener('CARDS_DRAWN', listener)
  em.dispatchEvent(makeEvent('CARDS_DRAWN'))
  t.is(listener.calls.length, 1)
  t.is(listener.calls[0]!.type, 'CARDS_DRAWN')
})

test('dispatchEvent does not call listeners for other event types', (t) => {
  const em = new EventManager()
  const listener = makeListener()
  em.addEventListener('CARDS_DRAWN', listener)
  em.dispatchEvent(makeEvent('CARD_PLAYED'))
  t.is(listener.calls.length, 0)
})

test('multiple listeners for the same event', (t) => {
  const em = new EventManager()
  const l1 = makeListener()
  const l2 = makeListener()
  em.addEventListener('DECK_SHUFFLED', l1)
  em.addEventListener('DECK_SHUFFLED', l2)
  em.dispatchEvent(makeEvent('DECK_SHUFFLED'))
  t.is(l1.calls.length, 1)
  t.is(l2.calls.length, 1)
})

test('removeEventListener stops future dispatches', (t) => {
  const em = new EventManager()
  const listener = makeListener()
  em.addEventListener('CARDS_DRAWN', listener)
  em.dispatchEvent(makeEvent('CARDS_DRAWN'))
  t.is(listener.calls.length, 1)
  em.removeEventListener('CARDS_DRAWN', listener)
  em.dispatchEvent(makeEvent('CARDS_DRAWN'))
  t.is(listener.calls.length, 1)
})

test('removeEventListener for non-existent type is a no-op', (t) => {
  const em = new EventManager()
  const listener = makeListener()
  em.removeEventListener('NOPE', listener)
  t.pass()
})

test('removeEventListener for non-registered listener is a no-op', (t) => {
  const em = new EventManager()
  const l1 = makeListener()
  const l2 = makeListener()
  em.addEventListener('X', l1)
  em.removeEventListener('X', l2)
  em.dispatchEvent(makeEvent('X'))
  t.is(l1.calls.length, 1)
})

test('dispatchEvent with no listeners is a no-op', (t) => {
  const em = new EventManager()
  em.dispatchEvent(makeEvent('NOTHING'))
  t.pass()
})

test('event data is passed through to listener', (t) => {
  const em = new EventManager()
  const listener = makeListener()
  em.addEventListener('CARDS_DRAWN', listener)
  const event: GameEventData = { type: 'CARDS_DRAWN', count: 3, playerId: 'p1' }
  em.dispatchEvent(event)
  t.is(listener.calls[0]!.count, 3)
  t.is(listener.calls[0]!.playerId, 'p1')
})

test('removeAllListeners clears all listeners', (t) => {
  const em = new EventManager()
  const l1 = makeListener()
  const l2 = makeListener()
  em.addEventListener('A', l1)
  em.addEventListener('B', l2)
  em.removeAllListeners()
  em.dispatchEvent(makeEvent('A'))
  em.dispatchEvent(makeEvent('B'))
  t.is(l1.calls.length, 0)
  t.is(l2.calls.length, 0)
})
