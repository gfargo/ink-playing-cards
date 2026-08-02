import process from 'node:process'
import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { type TCardValue, type TSuit } from '../../types/index.js'
import { CardGrid, type GridCard } from './index.js'

const sampleCards: GridCard[] = [
  { id: 'ace-spades', suit: 'spades' as TSuit, value: 'A' as TCardValue },
  { id: 'two-hearts', suit: 'hearts' as TSuit, value: '2' as TCardValue },
  { id: 'three-diamonds', suit: 'diamonds' as TSuit, value: '3' as TCardValue },
  { id: 'four-clubs', suit: 'clubs' as TSuit, value: '4' as TCardValue },
]

// Strip ANSI SGR escape sequences so spacing assertions are colour-agnostic.
const stripAnsi = (line: string) =>
  // eslint-disable-next-line no-control-regex
  line.replaceAll(/\u001B\[[\d;]*m/g, '')

test('render 2x2 grid face up', (t) => {
  const { lastFrame } = render(
    <CardGrid isFaceUp rows={2} cols={2} cards={sampleCards} />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)

  // Check for card content
  if (gridFrame) {
    t.true(gridFrame.includes('♠'))
    t.true(gridFrame.includes('A'))
    t.true(gridFrame.includes('♥'))
    t.true(gridFrame.includes('2'))
  }
})

test('render 2x2 grid face down', (t) => {
  const { lastFrame } = render(
    <CardGrid rows={2} cols={2} cards={sampleCards} isFaceUp={false} />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render 3x2 grid with empty cells', (t) => {
  const { lastFrame } = render(
    <CardGrid
      fillEmpty
      rows={3}
      cols={2}
      cards={sampleCards} // Only 4 cards for 6 cells
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render grid with mini variant', (t) => {
  const { lastFrame } = render(
    <CardGrid rows={2} cols={2} cards={sampleCards} variant="mini" />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render grid with micro variant', (t) => {
  const { lastFrame } = render(
    <CardGrid rows={2} cols={2} cards={sampleCards} variant="micro" />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render grid with custom spacing', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={2}
      cols={2}
      cards={sampleCards}
      spacing={{ row: 2, col: 3 }}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)

  // Spacing.row=2 should produce exactly 2 blank lines between card rows,
  // not the doubled 4 that adjacent marginY/row used to produce.
  if (gridFrame) {
    const lines = gridFrame.split('\n').map((line) => stripAnsi(line))
    const blankLines = lines.filter((line) => line.trim() === '').length
    t.is(blankLines, 2)

    // Spacing.col=3 should produce exactly 3 spaces between cell borders,
    // not the doubled 6 that adjacent marginX/col used to produce.
    const rowWithGap = lines.find(
      (line) => line.includes('╮') && line.includes('╭')
    )
    const gap = /╮(\s+)╭/.exec(rowWithGap ?? '')
    t.is(gap?.[1]?.length, 3)
  }
})

test('render grid with left alignment', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={2}
      cols={2}
      cards={sampleCards}
      alignment={{ horizontal: 'left', vertical: 'middle' }}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render grid with right alignment', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={2}
      cols={2}
      cards={sampleCards}
      alignment={{ horizontal: 'right', vertical: 'middle' }}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render grid with top alignment', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={2}
      cols={2}
      cards={sampleCards}
      alignment={{ horizontal: 'center', vertical: 'top' }}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render grid with bottom alignment', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={2}
      cols={2}
      cards={sampleCards}
      alignment={{ horizontal: 'center', vertical: 'bottom' }}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render minimal variant grid', (t) => {
  const { lastFrame } = render(
    <CardGrid rows={2} cols={2} cards={sampleCards} variant="minimal" />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render ascii variant grid', (t) => {
  const { lastFrame } = render(
    <CardGrid rows={2} cols={2} cards={sampleCards} variant="ascii" />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render 1x4 horizontal grid', (t) => {
  const { lastFrame } = render(
    <CardGrid rows={1} cols={4} cards={sampleCards} />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render 4x1 vertical grid', (t) => {
  const { lastFrame } = render(
    <CardGrid rows={4} cols={1} cards={sampleCards} />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render empty grid with placeholders', (t) => {
  const { lastFrame } = render(
    <CardGrid fillEmpty rows={2} cols={2} cards={[]} />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render empty micro grid with card-sized placeholders', (t) => {
  const { lastFrame } = render(
    <CardGrid fillEmpty rows={1} cols={2} cards={[]} variant="micro" />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
  if (gridFrame) {
    t.true(gridFrame.includes('┌──┐'))
  }
})

test('render partial grid without placeholders', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={2}
      cols={2}
      cards={[sampleCards[0]!]} // Only one card
      fillEmpty={false}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

// F18: CardGrid now supports custom cards (TCard, not just GridCard)
test('render grid with custom cards', (t) => {
  const { lastFrame } = render(
    <CardGrid
      isFaceUp
      rows={1}
      cols={2}
      cards={[
        {
          id: 'custom-1',
          title: 'Flame Lance',
          size: 'small' as const,
          borderColor: 'red',
        },
        {
          id: 'custom-2',
          title: 'Frost Nova',
          size: 'small' as const,
          borderColor: 'blue',
        },
      ]}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
  if (gridFrame) {
    t.true(gridFrame.includes('Flame'))
    t.true(gridFrame.includes('Frost'))
  }
})

test('warns in development when cards overflow grid capacity', (t) => {
  const calls: unknown[][] = []
  const originalWarn = console.warn
  const originalNodeEnv = process.env['NODE_ENV']
  console.warn = (...args: unknown[]) => {
    calls.push(args)
  }

  process.env['NODE_ENV'] = 'development'
  render(<CardGrid rows={1} cols={2} cards={sampleCards} />)

  console.warn = originalWarn
  process.env['NODE_ENV'] = originalNodeEnv

  t.true(calls.length > 0)
  t.true(String(calls[0]?.[0]).includes('4 cards but the 1x2 grid'))
})

test('does not warn when cards fit within grid capacity', (t) => {
  const calls: unknown[][] = []
  const originalWarn = console.warn
  const originalNodeEnv = process.env['NODE_ENV']
  console.warn = (...args: unknown[]) => {
    calls.push(args)
  }

  process.env['NODE_ENV'] = 'development'
  render(<CardGrid rows={2} cols={2} cards={sampleCards} />)

  console.warn = originalWarn
  process.env['NODE_ENV'] = originalNodeEnv

  t.is(calls.length, 0)
})

test('render grid with mixed standard and custom cards', (t) => {
  const { lastFrame } = render(
    <CardGrid
      isFaceUp
      rows={1}
      cols={3}
      cards={[
        { id: 'ace-spades', suit: 'spades' as const, value: 'A' as const },
        {
          id: 'custom-1',
          title: 'Wild',
          size: 'small' as const,
          borderColor: 'yellow',
        },
        { id: 'two-hearts', suit: 'hearts' as const, value: '2' as const },
      ]}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
  if (gridFrame) {
    t.true(gridFrame.includes('♠'))
    t.true(gridFrame.includes('Wild'))
    t.true(gridFrame.includes('♥'))
  }
})

test('render tarot-only grid', (t) => {
  const { lastFrame } = render(
    <CardGrid
      isFaceUp
      rows={1}
      cols={2}
      cards={[
        { id: 'fool', arcana: 'major' as const, majorIndex: 0 as const },
        {
          id: 'ace-cups',
          arcana: 'minor' as const,
          suit: 'cups' as const,
          value: 'Ace' as const,
        },
      ]}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
  if (gridFrame) {
    t.true(gridFrame.includes('The Fool'))
    t.true(gridFrame.includes('Ace of Cups'))
  }
})

test('render grid with mixed standard, custom, and tarot cards', (t) => {
  const { lastFrame } = render(
    <CardGrid
      isFaceUp
      rows={1}
      cols={3}
      cards={[
        { id: 'ace-spades', suit: 'spades' as const, value: 'A' as const },
        {
          id: 'custom-1',
          title: 'Wild',
          size: 'small' as const,
          borderColor: 'yellow',
        },
        { id: 'fool', arcana: 'major' as const, majorIndex: 0 as const },
      ]}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
  if (gridFrame) {
    t.true(gridFrame.includes('♠'))
    t.true(gridFrame.includes('Wild'))
    t.true(gridFrame.includes('The Fool'))
  }
})
