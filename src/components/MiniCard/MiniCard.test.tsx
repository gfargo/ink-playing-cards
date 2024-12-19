import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { MiniCard } from './index.js'

test('render queen of clubs face up', (t) => {
  const { lastFrame } = render(
    <MiniCard id="queen-of-clubs" suit="clubs" value="Q" />
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
    <MiniCard id="two-hearts" suit="hearts" value="2" />
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
    <MiniCard id="three-diamonds" suit="diamonds" value="3" />
  )
  const threeDiamondsLastFrame = lastFrame()
  t.snapshot(threeDiamondsLastFrame)

  // Check it contains diamonds symbol
  if (threeDiamondsLastFrame) {
    t.true(threeDiamondsLastFrame.includes('♦'))
  }
})

test('render a 6 of clubs face up micro', (t) => {
  const { lastFrame } = render(
    <MiniCard id="six-clubs" suit="clubs" value="6" variant="micro" />
  )
  const sixClubsLastFrame = lastFrame()
  t.snapshot(sixClubsLastFrame)

  // Check it contains clubs symbol
  if (sixClubsLastFrame) {
    t.true(sixClubsLastFrame.includes('♣'))
  }
})

test('render a 7 of spades face up micro', (t) => {
  const { lastFrame } = render(
    <MiniCard id="seven-spades" suit="spades" value="7" variant="micro" />
  )
  const sevenSpadesLastFrame = lastFrame()
  t.snapshot(sevenSpadesLastFrame)

  // Check it contains spades symbol
  if (sevenSpadesLastFrame) {
    t.true(sevenSpadesLastFrame.includes('♠'))
  }
})

test('render a 6 of clubs face up', (t) => {
  const { lastFrame } = render(
    <MiniCard id="six-clubs" suit="clubs" value="6" />
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
    <MiniCard id="seven-spades" suit="spades" value="7" />
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
    <MiniCard id="ten-hearts" suit="hearts" value="10" />
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
    <MiniCard id="jack-diamonds" suit="diamonds" value="J" />
  )
  const jackDiamondsLastFrame = lastFrame()
  t.snapshot(jackDiamondsLastFrame)

  // Check it contains diamonds symbol
  if (jackDiamondsLastFrame) {
    t.true(jackDiamondsLastFrame.includes('♦'))
  }
})

test('render a queen of clubs face up', (t) => {
  const { lastFrame } = render(
    <MiniCard id="queen-clubs" suit="clubs" value="Q" />
  )
  const queenClubsLastFrame = lastFrame()
  t.snapshot(queenClubsLastFrame)

  // Check it contains clubs symbol
  if (queenClubsLastFrame) {
    t.true(queenClubsLastFrame.includes('♣'))
  }
})

test('render a king of hearts micro face up', (t) => {
  const { lastFrame } = render(
    <MiniCard id="king-hearts" suit="hearts" value="K" variant="micro" />
  )
  const kingHeartsLastFrame = lastFrame()
  t.snapshot(kingHeartsLastFrame)

  // Check it contains hearts symbol
  if (kingHeartsLastFrame) {
    t.true(kingHeartsLastFrame.includes('♥'))
  }
})

test('render ace of spades face up', (t) => {
  const { lastFrame } = render(
    <MiniCard id="ace-spades" suit="spades" value="A" />
  )
  const aceSpacesLastFrame = lastFrame()
  t.snapshot(aceSpacesLastFrame)
  if (aceSpacesLastFrame) {
    t.true(aceSpacesLastFrame.includes('♠'))
  }
})

test('render ace of spades face down', (t) => {
  const { lastFrame } = render(
    <MiniCard id="ace-spades" suit="spades" value="A" faceUp={false} />
  )

  const aceSpacesLastFrame = lastFrame()
  t.snapshot(aceSpacesLastFrame)
  // Check MiniCard does not give away suit
  if (aceSpacesLastFrame) {
    t.false(aceSpacesLastFrame.includes('♠'))
  }
})
