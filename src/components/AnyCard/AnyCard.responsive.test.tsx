import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { AnyCard } from './index.js'

// AnyCard — variant="responsive" dispatch
//
// ink-testing-library's fake stdout hard-codes `columns` to 100, which is
// >= the `ascii` breakpoint (80). So a responsive AnyCard rendered under
// the test harness always resolves to the `ascii` variant. Full breakpoint
// coverage lives in src/utils/responsive.test.ts.

test('variant="responsive" matches an explicit variant="ascii" render at 100 cols', (t) => {
  const responsive = render(
    <AnyCard
      faceUp
      card={{ id: 'king-hearts', suit: 'hearts', value: 'K' }}
      variant="responsive"
    />
  ).lastFrame()
  const explicit = render(
    <AnyCard
      faceUp
      card={{ id: 'king-hearts', suit: 'hearts', value: 'K' }}
      variant="ascii"
    />
  ).lastFrame()
  const simple = render(
    <AnyCard
      faceUp
      card={{ id: 'king-hearts', suit: 'hearts', value: 'K' }}
      variant="simple"
    />
  ).lastFrame()
  t.is(responsive, explicit)
  t.not(responsive, simple)
})
