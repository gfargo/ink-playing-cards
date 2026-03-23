import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { getCardUnicode, SPECIAL_CARDS } from './constants.js'
import { UnicodeCard } from './index.js'

test('render ace of spades face up', (t) => {
  const { lastFrame } = render(<UnicodeCard suit="spades" value="A" />)
  const frame = lastFrame()
  t.snapshot(frame)
  if (frame) {
    t.true(frame.includes(getCardUnicode('spades', 'A')))
  }
})

test('render king of hearts face up', (t) => {
  const { lastFrame } = render(<UnicodeCard suit="hearts" value="K" />)
  t.snapshot(lastFrame())
})

test('render face down shows card back', (t) => {
  const { lastFrame } = render(
    <UnicodeCard suit="hearts" value="A" faceUp={false} />
  )
  const frame = lastFrame()
  t.snapshot(frame)
  if (frame) {
    t.true(frame.includes(SPECIAL_CARDS.CARD_BACK))
  }
})

test('render with bordered prop', (t) => {
  const { lastFrame } = render(
    <UnicodeCard bordered suit="diamonds" value="Q" />
  )
  t.snapshot(lastFrame())
})

test('render with bordered and selected', (t) => {
  const { lastFrame } = render(
    <UnicodeCard bordered selected suit="clubs" value="10" />
  )
  t.snapshot(lastFrame())
})

test('render with dimmed face down', (t) => {
  const { lastFrame } = render(
    <UnicodeCard dimmed suit="spades" value="7" faceUp={false} />
  )
  t.snapshot(lastFrame())
})

test('render with custom color', (t) => {
  const { lastFrame } = render(
    <UnicodeCard suit="hearts" value="J" color="green" />
  )
  t.snapshot(lastFrame())
})

test('render with size prop', (t) => {
  const { lastFrame } = render(
    <UnicodeCard bordered suit="diamonds" value="5" size={3} />
  )
  t.snapshot(lastFrame())
})

test('render diamonds shows red color', (t) => {
  const { lastFrame } = render(<UnicodeCard suit="diamonds" value="3" />)
  t.snapshot(lastFrame())
})

test('render clubs shows white color', (t) => {
  const { lastFrame } = render(<UnicodeCard suit="clubs" value="9" />)
  t.snapshot(lastFrame())
})

test('render joker with hearts suit', (t) => {
  const { lastFrame } = render(<UnicodeCard suit="hearts" value="JOKER" />)
  const frame = lastFrame()
  t.snapshot(frame)
  if (frame) {
    t.true(frame.includes(SPECIAL_CARDS.RED_JOKER))
  }
})

test('render joker with spades suit', (t) => {
  const { lastFrame } = render(<UnicodeCard suit="spades" value="JOKER" />)
  const frame = lastFrame()
  t.snapshot(frame)
  if (frame) {
    t.true(frame.includes(SPECIAL_CARDS.BLACK_JOKER))
  }
})

test('render joker with clubs suit', (t) => {
  const { lastFrame } = render(<UnicodeCard suit="clubs" value="JOKER" />)
  const frame = lastFrame()
  t.snapshot(frame)
  if (frame) {
    t.true(frame.includes(SPECIAL_CARDS.WHITE_JOKER))
  }
})

test('render bordered with rounded false', (t) => {
  const { lastFrame } = render(
    <UnicodeCard bordered rounded={false} suit="spades" value="A" />
  )
  t.snapshot(lastFrame())
})

test('render face down without dimmed uses suit color', (t) => {
  const { lastFrame } = render(
    <UnicodeCard suit="hearts" value="K" faceUp={false} />
  )
  t.snapshot(lastFrame())
})

test('render 10 value card', (t) => {
  const { lastFrame } = render(<UnicodeCard suit="hearts" value="10" />)
  t.snapshot(lastFrame())
})
