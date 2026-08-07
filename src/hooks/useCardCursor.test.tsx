import { render } from 'ink-testing-library'
import React from 'react'
import test from 'ava'
import type { TCard } from '../types/index.js'
import { useCardCursor, type UseCardCursorResult } from './useCardCursor.js'

function makeCards(n: number): TCard[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `card-${i}`,
    suit: 'hearts' as const,
    value: 'A' as const,
  }))
}

const delay = async (ms: number) => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// Ink's reconciler flushes state updates asynchronously, and the delay
// before a flush lands is unbounded under CPU contention (e.g. the full
// test suite running many renders in parallel) — poll instead of a fixed
// sleep so these tests aren't flaky under load.
const waitUntil = async (
  predicate: () => boolean,
  { timeout = 2000, interval = 10 } = {}
) => {
  const deadline = Date.now() + timeout
  while (!predicate()) {
    if (Date.now() >= deadline) {
      throw new Error('waitUntil: condition was not met before timeout')
    }

    // eslint-disable-next-line no-await-in-loop
    await delay(interval)
  }
}

const ESC = String.fromCodePoint(27)
const ARROW_LEFT = `${ESC}[D`
const ARROW_RIGHT = `${ESC}[C`
const ENTER = '\r'

function Probe<T extends { id: string }>({
  cards,
  options,
  onSnapshot,
}: {
  readonly cards: T[]
  readonly options?: Parameters<typeof useCardCursor<T>>[1]
  readonly onSnapshot?: (result: UseCardCursorResult<T>) => void
}) {
  const result = useCardCursor(cards, options)
  onSnapshot?.(result)
  return null
}

test('initial cursor is clamped to the initialIndex option', (t) => {
  const snapshots: Array<UseCardCursorResult<TCard>> = []
  render(
    <Probe
      cards={makeCards(3)}
      options={{ initialIndex: 1 }}
      onSnapshot={(r) => snapshots.push(r)}
    />
  )

  t.is(snapshots.at(-1)!.cursor, 1)
  t.is(snapshots.at(-1)!.selectedCard?.id, 'card-1')
})

test('initial cursor is clamped when initialIndex is out of range', (t) => {
  const snapshots: Array<UseCardCursorResult<TCard>> = []
  render(
    <Probe
      cards={makeCards(3)}
      options={{ initialIndex: 99 }}
      onSnapshot={(r) => snapshots.push(r)}
    />
  )

  t.is(snapshots.at(-1)!.cursor, 2)
})

test('arrow keys move the cursor and clamp at the ends by default', async (t) => {
  const snapshots: Array<UseCardCursorResult<TCard>> = []
  const { stdin } = render(
    <Probe cards={makeCards(3)} onSnapshot={(r) => snapshots.push(r)} />
  )

  t.is(snapshots.at(-1)!.cursor, 0)

  stdin.write(ARROW_LEFT)
  await delay(20)
  t.is(snapshots.at(-1)!.cursor, 0)

  stdin.write(ARROW_RIGHT)
  await waitUntil(() => snapshots.at(-1)!.cursor === 1)
  t.is(snapshots.at(-1)!.cursor, 1)

  stdin.write(ARROW_RIGHT)
  stdin.write(ARROW_RIGHT)
  await waitUntil(() => snapshots.at(-1)!.cursor === 2)

  stdin.write(ARROW_RIGHT)
  await delay(20)
  t.is(snapshots.at(-1)!.cursor, 2)
})

test('wrap option wraps the cursor around the ends', async (t) => {
  const snapshots: Array<UseCardCursorResult<TCard>> = []
  const { stdin } = render(
    <Probe
      cards={makeCards(3)}
      options={{ wrap: true }}
      onSnapshot={(r) => snapshots.push(r)}
    />
  )

  stdin.write(ARROW_LEFT)
  await waitUntil(() => snapshots.at(-1)!.cursor === 2)
  t.is(snapshots.at(-1)!.cursor, 2)

  stdin.write(ARROW_RIGHT)
  stdin.write(ARROW_RIGHT)
  await waitUntil(() => snapshots.at(-1)!.cursor === 1)
  t.is(snapshots.at(-1)!.cursor, 1)
})

test('Enter triggers onSelect with the current card and index', async (t) => {
  const selected: Array<{ id: string; index: number }> = []
  const snapshots: Array<UseCardCursorResult<TCard>> = []
  const { stdin } = render(
    <Probe
      cards={makeCards(3)}
      options={{
        onSelect(card, index) {
          selected.push({ id: card.id, index })
        },
      }}
      onSnapshot={(r) => snapshots.push(r)}
    />
  )

  stdin.write(ARROW_RIGHT)
  await waitUntil(() => snapshots.at(-1)!.cursor === 1)
  // UseInput rebinds its listener in a useEffect that runs after this
  // commit, so give it a moment to settle before the next keypress.
  await delay(20)

  stdin.write(ENTER)
  await waitUntil(() => selected.length > 0)

  t.deepEqual(selected, [{ id: 'card-1', index: 1 }])
})

test('onHighlight fires for the initial index on mount', async (t) => {
  const highlighted: Array<{ id: string; index: number }> = []
  render(
    <Probe
      cards={makeCards(3)}
      options={{
        onHighlight(card, index) {
          highlighted.push({ id: card.id, index })
        },
      }}
    />
  )
  await waitUntil(() => highlighted.length > 0)

  t.deepEqual(highlighted, [{ id: 'card-0', index: 0 }])
})

test('isFocused false makes keypresses a no-op', async (t) => {
  const snapshots: Array<UseCardCursorResult<TCard>> = []
  const selected: string[] = []
  const { stdin } = render(
    <Probe
      cards={makeCards(3)}
      options={{
        isFocused: false,
        onSelect: (card) => selected.push(card.id),
      }}
      onSnapshot={(r) => snapshots.push(r)}
    />
  )

  stdin.write(ARROW_RIGHT)
  stdin.write(ENTER)
  await delay(50)

  t.is(snapshots.at(-1)!.cursor, 0)
  t.deepEqual(selected, [])
})

test('shrinking the cards array re-clamps the cursor', async (t) => {
  const snapshots: Array<UseCardCursorResult<TCard>> = []
  const { rerender } = render(
    <Probe
      cards={makeCards(5)}
      options={{ initialIndex: 4 }}
      onSnapshot={(r) => snapshots.push(r)}
    />
  )

  t.is(snapshots.at(-1)!.cursor, 4)

  rerender(
    <Probe
      cards={makeCards(2)}
      options={{ initialIndex: 4 }}
      onSnapshot={(r) => snapshots.push(r)}
    />
  )
  await waitUntil(() => snapshots.at(-1)!.cursor === 1)
  t.is(snapshots.at(-1)!.cursor, 1)
})

test('empty cards array is safe: no crash, selectedCard is undefined', async (t) => {
  const snapshots: Array<UseCardCursorResult<TCard>> = []
  const { stdin } = render(
    <Probe cards={[]} onSnapshot={(r) => snapshots.push(r)} />
  )

  t.is(snapshots.at(-1)!.cursor, 0)
  t.is(snapshots.at(-1)!.selectedCard, undefined)

  stdin.write(ARROW_RIGHT)
  stdin.write(ENTER)
  await delay(50)

  t.is(snapshots.at(-1)!.cursor, 0)
  t.is(snapshots.at(-1)!.selectedCard, undefined)
})
