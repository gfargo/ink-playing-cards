import test from 'ava'
import {
  createBodySection,
  createFramedSection,
  formatLine,
  padReplacement,
} from './layout.js'

// FormatLine()
test('formatLine defaults to left-align and pads to width', (t) => {
  const result = formatLine('x', 10)
  t.is(result.length, 10)
  t.is(result, 'x' + ' '.repeat(9))
})

test('formatLine centers content when align is center', (t) => {
  const result = formatLine('ab', 10, { align: 'center' })
  t.is(result.length, 10)
  t.is(result, '    ab    ')
})

test('formatLine right-aligns content when align is right', (t) => {
  const result = formatLine('ab', 10, { align: 'right' })
  t.is(result.length, 10)
  t.is(result, ' '.repeat(8) + 'ab')
})

test('formatLine with a frame wraps content and fills the requested width', (t) => {
  const result = formatLine('ab', 10, {
    align: 'center',
    frame: { left: '|', right: '|' },
  })
  t.true(result.startsWith('|'))
  t.true(result.endsWith('|'))
  t.is(result.length, 10)
  t.is(result, '|   ab   |')
})

test('formatLine applies padding as real margin and still fills the requested width', (t) => {
  // Width=10, paddingWidth=3 (left:2, right:1) -> contentWidth=7
  const result = formatLine('x', 10, { padding: { left: 2, right: 1 } })
  t.is(result.length, 10)
  t.is(result, '  x' + ' '.repeat(7))
})

test('formatLine does not truncate content wider than contentWidth', (t) => {
  // ContentWidth=5, but content is 10 chars -> overflow is left intact, not clipped
  const result = formatLine('HELLOWORLD', 5)
  t.is(result, 'HELLOWORLD')
  t.true(result.length > 5)
})

test('formatLine keeps the frame around overflowing content instead of dropping it', (t) => {
  // ContentWidth = 5 - 2 (frame) = 3, but content ("WIDE") is 4 chars
  const result = formatLine('WIDE', 5, {
    align: 'center',
    frame: { left: '[', right: ']' },
  })
  t.is(result, '[WIDE]')
})

// PadReplacement()
test('padReplacement centers a value within the target width by default', (t) => {
  t.is(padReplacement('A', 5), '  A  ')
})

test('padReplacement supports left and right alignment', (t) => {
  t.is(padReplacement('A', 5, 'left'), 'A    ')
  t.is(padReplacement('A', 5, 'right'), '    A')
})

// CreateBodySection()
test('createBodySection pads each line to exactly width with padding as margin', (t) => {
  const result = createBodySection(['A'], 10, 2)
  t.is(result[0]?.length, 10)
  t.is(result[0], ' '.repeat(4) + 'A' + ' '.repeat(5))
})

test('createBodySection produces one output line per input line, each exactly width', (t) => {
  const result = createBodySection(['A', 'BB', 'CCC'], 10, 2)
  t.is(result.length, 3)
  for (const line of result) {
    t.is(line.length, 10)
  }
})

test('createBodySection with zero padding fills the entire width with content', (t) => {
  const result = createBodySection(['AB'], 10, 0)
  t.is(result[0]?.length, 10)
  t.is(result[0], '    AB    ')
})

test('createBodySection keeps the padding margin around content that overflows the available width', (t) => {
  // Width=5, padding=2 each side -> contentWidth=1, but content ("TOOLONG") is 7 chars
  const result = createBodySection(['TOOLONG'], 5, 2)
  t.is(result[0], '  TOOLONG  ')
  t.true(result[0]?.startsWith('  '))
  t.true(result[0]?.endsWith('  '))
})

// CreateFramedSection()
test('createFramedSection returns top frame, body lines, and bottom frame', (t) => {
  const result = createFramedSection(['hi'], 10, {
    top: '+--+',
    middle: '|{content}|',
    bottom: '+--+',
  })
  t.is(result.length, 3)
})

test('createFramedSection produces lines whose width equals the requested width (no border shrink)', (t) => {
  const width = 10
  const result = createFramedSection(['hi', 'there'], width, {
    top: '+--+',
    middle: '|{content}|',
    bottom: '+--+',
  })
  for (const line of result) {
    t.is(line.length, width)
  }
})

test('createFramedSection wraps each content line with the middle frame characters', (t) => {
  const result = createFramedSection(['hi'], 10, {
    top: '+--+',
    middle: '|{content}|',
    bottom: '+--+',
  })
  const contentLine = result[1]
  t.true(contentLine?.startsWith('|'))
  t.true(contentLine?.endsWith('|'))
})

test('createFramedSection keeps the middle frame around content that overflows the width', (t) => {
  // Framed content width = 10 - 2 (frame chars) = 8, but "OVERFLOWING" is 11 chars
  const result = createFramedSection(['OVERFLOWING'], 10, {
    top: '+--+',
    middle: '|{content}|',
    bottom: '+--+',
  })
  t.is(result[1], '|OVERFLOWING|')
})
