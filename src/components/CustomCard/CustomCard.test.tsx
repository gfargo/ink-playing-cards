import process from 'node:process'
import test from 'ava'
import { render } from 'ink-testing-library'
import { Text } from 'ink'
import React from 'react'
import stringWidth from 'string-width'
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
        label: 'CARDS',
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

test('render TCG-style card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="test-tcg"
      size="large"
      title="Flame Lance"
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

test('render color-match style card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="test-color-match"
      size="small"
      title="7"
      borderColor="green"
      textColor="green"
      back={{ color: 'red', label: 'COLORS' }}
    />
  )
  t.snapshot(lastFrame())
})

// ── Imitation card renders ──────────────────────────────────────────

test('imitation: TCG creature with art and stats', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-tcg-creature"
      size="large"
      title="Radiant Guardian"
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

test('imitation: TCG instant spell', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-tcg-instant"
      size="large"
      title="Arcane Denial"
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

test('imitation: color-match reverse card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-color-reverse"
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

test('imitation: color-match Draw Two', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-color-draw2"
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

test('imitation: color-match Wild card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-color-wild"
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

test('imitation: color-match Wild card back', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-color-wild-back"
      size="small"
      faceUp={false}
      back={{
        art: ' C A R D\n  * * *',
        color: 'red',
      }}
    />
  )
  t.snapshot(lastFrame())
})

test('imitation: TCG land card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="imit-tcg-land"
      size="large"
      title="Mystic Shore"
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

test('description wraps a word longer than the line without dropping characters', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="test-long-word"
      size="small"
      description="Supercalifragilisticexpialidocious"
    />
  )
  const frame = lastFrame() ?? ''
  t.true(frame.includes('Supercalif'))
  t.true(frame.includes('ragilistic'))
  t.snapshot(frame)
})

test('description splits on embedded newlines before wrapping', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="test-embedded-newlines"
      size="medium"
      description={'Line one\nLine two\nLine three'}
    />
  )
  const frame = lastFrame() ?? ''
  t.true(frame.includes('Line one'))
  t.true(frame.includes('Line two'))
  t.true(frame.includes('Line three'))
  t.snapshot(frame)
})

test('CJK title and description keep every row the same display width', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="test-cjk"
      size="medium"
      title="龍の巻物"
      description="速い黒い狐が怠け者の犬を飛び越える。"
      borderColor="white"
      textColor="white"
    />
  )
  const frame = lastFrame() ?? ''
  const rowWidths = frame.split('\n').map((line) => stringWidth(line))
  t.true(rowWidths.length > 0)
  t.true(rowWidths.every((width) => width === rowWidths[0]))
  t.snapshot(frame)
})

test('emoji title keeps rows aligned', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="test-emoji"
      size="small"
      title="🀄 Tile"
      borderColor="white"
      textColor="white"
    />
  )
  const frame = lastFrame() ?? ''
  const rowWidths = frame.split('\n').map((line) => stringWidth(line))
  t.true(rowWidths.every((width) => width === rowWidths[0]))
  t.snapshot(frame)
})

test('wrapText does not hang when a wide glyph cannot fit a 1-column budget', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="test-narrow-wide-glyph"
      width={3}
      height={7}
      description="龍が飛ぶ"
    />
  )
  const frame = lastFrame() ?? ''
  t.true(typeof frame === 'string')
  t.snapshot(frame)
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

// ── Region overflow (dropped regions + dev warning) ─────────────────

test('warns and prioritises regions when content overflows a micro card', (t) => {
  const originalWarn = console.warn
  const originalNodeEnv = process.env['NODE_ENV']
  const calls: unknown[][] = []
  console.warn = (...args: unknown[]) => {
    calls.push(args)
  }

  process.env['NODE_ENV'] = 'test'

  try {
    const { lastFrame } = render(
      <CustomCard
        id="overflow-micro"
        size="micro"
        title="Long Title"
        typeLine="Creature"
        description="Some long description text that will not fit."
        footerLeft="3/4"
        footerRight="R"
        symbols={[{ char: '♠', position: 'top-left' }]}
      />
    )

    // Only innerHeight=1 line is available — the header (highest priority) wins.
    // The folded top-left symbol shares the header row's width, leaving only
    // 2 characters for the title.
    t.true(lastFrame()!.includes('Lo'))
    t.false(lastFrame()!.includes('Creature'))

    t.true(calls.length > 0)
    const [message] = calls[0] as [string]
    t.true(message.includes('overflow-micro') || message.includes('Long Title'))
    t.true(message.includes('typeLine'))
    t.true(message.includes('footer'))
    t.true(message.includes('description'))
    // The top-left symbol folds into the header row for free (no separate
    // budget line), so it survives here rather than being reported dropped.
  } finally {
    console.warn = originalWarn
    process.env['NODE_ENV'] = originalNodeEnv
  }
})

test('does not warn when all regions fit', (t) => {
  const originalWarn = console.warn
  const originalNodeEnv = process.env['NODE_ENV']
  const calls: unknown[][] = []
  console.warn = (...args: unknown[]) => {
    calls.push(args)
  }

  process.env['NODE_ENV'] = 'test'

  try {
    render(
      <CustomCard
        id="fits-large"
        size="large"
        title="Radiant Guardian"
        cost="{3}{W}{W}"
        typeLine="Creature — Angel"
        description="Flying, vigilance."
        footerLeft="4/4"
        footerRight="R"
        symbols={[{ char: '♠', position: 'top-left' }]}
      />
    )

    t.is(calls.length, 0)
  } finally {
    console.warn = originalWarn
    process.env['NODE_ENV'] = originalNodeEnv
  }
})
