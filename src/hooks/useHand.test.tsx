import { render } from 'ink-testing-library'
import React from 'react'
import test from 'ava'
import { useHand } from './useHand.js'

test('useHand throws when used outside a DeckProvider', (t) => {
  let caught: unknown

  function Probe() {
    try {
      useHand('p1')
    } catch (error) {
      caught = error
    }

    return null
  }

  render(<Probe />)

  t.true(caught instanceof Error)
  t.is((caught as Error).message, 'useHand must be used within a DeckProvider')
})
