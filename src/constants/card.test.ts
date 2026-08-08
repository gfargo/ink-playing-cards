import test from 'ava'
import { defaultTheme } from '../contexts/ThemeContext.js'
import { getSuitColor } from './card.js'

test('getSuitColor returns red for hearts', (t) => {
  t.is(getSuitColor('hearts'), 'red')
})

test('getSuitColor returns red for diamonds', (t) => {
  t.is(getSuitColor('diamonds'), 'red')
})

test('getSuitColor returns white for clubs', (t) => {
  t.is(getSuitColor('clubs'), 'white')
})

test('getSuitColor returns white for spades', (t) => {
  t.is(getSuitColor('spades'), 'white')
})

test('getSuitColor with defaultTheme matches the no-theme defaults', (t) => {
  t.is(getSuitColor('hearts', defaultTheme), 'red')
  t.is(getSuitColor('clubs', defaultTheme), 'white')
})

test('getSuitColor returns undefined for a monochrome theme', (t) => {
  t.is(getSuitColor('hearts', { ...defaultTheme, monochrome: true }), undefined)
  t.is(getSuitColor('spades', { ...defaultTheme, monochrome: true }), undefined)
})

test('getSuitColor uses a custom suitColors map from the theme', (t) => {
  t.is(
    getSuitColor('hearts', {
      ...defaultTheme,
      suitColors: { ...defaultTheme.suitColors, hearts: 'magenta' },
    }),
    'magenta'
  )
})
