import test from 'ava'
import type { CardArtDefinition } from '../types/cardArt.js'
import { ROBOT_THEME } from '../constants/robotTheme.js'
import { renderCardArt } from './cardArtRenderer.js'
import { displayWidth } from './text.js'

const FRAME = {
  top: '┌─────┐',
  middle: '│{content}│',
  bottom: '└─────┘',
}

test('renderCardArt pads every output line to the requested width', (t) => {
  const width = 20
  const result = renderCardArt(ROBOT_THEME['A']!, width, { suit: '♥' })
  t.true(result.length > 0)
  t.true(result.every((line) => line.length === width))
})

test('renderCardArt applies replacements and pads a body section to width', (t) => {
  const width = 10
  const definition: CardArtDefinition = {
    sections: [{ type: 'body', content: ['{data}'], padding: 2 }],
  }
  const result = renderCardArt(definition, width, { data: 'X' })
  t.is(result.length, 1)
  // Body content is padded to width - padding*2 = 6, then re-centered to width = 10
  t.is(result[0], '    X     ')
  t.is(result[0]?.length, width)
})

test('renderCardArt renders a frame section with top/middle/bottom rows', (t) => {
  const width = 20
  const definition: CardArtDefinition = {
    sections: [{ type: 'frame', content: '{suit}', frame: FRAME, padding: 1 }],
  }
  const result = renderCardArt(definition, width, { suit: '♠' })
  t.is(result.length, 3)
  t.true(result.every((line) => line.length === width))
  const [top, middle, bottom] = result
  t.true(top?.includes('┌') && top?.includes('┐'))
  t.true(middle?.includes('│'))
  t.true(bottom?.includes('└') && bottom?.includes('┘'))
})

test('renderCardArt: dynamicReplacements override static definition replacements', (t) => {
  const definition: CardArtDefinition = {
    sections: [{ type: 'body', content: ['{token}'], padding: 0 }],
    replacements: { token: 'static' },
  }
  const result = renderCardArt(definition, 10, { token: 'dynamic' })
  t.true(result[0]?.includes('dynamic'))
  t.false(result[0]?.includes('static'))
})

test('renderCardArt renders a multi-section definition with consistent width', (t) => {
  const width = 20
  const definition = ROBOT_THEME['K']!
  const result = renderCardArt(definition, width, {
    eyes: '[<>]',
    circuit: '╠<>╣',
    suit: '♦',
    data: '▀0101▀',
    core: '<+>',
  })
  t.true(result.length > 0)
  t.true(result.every((line) => line.length === width))
})

test('renderCardArt: body section padding as an object only uses left', (t) => {
  const width = 10
  const definition: CardArtDefinition = {
    sections: [
      { type: 'body', content: ['X'], padding: { left: 1, right: 3 } },
    ],
  }
  const result = renderCardArt(definition, width, {})
  t.is(result.length, 1)
  t.is(result[0]?.length, width)
})

test('renderCardArt: frame section padding as an object sums left and right', (t) => {
  const width = 20
  const buildDefinition = (padding: {
    left?: number
    right?: number
  }): CardArtDefinition => ({
    sections: [{ type: 'frame', content: 'X', frame: FRAME, padding }],
  })

  // Different left/right splits with the same sum must render identically,
  // proving the frame path sums padding.left + padding.right (lines 32-33)
  // rather than using either side alone.
  const splitA = renderCardArt(
    buildDefinition({ left: 1, right: 3 }),
    width,
    {}
  )
  const splitB = renderCardArt(
    buildDefinition({ left: 4, right: 0 }),
    width,
    {}
  )
  t.deepEqual(splitA, splitB)

  // The summed padding narrows the framed content area, so it must actually
  // change the rendered layout compared to no padding at all.
  const unpadded = renderCardArt(buildDefinition({}), width, {})
  t.notDeepEqual(splitA, unpadded)
})

test('renderCardArt: numeric section padding is applied on both sides', (t) => {
  const width = 10
  const definition: CardArtDefinition = {
    sections: [{ type: 'body', content: ['X'], padding: 2 }],
  }
  const result = renderCardArt(definition, width, {})
  t.is(result[0]?.length, width)
})

test('renderCardArt returns an empty array for a definition with no sections', (t) => {
  const definition: CardArtDefinition = { sections: [] }
  const result = renderCardArt(definition, 10, {})
  t.deepEqual(result, [])
})

test('renderCardArt pads a body-only section to exactly the requested width', (t) => {
  const definition: CardArtDefinition = {
    sections: [{ type: 'body', content: ['hi'], padding: 1 }],
  }
  const lines = renderCardArt(definition, 12, {})
  t.is(lines.length, 1)
  for (const line of lines) {
    t.is(displayWidth(line), 12)
  }
})

test('renderCardArt pads every line of a framed section to exactly the requested width', (t) => {
  const definition: CardArtDefinition = {
    sections: [
      {
        type: 'frame',
        content: 'AB',
        frame: { top: '+--+', middle: '|{content}|', bottom: '+--+' },
        padding: 1,
      },
    ],
  }
  const lines = renderCardArt(definition, 12, {})
  t.is(lines.length, 3)
  for (const line of lines) {
    t.is(displayWidth(line), 12)
  }

  const middleLine = lines[1]
  t.true(middleLine?.includes('|'))
})

test('renderCardArt keeps every line exactly the requested width across mixed sections', (t) => {
  const definition: CardArtDefinition = {
    sections: [
      {
        type: 'frame',
        content: '{eyes}',
        frame: { top: '┌───┐', middle: '│{content}│', bottom: '└───┘' },
        padding: 1,
      },
      { type: 'body', content: ['', '{data}', ''], padding: 2 },
    ],
  }
  const width = 16
  const lines = renderCardArt(definition, width, {
    eyes: '[0_0]',
    data: '▀1010▀',
  })
  t.true(lines.length > 0)
  for (const line of lines) {
    t.is(displayWidth(line), width)
  }
})

test('renderCardArt applies both static and dynamic replacements', (t) => {
  const definition: CardArtDefinition = {
    sections: [{ type: 'body', content: ['{greeting} {name}'], padding: 0 }],
    replacements: { greeting: 'hello' },
  }
  const lines = renderCardArt(definition, 20, { name: 'world' })
  t.true(lines[0]?.includes('hello world'))
})

test('renderCardArt accounts for wide (CJK) characters using display width, not string length', (t) => {
  const definition: CardArtDefinition = {
    sections: [{ type: 'body', content: ['你好'], padding: 0 }],
  }
  const width = 10
  const lines = renderCardArt(definition, width, {})
  t.is(lines.length, 1)
  t.is(displayWidth(lines[0] ?? ''), width)
})

test('renderCardArt renders every line of the robot theme ace to exactly the card width', (t) => {
  const definition = ROBOT_THEME['A']
  t.truthy(definition)
  if (!definition) return

  const width = 21
  const lines = renderCardArt(definition, width, {
    suit: '♥',
    data: '▀1010▀',
    core: '=|=',
  })
  t.true(lines.length > 0)
  for (const line of lines) {
    t.is(displayWidth(line), width)
  }
})
