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
