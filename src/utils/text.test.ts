import test from 'ava'
import { applyReplacements } from './text.js'

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
