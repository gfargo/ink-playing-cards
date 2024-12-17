import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { Card } from './index.js'

test('render queen of clubs face up', (t) => {
  const { lastFrame } = render(
    <Card id="queen-of-clubs" suit="clubs" value="Q" variant="ascii" />
  )
  const queenOfClubsLastFrame = lastFrame()
  t.snapshot(queenOfClubsLastFrame)

  // Check it contains clubs symbol
  if (queenOfClubsLastFrame) {
    t.true(queenOfClubsLastFrame.includes('♣'))
  }
})

test('render a two of hearts face up', (t) => {
  const { lastFrame } = render(
    <Card id="two-hearts" suit="hearts" value="2" variant="ascii" />
  )
  const twoHeartsLastFrame = lastFrame()
  t.snapshot(twoHeartsLastFrame)

  // Check it contains hearts symbol
  if (twoHeartsLastFrame) {
    t.true(twoHeartsLastFrame.includes('♥'))
  }
})

test('render a three of diamonds face up', (t) => {
  const { lastFrame } = render(
    <Card id="three-diamonds" suit="diamonds" value="3" variant="ascii" />
  )
  const threeDiamondsLastFrame = lastFrame()
  t.snapshot(threeDiamondsLastFrame)

  // Check it contains diamonds symbol
  if (threeDiamondsLastFrame) {
    t.true(threeDiamondsLastFrame.includes('♦'))
  }
})

test('render a 6 of clubs face up', (t) => {
  const { lastFrame } = render(
    <Card id="six-clubs" suit="clubs" value="6" variant="ascii" />
  )
  const sixClubsLastFrame = lastFrame()
  t.snapshot(sixClubsLastFrame)

  // Check it contains clubs symbol
  if (sixClubsLastFrame) {
    t.true(sixClubsLastFrame.includes('♣'))
  }
})

test('render a 7 of spades face up', (t) => {
  const { lastFrame } = render(
    <Card id="seven-spades" suit="spades" value="7" variant="ascii" />
  )
  const sevenSpadesLastFrame = lastFrame()
  t.snapshot(sevenSpadesLastFrame)

  // Check it contains spades symbol
  if (sevenSpadesLastFrame) {
    t.true(sevenSpadesLastFrame.includes('♠'))
  }
})

test('render a 10 of hearts face up', (t) => {
  const { lastFrame } = render(
    <Card id="ten-hearts" suit="hearts" value="10" variant="ascii" />
  )
  const tenHeartsLastFrame = lastFrame()
  t.snapshot(tenHeartsLastFrame)

  // Check it contains hearts symbol
  if (tenHeartsLastFrame) {
    t.true(tenHeartsLastFrame.includes('♥'))
  }
})

test('render a jack of diamonds face up', (t) => {
  const { lastFrame } = render(
    <Card id="jack-diamonds" suit="diamonds" value="J" variant="ascii" />
  )
  const jackDiamondsLastFrame = lastFrame()
  t.snapshot(jackDiamondsLastFrame)

  // Check it contains diamonds symbol
  if (jackDiamondsLastFrame) {
    t.true(jackDiamondsLastFrame.includes('♦'))
  }
})

test('render ace of spades face up', (t) => {
  const { lastFrame } = render(
    <Card id="ace-spades" suit="spades" value="A" variant="ascii" />
  )
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
      variant="ascii"
    />
  )

  const aceSpacesLastFrame = lastFrame()
  t.snapshot(aceSpacesLastFrame)
  // Check card does not give away suit
  if (aceSpacesLastFrame) {
    t.false(aceSpacesLastFrame.includes('♠'))
  }
})
