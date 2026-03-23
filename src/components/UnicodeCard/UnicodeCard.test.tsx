import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { UnicodeCard } from './index.js'
import { getCardUnicode, SPECIAL_CARDS } from './constants.js'

test('render ace of spades face up', (t) => {
  const { lastFrame } = render(
    <UnicodeCard suit="spades" value="A" />
  )
  const frame = lastFrame()
  t.snapshot(frame)
  if (frame) {
    t.true(frame.includes(getCardUnicode('spades', 'A')))
  }
})

test('render king of hearts face up', (t) => {
  const { lastFrame } = render(
    <UnicodeCard suit="hearts" value="K" />
  )
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
    <UnicodeCard suit="diamonds" value="Q" bordered />
  )
  t.snapshot(lastFrame())
})

test('render with bordered and selected', (t) => {
  const { lastFrame } = render(
    <UnicodeCard suit="clubs" value="10" bordered selected />
  )
  t.snapshot(lastFrame())
})

test('render with dimmed face down', (t) => {
  const { lastFrame } = render(
    <UnicodeCard suit="spades" value="7" faceUp={false} dimmed />
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
    <UnicodeCard suit="diamonds" value="5" bordered size={3} />
  )
  t.snapshot(lastFrame())
})
