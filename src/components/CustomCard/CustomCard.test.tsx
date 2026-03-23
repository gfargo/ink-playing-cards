import test from 'ava'
import { render } from 'ink-testing-library'
import { Text } from 'ink'
import React from 'react'
import { CustomCard } from './index.js'

test('render custom card with ASCII art', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="test-custom-ascii"
      size="medium"
      title="Fire Dragon"
      cost="{3}{R}"
      asciiArt={`  /\\_/\\
 ( o.o )
  > ^ <`}
      typeLine="Creature — Dragon"
      description="Flying. When this enters, deal 2 damage."
      footerLeft="3/4"
      footerRight="M"
      symbols={[
        { char: '♠', position: 'top-left', color: 'white' },
        { char: '♠', position: 'bottom-right', color: 'white' },
      ]}
      borderColor="red"
      textColor="white"
    />
  )
  t.snapshot(lastFrame())
})

test('render custom card with different sizes', (t) => {
  const sizes = ['micro', 'mini', 'small', 'medium', 'large'] as const
  for (const size of sizes) {
    const { lastFrame } = render(
      <CustomCard
        id={`test-custom-${size}`}
        size={size}
        title={`${size.charAt(0).toUpperCase() + size.slice(1)}`}
        description={`A ${size} card`}
      />
    )
    t.snapshot(lastFrame())
  }
})

test('render face down custom card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="test-custom-facedown"
      size="medium"
      title="Hidden Card"
      faceUp={false}
    />
  )
  t.snapshot(lastFrame())
})

test('render face down with custom back', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="test-custom-back"
      size="small"
      faceUp={false}
      back={{
        symbol: '🂠',
        label: 'UNO',
        color: 'red',
      }}
    />
  )
  t.snapshot(lastFrame())
})

test('render selected custom card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      selected
      id="test-selected"
      size="small"
      title="Selected"
      borderColor="blue"
    />
  )
  t.snapshot(lastFrame())
})

test('render freeform content mode', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="test-freeform"
      size="small"
      content={<Text color="cyan">Custom Content</Text>}
    />
  )
  t.snapshot(lastFrame())
})

test('render MTG-style card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="test-mtg"
      size="large"
      title="Lightning Bolt"
      cost="{R}"
      typeLine="Instant"
      description="Deal 3 damage to any target."
      footerRight="C"
      borderColor="red"
      textColor="white"
    />
  )
  t.snapshot(lastFrame())
})

test('render Uno-style card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="test-uno"
      size="small"
      title="7"
      borderColor="green"
      textColor="green"
      back={{ color: 'red', label: 'UNO' }}
    />
  )
  t.snapshot(lastFrame())
})
