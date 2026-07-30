import { render } from 'ink-testing-library'
import React from 'react'
import test from 'ava'
import { useDeck } from './useDeck.js'

function Probe() {
  useDeck()
  return null
}

test('useDeck throws when used outside a DeckProvider', (t) => {
  const { lastFrame } = render(<Probe />)
  t.true(lastFrame()?.includes('useDeck must be used within a DeckProvider'))
})
