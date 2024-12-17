import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { Deck } from './index.js'

test('render deck with defaults', (t) => {
  const { lastFrame } = render(<Deck />)
  const deckLastFrame = lastFrame()
  t.snapshot(deckLastFrame)
})

test('render deck with top card visible', (t) => {
  const { lastFrame } = render(<Deck showTopCard />)
  const deckLastFrame = lastFrame()
  t.snapshot(deckLastFrame)
})

test('render deck with custom placeholder card', (t) => {
  const { lastFrame } = render(
    <Deck placeholderCard={{ suit: 'clubs', value: '8' }} />
  )
  const deckLastFrame = lastFrame()
  t.snapshot(deckLastFrame)
})

test('render deck with minimal variant', (t) => {
  const { lastFrame } = render(<Deck variant="minimal" />)
  const deckLastFrame = lastFrame()
  t.snapshot(deckLastFrame)
})

test('render deck with ascii variant', (t) => {
  const { lastFrame } = render(<Deck variant="ascii" />)
  const deckLastFrame = lastFrame()
  t.snapshot(deckLastFrame)
})
