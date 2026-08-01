import test from 'ava'
import { applyReplacements, center, left, right, spaces } from './text.js'

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
