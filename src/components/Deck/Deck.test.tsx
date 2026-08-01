import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { DeckProvider } from '../../contexts/DeckContext.js'
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

// B15 regression: Deck with custom card as top card should render it, not null
test('render deck with custom card as top of deck (B15)', (t) => {
  const { lastFrame } = render(
    <DeckProvider
      initialCards={[
        { id: 'std-1', suit: 'hearts' as const, value: 'A' as const },
        {
          id: 'custom-top',
          title: 'Wild',
          description: 'Custom top card',
          size: 'small' as const,
        },
      ]}
    >
      <Deck showTopCard />
    </DeckProvider>
  )
  const deckLastFrame = lastFrame()
  t.snapshot(deckLastFrame)
  // Custom top card title should appear (was previously null/not rendered)
  if (deckLastFrame) {
    t.true(deckLastFrame.includes('Wild'))
  }
})
