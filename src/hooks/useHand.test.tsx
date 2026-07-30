import { render } from 'ink-testing-library'
import React from 'react'
import test from 'ava'
import { useHand } from './useHand.js'

function Probe() {
  useHand('p1')
  return null
}

test('useHand throws when used outside a DeckProvider', (t) => {
  const { lastFrame } = render(<Probe />)
  t.true(lastFrame()?.includes('useHand must be used within a DeckProvider'))
})
