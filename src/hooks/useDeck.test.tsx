import { render } from 'ink-testing-library'
import React from 'react'
import test from 'ava'
import { useDeck } from './useDeck.js'

test('useDeck throws when used outside a DeckProvider', (t) => {
  let caught: unknown

  function Probe() {
    try {
      useDeck()
    } catch (error) {
      caught = error
    }

    return null
  }

  render(<Probe />)

  t.true(caught instanceof Error)
  t.is((caught as Error).message, 'useDeck must be used within a DeckProvider')
})
