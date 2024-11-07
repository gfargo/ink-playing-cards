import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import CardStack from './index.js'

test('render queen of clubs face up', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[{ id: 'queen-of-clubs', suit: 'clubs', value: 'Q' }]}
      name="test"
    />
  )
  const queenOfClubsLastFrame = lastFrame()
  t.snapshot(queenOfClubsLastFrame)

  // Check it contains clubs symbol
  // if (queenOfClubsLastFrame) {
  //   t.true(queenOfClubsLastFrame.includes('♣'))
  // }
})
