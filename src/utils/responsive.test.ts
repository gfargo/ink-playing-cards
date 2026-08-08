import test from 'ava'
import { selectCardVariant } from './responsive.js'

// SelectCardVariant() — breakpoint selection

test('columns well above the ascii breakpoint selects ascii', (t) => {
  t.is(selectCardVariant(120), 'ascii')
})

test('columns well below the micro breakpoint selects micro', (t) => {
  t.is(selectCardVariant(4), 'micro')
})

test('columns between simple and ascii selects simple', (t) => {
  t.is(selectCardVariant(60), 'simple')
})

test('columns between minimal and simple selects minimal', (t) => {
  t.is(selectCardVariant(30), 'minimal')
})

test('columns between mini and minimal selects mini', (t) => {
  t.is(selectCardVariant(20), 'mini')
})

// SelectCardVariant() — exact boundaries

test('exactly 80 columns selects ascii', (t) => {
  t.is(selectCardVariant(80), 'ascii')
})

test('79 columns selects simple', (t) => {
  t.is(selectCardVariant(79), 'simple')
})

test('exactly 48 columns selects simple', (t) => {
  t.is(selectCardVariant(48), 'simple')
})

test('47 columns selects minimal', (t) => {
  t.is(selectCardVariant(47), 'minimal')
})

test('exactly 28 columns selects minimal', (t) => {
  t.is(selectCardVariant(28), 'minimal')
})

test('27 columns selects mini', (t) => {
  t.is(selectCardVariant(27), 'mini')
})

test('exactly 16 columns selects mini', (t) => {
  t.is(selectCardVariant(16), 'mini')
})

test('15 columns selects micro', (t) => {
  t.is(selectCardVariant(15), 'micro')
})

// SelectCardVariant() — fallback handling

test('undefined columns falls back to simple by default', (t) => {
  t.is(selectCardVariant(undefined), 'simple')
})

test('zero columns falls back to simple by default', (t) => {
  t.is(selectCardVariant(0), 'simple')
})

test('negative columns falls back to simple by default', (t) => {
  t.is(selectCardVariant(-10), 'simple')
})

test('NaN columns falls back to simple by default', (t) => {
  t.is(selectCardVariant(Number.NaN), 'simple')
})

test('a custom fallback is respected for invalid columns', (t) => {
  t.is(selectCardVariant(undefined, 'ascii'), 'ascii')
  t.is(selectCardVariant(0, 'micro'), 'micro')
})
