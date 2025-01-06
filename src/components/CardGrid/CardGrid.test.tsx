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

test('render 2x2 grid face up', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={2}
      cols={2}
      cards={sampleCards}
      isFaceUp={true}
    />
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
    <CardGrid
      rows={2}
      cols={2}
      cards={sampleCards}
      isFaceUp={false}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render 3x2 grid with empty cells', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={3}
      cols={2}
      cards={sampleCards}  // Only 4 cards for 6 cells
      fillEmpty={true}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render grid with mini variant', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={2}
      cols={2}
      cards={sampleCards}
      variant="mini"
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render grid with micro variant', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={2}
      cols={2}
      cards={sampleCards}
      variant="micro"
    />
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
    <CardGrid
      rows={2}
      cols={2}
      cards={sampleCards}
      variant="minimal"
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render ascii variant grid', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={2}
      cols={2}
      cards={sampleCards}
      variant="ascii"
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render 1x4 horizontal grid', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={1}
      cols={4}
      cards={sampleCards}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render 4x1 vertical grid', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={4}
      cols={1}
      cards={sampleCards}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render empty grid with placeholders', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={2}
      cols={2}
      cards={[]}
      fillEmpty={true}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})

test('render partial grid without placeholders', (t) => {
  const { lastFrame } = render(
    <CardGrid
      rows={2}
      cols={2}
      cards={[sampleCards[0]!]}  // Only one card
      fillEmpty={false}
    />
  )
  const gridFrame = lastFrame()
  t.snapshot(gridFrame)
})