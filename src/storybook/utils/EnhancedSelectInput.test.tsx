import process from 'node:process'
import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { EnhancedSelectInput, type Item } from './EnhancedSelectInput.js'

const items: Array<Item<string>> = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
  { label: 'Three', value: 'three' },
  { label: 'Four', value: 'four' },
  { label: 'Five', value: 'five' },
]

test('limit windows the list around the selected item instead of always showing the first `limit` entries', (t) => {
  const { lastFrame } = render(
    <EnhancedSelectInput items={items} limit={2} initialIndex={4} />
  )

  // Item 4 ("Five") is outside the first `limit` (2) entries. A truncating
  // implementation would always render "One"/"Two" and never reach it.
  const frame = lastFrame()
  t.true(frame?.includes('Five'))
  t.false(frame?.includes('One'))
})

test('limit still shows the first window when the selection is within it', (t) => {
  const { lastFrame } = render(<EnhancedSelectInput items={items} limit={2} />)

  const frame = lastFrame()
  t.true(frame?.includes('One'))
  t.true(frame?.includes('Two'))
  t.false(frame?.includes('Five'))
})

test('navigation hotkeys do not also trigger selection', async (t) => {
  const selected: string[] = []
  const itemsWithHotkeys: Array<Item<string>> = [
    { label: 'Jump', value: 'jump', hotkey: 'j' },
    { label: 'Kick', value: 'kick', hotkey: 'k' },
  ]

  const { stdin } = render(
    <EnhancedSelectInput
      items={itemsWithHotkeys}
      onSelect={(item) => selected.push(item.value)}
    />
  )

  stdin.write('j')
  stdin.write('k')

  await new Promise((resolve) => {
    setTimeout(resolve, 200)
  })

  t.deepEqual(selected, [])
})

test('limit scrolls the window one row at a time instead of jumping by pages', async (t) => {
  const { lastFrame, stdin } = render(
    <EnhancedSelectInput items={items} limit={2} />
  )

  // Starting window is [One, Two].
  t.true(lastFrame()?.includes('One'))
  t.true(lastFrame()?.includes('Two'))

  stdin.write('j')
  await new Promise((resolve) => {
    setTimeout(resolve, 100)
  })

  // Selection moved to "Two" which is still within the window, so it
  // should not have scrolled yet.
  t.true(lastFrame()?.includes('One'))
  t.true(lastFrame()?.includes('Two'))

  stdin.write('j')
  await new Promise((resolve) => {
    setTimeout(resolve, 100)
  })

  // Selection moved to "Three", past the window edge, so it scrolls by a
  // single row to [Two, Three] rather than jumping to the next full page.
  const frame = lastFrame()
  t.false(frame?.includes('One'))
  t.true(frame?.includes('Two'))
  t.true(frame?.includes('Three'))
})

test('hotkey selection outside the visible window scrolls it into view', async (t) => {
  const itemsWithHotkeys: Array<Item<string>> = [
    { label: 'One', value: 'one' },
    { label: 'Two', value: 'two' },
    { label: 'Three', value: 'three' },
    { label: 'Four', value: 'four' },
    { label: 'Five', value: 'five', hotkey: 'f' },
  ]

  const { lastFrame, stdin } = render(
    <EnhancedSelectInput items={itemsWithHotkeys} limit={2} />
  )

  // Starting window is [One, Two]; "Five" is well outside it.
  t.true(lastFrame()?.includes('One'))
  t.false(lastFrame()?.includes('Five'))

  stdin.write('f')
  await new Promise((resolve) => {
    setTimeout(resolve, 100)
  })

  // The hotkey selection should have scrolled the window so "Five" is
  // visible and rendered as the highlighted (indicator-marked) row.
  // eslint-disable-next-line no-control-regex
  const plainFrame = lastFrame()?.replace(/\u001B\[[\d;]*m/g, '')
  t.true(plainFrame?.includes('Five'))
  t.false(plainFrame?.includes('One'))
  t.true(plainFrame?.includes('> Five'))
})

test('warns in development when a hotkey collides with the active navigation keys', (t) => {
  const calls: unknown[][] = []
  const originalWarn = console.warn
  const originalNodeEnv = process.env['NODE_ENV']
  console.warn = (...args: unknown[]) => {
    calls.push(args)
  }

  process.env['NODE_ENV'] = 'development'
  render(
    <EnhancedSelectInput
      items={[{ label: 'Jump', value: 'jump', hotkey: 'j' }]}
    />
  )

  console.warn = originalWarn
  process.env['NODE_ENV'] = originalNodeEnv

  t.true(calls.length > 0)
  t.true(String(calls[0]?.[0]).includes('"j"'))
})

test('does not warn when no hotkey collides with the active navigation keys', (t) => {
  const calls: unknown[][] = []
  const originalWarn = console.warn
  const originalNodeEnv = process.env['NODE_ENV']
  console.warn = (...args: unknown[]) => {
    calls.push(args)
  }

  process.env['NODE_ENV'] = 'development'
  render(
    <EnhancedSelectInput
      items={[{ label: 'Select', value: 'select', hotkey: 's' }]}
    />
  )

  console.warn = originalWarn
  process.env['NODE_ENV'] = originalNodeEnv

  t.is(calls.length, 0)
})
