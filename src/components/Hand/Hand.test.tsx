import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { Hand } from './index.js'

const cards = [
  { id: 'ace-spades', suit: 'spades' as const, value: 'A' as const },
  { id: 'two-hearts', suit: 'hearts' as const, value: '2' as const },
  { id: 'three-diamonds', suit: 'diamonds' as const, value: '3' as const },
]

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
    await new Promise((resolve) => {
      setTimeout(resolve, interval)
    })
  }
}

test('render a hand with the first card focused by default', (t) => {
  const { lastFrame } = render(<Hand cards={cards} />)
  t.snapshot(lastFrame())
})

test('render a hand with no focus highlight when isFocused is false', (t) => {
  const { lastFrame } = render(
    <Hand cards={cards} isFocused={false} initialIndex={1} />
  )
  t.snapshot(lastFrame())
})

test('render a vertical hand', (t) => {
  const { lastFrame } = render(<Hand cards={cards} orientation="vertical" />)
  t.snapshot(lastFrame())
})

test('render an empty hand without crashing', (t) => {
  const { lastFrame } = render(<Hand cards={[]} />)
  t.snapshot(lastFrame())
})

test('arrow keys move the highlighted card', async (t) => {
  const { lastFrame, stdin } = render(<Hand cards={cards} />)
  const before = lastFrame()

  stdin.write(`${String.fromCodePoint(27)}[C`)
  await waitUntil(() => lastFrame() !== before)

  t.not(before, lastFrame())
})

test('Enter calls onSelect with the focused card', async (t) => {
  const selected: string[] = []
  const { stdin } = render(
    <Hand cards={cards} onSelect={(card) => selected.push(card.id)} />
  )

  stdin.write('\r')
  await waitUntil(() => selected.length > 0)

  t.deepEqual(selected, ['ace-spades'])
})
