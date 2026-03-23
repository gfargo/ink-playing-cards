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

// ── Imitation card renders ──────────────────────────────────────────

test('imitation: MTG creature with art and stats', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-mtg-creature"
      size="large"
      title="Serra Angel"
      cost="{3}{W}{W}"
      asciiArt={`     _/\\_
    / oo \\
   ( \\  / )
    \\_/\\_/
   /|    |\\
  / |    | \\`}
      typeLine="Creature — Angel"
      description="Flying, vigilance. A divine warrior who never tires."
      footerLeft="4/4"
      footerRight="R"
      borderColor="white"
      textColor="white"
      artColor="yellow"
    />
  )
  t.snapshot(lastFrame())
})

test('imitation: MTG instant spell', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-mtg-instant"
      size="large"
      title="Counterspell"
      cost="{U}{U}"
      asciiArt={`    ~~~~
   ( NO )
    ~~~~`}
      typeLine="Instant"
      description="Counter target spell."
      borderColor="blue"
      textColor="blue"
    />
  )
  t.snapshot(lastFrame())
})

test('imitation: Uno reverse card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-uno-reverse"
      size="small"
      title="Reverse"
      symbols={[
        { char: '⟲', position: 'top-left', color: 'red' },
        { char: '⟲', position: 'bottom-right', color: 'red' },
      ]}
      borderColor="red"
      textColor="red"
    />
  )
  t.snapshot(lastFrame())
})

test('imitation: Uno Draw Two', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-uno-draw2"
      size="small"
      title="+2"
      description="Draw Two"
      symbols={[
        { char: '⊕', position: 'top-right', color: 'blue' },
        { char: '⊕', position: 'bottom-left', color: 'blue' },
      ]}
      borderColor="blue"
      textColor="blue"
    />
  )
  t.snapshot(lastFrame())
})

test('imitation: Uno Wild card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-uno-wild"
      size="small"
      title="Wild"
      description="Pick color"
      symbols={[
        { char: '★', position: 'top-left', color: 'red' },
        { char: '★', position: 'top-right', color: 'blue' },
        { char: '★', position: 'bottom-left', color: 'green' },
        { char: '★', position: 'bottom-right', color: 'yellow' },
      ]}
      borderColor="yellow"
      textColor="white"
    />
  )
  t.snapshot(lastFrame())
})

test('imitation: Uno Wild card back', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-uno-wild-back"
      size="small"
      faceUp={false}
      back={{
        art: '  U N O\n  * * *',
        color: 'red',
      }}
    />
  )
  t.snapshot(lastFrame())
})

test('imitation: MTG land card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-mtg-land"
      size="large"
      title="Island"
      asciiArt={`   .  *  .  *
  * .  ~~  . *
    ~~~~~~~
   ~~~   ~~~
    ~~~~~~~`}
      typeLine="Basic Land — Island"
      description="{T}: Add {U}."
      borderColor="blue"
      textColor="blue"
      artColor="cyan"
    />
  )
  t.snapshot(lastFrame())
})

test('imitation: party game action card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-party-action"
      size="medium"
      title="Truth or Dare"
      asciiArt={`   ?   !
  ? ! ? !
   !   ?`}
      description="Ask any player: truth or dare? They must answer."
      borderColor="magenta"
      textColor="magenta"
    />
  )
  t.snapshot(lastFrame())
})

test('imitation: micro token card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-token-micro"
      size="micro"
      title="1/1"
      borderColor="green"
      textColor="green"
    />
  )
  t.snapshot(lastFrame())
})

test('imitation: mini hand card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-mini-hand"
      size="mini"
      title="Bolt"
      cost="{R}"
      description="3 dmg"
      borderColor="red"
      textColor="red"
    />
  )
  t.snapshot(lastFrame())
})
