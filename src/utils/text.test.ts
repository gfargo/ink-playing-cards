import test from 'ava'
import {
  applyReplacements,
  center,
  displayWidth,
  left,
  right,
  spaces,
  truncate,
} from './text.js'

// Spaces()
test('spaces returns a string of the given length', (t) => {
  t.is(spaces(5), '     ')
  t.is(spaces(0), '')
  t.is(spaces(-1), '') // Negative clamps to 0
})

test('spaces uses the supplied character', (t) => {
  t.is(spaces(3, '-'), '---')
})

// Left()
test('left("AB", 10) has length 10', (t) => {
  t.is(left('AB', 10).length, 10)
})

test('left places text at the start and pads the rest', (t) => {
  t.is(left('AB', 10), 'AB' + ' '.repeat(8))
})

test('left when text >= width returns text unchanged', (t) => {
  t.is(left('ABCDEFGHIJ', 10), 'ABCDEFGHIJ')
  t.is(left('ABCDEFGHIJK', 10), 'ABCDEFGHIJK') // Overflow: no truncation
})

// Right()
test('right("AB", 10) has length 10', (t) => {
  t.is(right('AB', 10).length, 10)
})

test('right places text at the end and pads the front', (t) => {
  t.is(right('AB', 10), ' '.repeat(8) + 'AB')
})

test('right when text >= width returns text unchanged', (t) => {
  t.is(right('ABCDEFGHIJ', 10), 'ABCDEFGHIJ')
})

// Center()
test('center("AB", 10) has length 10', (t) => {
  t.is(center('AB', 10).length, 10)
})

test('center even remainder splits equally', (t) => {
  // "AB" in 10 → 8 remaining → 4 on each side
  t.is(center('AB', 10), '    AB    ')
})

test('center odd remainder splits floor left, ceil right', (t) => {
  // "A" in 4 → 3 remaining → floor(1.5)=1 left, ceil(1.5)=2 right
  t.is(center('A', 4), ' A  ')
})

test('center when text >= width returns text unchanged', (t) => {
  t.is(center('ABCDEFGHIJ', 10), 'ABCDEFGHIJ')
})

test('center with paddingCharacter uses that char', (t) => {
  const result = center('AB', 10, '-')
  t.is(result.length, 10)
  t.is(result, '----AB----')
})

// ApplyReplacements()
test('applyReplacements replaces a single token', (t) => {
  t.is(applyReplacements('hello {name}', { name: 'world' }), 'hello world')
})

test('applyReplacements replaces every occurrence of a token', (t) => {
  t.is(applyReplacements('{a} and {a} and {a}', { a: 'x' }), 'x and x and x')
})

test('applyReplacements replaces multiple distinct keys', (t) => {
  t.is(
    applyReplacements('{suit} of {value}', { suit: 'hearts', value: 'A' }),
    'hearts of A'
  )
})

test('applyReplacements leaves unmatched tokens untouched', (t) => {
  t.is(applyReplacements('{known} {unknown}', { known: 'x' }), 'x {unknown}')
})

test('applyReplacements treats keys as literal strings, not regex', (t) => {
  t.is(applyReplacements('{a.b}', { 'a.b': 'literal', ab: 'wrong' }), 'literal')
})

test('applyReplacements is a no-op when replacements is empty', (t) => {
  t.is(applyReplacements('plain text {token}', {}), 'plain text {token}')
})

test('applyReplacements returns text unchanged when no tokens present', (t) => {
  t.is(applyReplacements('no tokens here', { key: 'value' }), 'no tokens here')
})

// DisplayWidth()
test('displayWidth counts ASCII as 1 column per character', (t) => {
  t.is(displayWidth('a'), 1)
  t.is(displayWidth('hello'), 5)
})

test('displayWidth counts wide CJK characters as 2 columns each', (t) => {
  t.is(displayWidth('한'), 2)
  t.is(displayWidth('가나다'), 6)
})

test('displayWidth counts wide emoji as 2 columns', (t) => {
  t.is(displayWidth('🀄'), 2)
})

test('displayWidth counts a surrogate-pair symbol as 1 column', (t) => {
  t.is(displayWidth('🜂'), 1)
})

// Truncate()
test('truncate returns text unchanged when it already fits', (t) => {
  t.is(truncate('AB', 10), 'AB')
})

test('truncate does not split a wide character in half', (t) => {
  // "한글" is 4 columns; budget of 3 can only fit the first wide char (2 cols)
  t.is(truncate('한글', 3), '한')
  t.is(displayWidth(truncate('한글', 3)), 2)
})

test('truncate to zero or negative width returns empty string', (t) => {
  t.is(truncate('AB', 0), '')
  t.is(truncate('AB', -5), '')
})

// Width-aware padding with CJK/emoji text
test('center pads a CJK string based on display width, not code units', (t) => {
  const result = center('한', 10)
  t.is(displayWidth(result), 10)
  t.is(result, '    한    ')
})

test('left pads a CJK string based on display width, not code units', (t) => {
  const result = left('한', 10)
  t.is(displayWidth(result), 10)
  t.is(result, '한' + ' '.repeat(8))
})

test('right pads a CJK string based on display width, not code units', (t) => {
  const result = right('한', 10)
  t.is(displayWidth(result), 10)
  t.is(result, ' '.repeat(8) + '한')
})

test('center pads an emoji string based on display width', (t) => {
  const result = center('🀄', 10)
  t.is(displayWidth(result), 10)
})
