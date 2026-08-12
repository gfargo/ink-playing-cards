import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { DrawCardEffect } from '../../systems/Effects.js'
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

test('face-up card with effects renders an indicator', (t) => {
  const withEffects = render(
    <Card
      id="king-hearts-fx"
      suit="hearts"
      value="K"
      effects={[new DrawCardEffect(1)]}
    />
  ).lastFrame()
  const withoutEffects = render(
    <Card id="king-hearts-fx" suit="hearts" value="K" />
  ).lastFrame()
  t.not(withEffects, withoutEffects)
})

test('empty effects array renders identically to no effects', (t) => {
  const emptyEffects = render(
    <Card id="king-hearts-fx-empty" suit="hearts" value="K" effects={[]} />
  ).lastFrame()
  const noEffects = render(
    <Card id="king-hearts-fx-empty" suit="hearts" value="K" />
  ).lastFrame()
  t.is(emptyEffects, noEffects)
})

test('face-down card with effects renders identically to face-down without effects', (t) => {
  const withEffects = render(
    <Card
      id="king-hearts-fx-facedown"
      suit="hearts"
      value="K"
      faceUp={false}
      effects={[new DrawCardEffect(1)]}
    />
  ).lastFrame()
  const withoutEffects = render(
    <Card id="king-hearts-fx-facedown" suit="hearts" value="K" faceUp={false} />
  ).lastFrame()
  t.is(withEffects, withoutEffects)
})

test('selected card with effects keeps the selected border color', (t) => {
  const selectedWithEffects = render(
    <Card
      selected
      id="king-hearts-fx-selected"
      suit="hearts"
      value="K"
      effects={[new DrawCardEffect(1)]}
    />
  ).lastFrame()
  const selectedOnly = render(
    <Card selected id="king-hearts-fx-selected" suit="hearts" value="K" />
  ).lastFrame()
  t.is(selectedWithEffects, selectedOnly)
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
