import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import CardStack from './index.js'

test('render queen of clubs face up', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[{ id: 'queen-of-clubs', suit: 'clubs', value: 'Q' }]}
      name="test"
    />
  )
  const queenOfClubsLastFrame = lastFrame()
  t.snapshot(queenOfClubsLastFrame)

  // Check it contains clubs symbol and queen
  if (queenOfClubsLastFrame) {
    t.true(queenOfClubsLastFrame.includes('♣'))
    t.true(queenOfClubsLastFrame.includes('Q'))
  }
})

test('render a two of hearts face up', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[{ id: 'two-hearts', suit: 'hearts', value: '2' }]}
      name="test"
    />
  )
  const twoHeartsLastFrame = lastFrame()
  t.snapshot(twoHeartsLastFrame)

  // Check it contains hearts symbol and 2
  if (twoHeartsLastFrame) {
    t.true(twoHeartsLastFrame.includes('♥'))
    t.true(twoHeartsLastFrame.includes('2'))
  }
})

test('render a three of diamonds face up', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[{ id: 'three-diamonds', suit: 'diamonds', value: '3' }]}
      name="test"
    />
  )
  const threeDiamondsLastFrame = lastFrame()
  t.snapshot(threeDiamondsLastFrame)

  // Check it contains diamonds symbol and 3
  if (threeDiamondsLastFrame) {
    t.true(threeDiamondsLastFrame.includes('♦'))
    t.true(threeDiamondsLastFrame.includes('3'))
  }
})

test('render a 6 of clubs face up', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[{ id: 'six-clubs', suit: 'clubs', value: '6' }]}
      name="test"
    />
  )
  const sixClubsLastFrame = lastFrame()
  t.snapshot(sixClubsLastFrame)

  // Check it contains clubs symbol and 6
  if (sixClubsLastFrame) {
    t.true(sixClubsLastFrame.includes('♣'))
    t.true(sixClubsLastFrame.includes('6'))
  }
})

test('render a 7 of spades face up', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[{ id: 'seven-spades', suit: 'spades', value: '7' }]}
      name="test"
    />
  )
  const sevenSpadesLastFrame = lastFrame()
  t.snapshot(sevenSpadesLastFrame)

  // Check it contains spades symbol and 7
  if (sevenSpadesLastFrame) {
    t.true(sevenSpadesLastFrame.includes('♠'))
    t.true(sevenSpadesLastFrame.includes('7'))
  }
})

test('render a 10 of diamonds face up', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[{ id: 'ten-diamonds', suit: 'diamonds', value: '10' }]}
      name="test"
    />
  )
  const tenDiamondsLastFrame = lastFrame()
  t.snapshot(tenDiamondsLastFrame)

  // Check it contains diamonds symbol and 10
  if (tenDiamondsLastFrame) {
    t.true(tenDiamondsLastFrame.includes('♦'))
    t.true(tenDiamondsLastFrame.includes('10'))
  }
})

test('render a 10 of hearts face up', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[{ id: 'ten-hearts', suit: 'hearts', value: '10' }]}
      name="test"
    />
  )
  const tenHeartsLastFrame = lastFrame()
  t.snapshot(tenHeartsLastFrame)

  // Check it contains hearts symbol and 10
  if (tenHeartsLastFrame) {
    t.true(tenHeartsLastFrame.includes('♥'))
    t.true(tenHeartsLastFrame.includes('10'))
  }
})

test('render a 10 of spades face up', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[{ id: 'ten-spades', suit: 'spades', value: '10' }]}
      name="test"
    />
  )
  const tenSpadesLastFrame = lastFrame()
  t.snapshot(tenSpadesLastFrame)

  // Check it contains spades symbol and 10
  if (tenSpadesLastFrame) {
    t.true(tenSpadesLastFrame.includes('♠'))
    t.true(tenSpadesLastFrame.includes('10'))
  }
})

test('render a jack of diamonds face up', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[{ id: 'jack-diamonds', suit: 'diamonds', value: 'J' }]}
      name="test"
    />
  )
  const jackDiamondsLastFrame = lastFrame()
  t.snapshot(jackDiamondsLastFrame)

  // Check it contains diamonds symbol and J
  if (jackDiamondsLastFrame) {
    t.true(jackDiamondsLastFrame.includes('♦'))
    t.true(jackDiamondsLastFrame.includes('J'))
  }
})

test('render a jack of diamonds face down', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp={false}
      cards={[{ id: 'jack-diamonds', suit: 'diamonds', value: 'J' }]}
      name="test"
    />
  )

  const jackDiamondsLastFrame = lastFrame()
  t.snapshot(jackDiamondsLastFrame)
})

test('render ace of spades face up', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[{ id: 'ace-spades', suit: 'spades', value: 'A' }]}
      name="test"
    />
  )
  const aceSpacesLastFrame = lastFrame()
  t.snapshot(aceSpacesLastFrame)
  if (aceSpacesLastFrame) {
    t.true(aceSpacesLastFrame.includes('♠'))
    t.true(aceSpacesLastFrame.includes('A'))
  }
})

test('render ace of spades face down', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp={false}
      cards={[{ id: 'ace-spades', suit: 'spades', value: 'A' }]}
      name="test"
    />
  )

  const aceSpacesLastFrame = lastFrame()
  t.snapshot(aceSpacesLastFrame)
})

test('render three cards face up', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[
        { id: 'ace-spades', suit: 'spades', value: 'A' },
        { id: 'two-hearts', suit: 'hearts', value: '2' },
        { id: 'three-diamonds', suit: 'diamonds', value: '3' },
      ]}
      name="test"
    />
  )

  const threeCardsLastFrame = lastFrame()
  t.snapshot(threeCardsLastFrame)
})

test('render three cards face down', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp={false}
      cards={[
        { id: 'ace-spades', suit: 'spades', value: 'A' },
        { id: 'two-hearts', suit: 'hearts', value: '2' },
        { id: 'three-diamonds', suit: 'diamonds', value: '3' },
      ]}
      name="test"
    />
  )

  const threeCardsLastFrame = lastFrame()
  t.snapshot(threeCardsLastFrame)
})

test('render four cards face up', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[
        { id: 'ace-spades', suit: 'spades', value: 'A' },
        { id: 'two-hearts', suit: 'hearts', value: '2' },
        { id: 'three-diamonds', suit: 'diamonds', value: '3' },
        { id: 'four-clubs', suit: 'clubs', value: '4' },
      ]}
      name="test"
    />
  )

  const fourCardsLastFrame = lastFrame()
  t.snapshot(fourCardsLastFrame)
})

test('render four cards face down', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp={false}
      cards={[
        { id: 'ace-spades', suit: 'spades', value: 'A' },
        { id: 'two-hearts', suit: 'hearts', value: '2' },
        { id: 'three-diamonds', suit: 'diamonds', value: '3' },
        { id: 'four-clubs', suit: 'clubs', value: '4' },
      ]}
      name="test"
    />
  )

  const fourCardsLastFrame = lastFrame()
  t.snapshot(fourCardsLastFrame)
})

test('render five cards face up', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[
        { id: 'ace-spades', suit: 'spades', value: 'A' },
        { id: 'two-hearts', suit: 'hearts', value: '2' },
        { id: 'three-diamonds', suit: 'diamonds', value: '3' },
        { id: 'four-clubs', suit: 'clubs', value: '4' },
        { id: 'five-spades', suit: 'spades', value: '5' },
      ]}
      name="test"
    />
  )

  const fiveCardsLastFrame = lastFrame()
  t.snapshot(fiveCardsLastFrame)
})

test('render five cards face down', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp={false}
      cards={[
        { id: 'ace-spades', suit: 'spades', value: 'A' },
        { id: 'two-hearts', suit: 'hearts', value: '2' },
        { id: 'three-diamonds', suit: 'diamonds', value: '3' },
        { id: 'four-clubs', suit: 'clubs', value: '4' },
        { id: 'five-spades', suit: 'spades', value: '5' },
      ]}
      name="test"
    />
  )

  const fiveCardsLastFrame = lastFrame()
  t.snapshot(fiveCardsLastFrame)
})

test('render horizontal stack', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[
        { id: 'ace-spades', suit: 'spades', value: 'A' },
        { id: 'two-hearts', suit: 'hearts', value: '2' },
        { id: 'three-diamonds', suit: 'diamonds', value: '3' },
        { id: 'four-clubs', suit: 'clubs', value: '4' },
        { id: 'five-spades', suit: 'spades', value: '5' },
      ]}
      name="test"
      stackDirection="horizontal"
    />
  )

  const horizontalStackLastFrame = lastFrame()
  t.snapshot(horizontalStackLastFrame)
})

test('render minimal variant', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[
        { id: 'ace-spades', suit: 'spades', value: 'A' },
        { id: 'two-hearts', suit: 'hearts', value: '2' },
        { id: 'three-diamonds', suit: 'diamonds', value: '3' },
        { id: 'four-clubs', suit: 'clubs', value: '4' },
        { id: 'five-spades', suit: 'spades', value: '5' },
      ]}
      name="test"
      variant="minimal"
    />
  )

  const minimalVariantLastFrame = lastFrame()
  t.snapshot(minimalVariantLastFrame)
})

test('render minimal variant horizontal stack', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[
        { id: 'ace-spades', suit: 'spades', value: 'A' },
        { id: 'two-hearts', suit: 'hearts', value: '2' },
        { id: 'three-diamonds', suit: 'diamonds', value: '3' },
        { id: 'four-clubs', suit: 'clubs', value: '4' },
        { id: 'five-spades', suit: 'spades', value: '5' },
      ]}
      name="test"
      stackDirection="horizontal"
      variant="minimal"
    />
  )

  const minimalVariantHorizontalStackLastFrame = lastFrame()
  t.snapshot(minimalVariantHorizontalStackLastFrame)
})

test('render minimal variant face down', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp={false}
      cards={[
        { id: 'ace-spades', suit: 'spades', value: 'A' },
        { id: 'two-hearts', suit: 'hearts', value: '2' },
        { id: 'three-diamonds', suit: 'diamonds', value: '3' },
        { id: 'four-clubs', suit: 'clubs', value: '4' },
        { id: 'five-spades', suit: 'spades', value: '5' },
      ]}
      name="test"
      variant="minimal"
    />
  )

  const minimalVariantFaceDownLastFrame = lastFrame()
  t.snapshot(minimalVariantFaceDownLastFrame)
})

test('render ascii variant', (t) => {
  const { lastFrame } = render(
    <CardStack
      isFaceUp
      cards={[
        { id: 'ace-spades', suit: 'spades', value: 'A' },
        { id: 'two-hearts', suit: 'hearts', value: '2' },
        { id: 'three-diamonds', suit: 'diamonds', value: '3' },
        { id: 'four-clubs', suit: 'clubs', value: '4' },
        { id: 'five-spades', suit: 'spades', value: '5' },
      ]}
      name="test"
      variant="ascii"
    />
  )

  const asciiVariantLastFrame = lastFrame()
  t.snapshot(asciiVariantLastFrame)
})
