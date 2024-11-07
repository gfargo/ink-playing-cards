import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import Deck from './index.js'

test('render deck', (t) => {
  const { lastFrame } = render(<Deck />)
  const deckLastFrame = lastFrame()
  t.snapshot(deckLastFrame)
})

test('render deck with top card visible', (t) => {
  const { lastFrame } = render(<Deck showTopCard />)
  const deckLastFrame = lastFrame()
  t.snapshot(deckLastFrame)
})
