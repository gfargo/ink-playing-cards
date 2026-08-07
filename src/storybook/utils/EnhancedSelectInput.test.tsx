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
