import test from 'ava'
import type { CardArtDefinition } from '../types/cardArt.js'
import { ROBOT_THEME } from '../constants/robotTheme.js'
import { renderCardArt } from './cardArtRenderer.js'
import { displayWidth } from './text.js'

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
