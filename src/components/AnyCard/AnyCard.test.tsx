import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { DrawCardEffect } from '../../systems/Effects.js'
import { AnyCard } from './index.js'

// AnyCard — standard card branches

test('standard card simple variant renders suit and value', (t) => {
  const { lastFrame } = render(
    <AnyCard
      faceUp
      card={{ id: 'ace-spades', suit: 'spades', value: 'A' }}
      variant="simple"
    />
  )
  const frame = lastFrame()
  t.snapshot(frame)
  if (frame) {
    t.true(frame.includes('♠'))
    t.true(frame.includes('A'))
  }
})

test('standard card ascii variant renders suit and value', (t) => {
  const { lastFrame } = render(
    <AnyCard
      faceUp
      card={{ id: 'king-hearts', suit: 'hearts', value: 'K' }}
      variant="ascii"
    />
  )
  const frame = lastFrame()
  t.snapshot(frame)
  if (frame) {
    t.true(frame.includes('♥'))
    t.true(frame.includes('K'))
  }
})

test('standard card mini variant renders MiniCard', (t) => {
  const { lastFrame } = render(
    <AnyCard
      faceUp
      card={{ id: 'two-clubs', suit: 'clubs', value: '2' }}
      variant="mini"
    />
  )
  const frame = lastFrame()
  t.snapshot(frame)
  if (frame) {
    t.true(frame.includes('♣'))
    t.true(frame.includes('2'))
  }
})

test('standard card micro variant renders MiniCard', (t) => {
  const { lastFrame } = render(
    <AnyCard
      faceUp
      card={{ id: 'three-diamonds', suit: 'diamonds', value: '3' }}
      variant="micro"
    />
  )
  const frame = lastFrame()
  t.snapshot(frame)
  if (frame) {
    t.true(frame.includes('♦'))
    t.true(frame.includes('3'))
  }
})

test('standard card with effects renders an indicator (Card path)', (t) => {
  const withEffects = render(
    <AnyCard
      faceUp
      card={{
        id: 'ace-spades-fx',
        suit: 'spades',
        value: 'A',
        effects: [new DrawCardEffect(1)],
      }}
      variant="simple"
    />
  ).lastFrame()
  const withoutEffects = render(
    <AnyCard
      faceUp
      card={{ id: 'ace-spades-fx', suit: 'spades', value: 'A' }}
      variant="simple"
    />
  ).lastFrame()
  t.not(withEffects, withoutEffects)
})

test('standard card with effects renders an indicator (MiniCard path)', (t) => {
  const withEffects = render(
    <AnyCard
      faceUp
      card={{
        id: 'two-clubs-fx',
        suit: 'clubs',
        value: '2',
        effects: [new DrawCardEffect(1)],
      }}
      variant="mini"
    />
  ).lastFrame()
  const withoutEffects = render(
    <AnyCard
      faceUp
      card={{ id: 'two-clubs-fx', suit: 'clubs', value: '2' }}
      variant="mini"
    />
  ).lastFrame()
  t.not(withEffects, withoutEffects)
})

test('standard card face down renders back', (t) => {
  const { lastFrame } = render(
    <AnyCard
      card={{ id: 'jack-hearts', suit: 'hearts', value: 'J' }}
      variant="simple"
      faceUp={false}
    />
  )
  const frame = lastFrame()
  t.snapshot(frame)
  // Face down should NOT contain the suit symbol
  if (frame) {
    t.false(frame.includes('♥'))
  }
})

// AnyCard — custom card branch

test('custom card renders title', (t) => {
  const { lastFrame } = render(
    <AnyCard
      faceUp
      card={{ id: 'wild-card', title: 'Wild', size: 'small' as const }}
      variant="simple"
    />
  )
  const frame = lastFrame()
  t.snapshot(frame)
  if (frame) {
    t.true(frame.includes('Wild'))
  }
})

test('custom card face down renders card back', (t) => {
  const { lastFrame } = render(
    <AnyCard
      card={{ id: 'custom-1', title: 'Fireball', size: 'small' as const }}
      variant="simple"
      faceUp={false}
    />
  )
  const frame = lastFrame()
  t.snapshot(frame)
  // Face down should NOT show the title
  if (frame) {
    t.false(frame.includes('Fireball'))
  }
})

test('custom card variant prop is ignored (CustomCard renders by size)', (t) => {
  const cardProps = {
    id: 'custom-2',
    title: 'Frost Nova',
    size: 'mini' as const,
  }

  const { lastFrame: frameMini } = render(
    <AnyCard faceUp card={cardProps} variant="mini" />
  )
  const { lastFrame: frameAscii } = render(
    <AnyCard faceUp card={cardProps} variant="ascii" />
  )

  // Both should render the title regardless of variant
  const mini = frameMini()
  const ascii = frameAscii()
  if (mini) t.true(mini.includes('Frost'))
  if (ascii) t.true(ascii.includes('Frost'))
  t.pass()
})

// AnyCard — tarot card branch

test('major arcana tarot card renders title', (t) => {
  const { lastFrame } = render(
    <AnyCard
      faceUp
      card={{ id: 'fool', arcana: 'major' as const, majorIndex: 0 as const }}
      variant="simple"
    />
  )
  const frame = lastFrame()
  t.snapshot(frame)
  if (frame) {
    t.true(frame.includes('The Fool'))
  }
})

test('minor arcana tarot card renders title', (t) => {
  const { lastFrame } = render(
    <AnyCard
      faceUp
      card={{
        id: 'ace-cups',
        arcana: 'minor' as const,
        suit: 'cups' as const,
        value: 'Ace' as const,
      }}
      variant="simple"
    />
  )
  const frame = lastFrame()
  t.snapshot(frame)
  if (frame) {
    t.true(frame.includes('Ace of Cups'))
  }
})

test('tarot card face down renders card back', (t) => {
  const { lastFrame } = render(
    <AnyCard
      card={{
        id: 'fool-down',
        arcana: 'major' as const,
        majorIndex: 0 as const,
      }}
      variant="simple"
      faceUp={false}
    />
  )
  const frame = lastFrame()
  t.snapshot(frame)
  if (frame) {
    t.false(frame.includes('The Fool'))
  }
})
