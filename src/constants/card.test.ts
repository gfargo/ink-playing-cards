import test from 'ava'
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
