import process from 'node:process'
import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import Card from './index.js'

test('render two of hearts face up', (t) => {
  const { lastFrame } = render(<Card id="two-hearts" suit="hearts" value="2" />)
  const twoHeartsLastFrame = lastFrame()
  t.snapshot(twoHeartsLastFrame)

  // Check it contains hearts symbol
  if (twoHeartsLastFrame) {
    t.true(twoHeartsLastFrame.includes('♥'))
  }
})

test('render three of diamonds face up', (t) => {
  const { lastFrame } = render(
    <Card id="three-diamonds" suit="diamonds" value="3" />
  )
  const threeDiamondsLastFrame = lastFrame()
  t.snapshot(threeDiamondsLastFrame)

  // Check it contains diamonds symbol
  if (threeDiamondsLastFrame) {
    t.true(threeDiamondsLastFrame.includes('♦'))
  }
})

test('render six of clubs face up', (t) => {
  const { lastFrame } = render(<Card id="six-clubs" suit="clubs" value="6" />)
  const sixClubsLastFrame = lastFrame()
  t.snapshot(sixClubsLastFrame)

  // Check it contains clubs symbol
  if (sixClubsLastFrame) {
    t.true(sixClubsLastFrame.includes('♣'))
  }
})

test('render seven of spades face up', (t) => {
  const { lastFrame } = render(
    <Card id="seven-spades" suit="spades" value="7" />
  )
  const sevenSpadesLastFrame = lastFrame()
  t.snapshot(sevenSpadesLastFrame)

  // Check it contains spades symbol
  if (sevenSpadesLastFrame) {
    t.true(sevenSpadesLastFrame.includes('♠'))
  }
})

test('render queen of clubs face up', (t) => {
  const { lastFrame } = render(
    <Card id="queen-of-clubs" suit="clubs" value="Q" />
  )
  const queenOfClubsLastFrame = lastFrame()
  t.snapshot(queenOfClubsLastFrame)

  // Check it contains clubs symbol
  if (queenOfClubsLastFrame) {
    t.true(queenOfClubsLastFrame.includes('♣'))
  }
})

test('render ace of spades face up', (t) => {
  const { lastFrame } = render(<Card id="ace-spades" suit="spades" value="A" />)
  const aceSpacesLastFrame = lastFrame()
  t.snapshot(aceSpacesLastFrame)
  if (aceSpacesLastFrame) {
    t.true(aceSpacesLastFrame.includes('♠'))
  }
})

test('render ace of spades face down', (t) => {
  const { lastFrame } = render(
    <Card
      id="ace-spades"
      suit="spades"
      value="A"
      faceUp={false}
      variant="simple"
    />
  )

  const aceSpacesLastFrame = lastFrame()
  t.snapshot(aceSpacesLastFrame)
  // Check card does not give away suit
  if (aceSpacesLastFrame) {
    t.false(aceSpacesLastFrame.includes('♠'))
  }
})

test('render joker of hearts face up (simple variant)', (t) => {
  const { lastFrame } = render(
    <Card id="joker-hearts" suit="hearts" value="JOKER" variant="simple" />
  )
  const frame = lastFrame()
  t.snapshot(frame)
  t.truthy(frame)

  if (frame) {
    t.true(frame.includes('JOKER'))

    // The simple variant's top/bottom labels show only the rank (no suit),
    // so any suit glyph at all proves the body art rendered.
    const suitGlyphCount = frame.split('♥').length - 1
    t.true(
      suitGlyphCount >= 1,
      `expected joker body to be non-blank, found ${suitGlyphCount} suit glyphs`
    )
  }
})

test('render joker of hearts face up (minimal variant, regression guard)', (t) => {
  const { lastFrame } = render(
    <Card id="joker-hearts" suit="hearts" value="JOKER" variant="minimal" />
  )
  const frame = lastFrame()
  t.snapshot(frame)
  // 'JOKER' doesn't fit the minimal variant's narrow width, so it renders
  // abbreviated as 'JK' alongside the suit glyph.
  if (frame) {
    t.true(frame.includes('JK'))
    t.true(frame.includes('♥'))
  }
})

test('warns in development when theme is set with simple variant', (t) => {
  const calls: unknown[][] = []
  const originalWarn = console.warn
  const originalNodeEnv = process.env['NODE_ENV']
  console.warn = (...args: unknown[]) => {
    calls.push(args)
  }

  process.env['NODE_ENV'] = 'development'
  render(
    <Card
      id="king-spades"
      suit="spades"
      value="K"
      variant="simple"
      theme="robot"
    />
  )

  console.warn = originalWarn
  process.env['NODE_ENV'] = originalNodeEnv

  t.true(calls.length > 0)
  t.true(
    String(calls[0]?.[0]).includes(
      'theme="robot" has no effect for variant="simple"'
    )
  )
})

test('warns in development when theme is set with minimal variant', (t) => {
  const calls: unknown[][] = []
  const originalWarn = console.warn
  const originalNodeEnv = process.env['NODE_ENV']
  console.warn = (...args: unknown[]) => {
    calls.push(args)
  }

  process.env['NODE_ENV'] = 'development'
  render(
    <Card
      id="king-spades"
      suit="spades"
      value="K"
      variant="minimal"
      theme="robot"
    />
  )

  console.warn = originalWarn
  process.env['NODE_ENV'] = originalNodeEnv

  t.true(calls.length > 0)
  t.true(
    String(calls[0]?.[0]).includes(
      'theme="robot" has no effect for variant="minimal"'
    )
  )
})

test('does not warn for ascii variant with a theme', (t) => {
  const calls: unknown[][] = []
  const originalWarn = console.warn
  const originalNodeEnv = process.env['NODE_ENV']
  console.warn = (...args: unknown[]) => {
    calls.push(args)
  }

  process.env['NODE_ENV'] = 'development'
  render(
    <Card
      id="king-spades"
      suit="spades"
      value="K"
      variant="ascii"
      theme="robot"
    />
  )

  console.warn = originalWarn
  process.env['NODE_ENV'] = originalNodeEnv

  t.true(calls.length === 0)
})

test('does not warn for simple variant with default theme', (t) => {
  const calls: unknown[][] = []
  const originalWarn = console.warn
  const originalNodeEnv = process.env['NODE_ENV']
  console.warn = (...args: unknown[]) => {
    calls.push(args)
  }

  process.env['NODE_ENV'] = 'development'
  render(<Card id="king-spades" suit="spades" value="K" variant="simple" />)

  console.warn = originalWarn
  process.env['NODE_ENV'] = originalNodeEnv

  t.true(calls.length === 0)
})
