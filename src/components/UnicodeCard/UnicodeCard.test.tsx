import React from 'react'
import { render } from 'ink-testing-library'
import { UnicodeCard } from './index.js'
import { SPECIAL_CARDS } from './constants.js'

describe('UnicodeCard', () => {
  it('renders a basic card', () => {
    const { lastFrame } = render(
      <UnicodeCard suit="hearts" value="A" />
    )
    expect(lastFrame()).toMatch('🂱')
  })

  it('renders a face-down card', () => {
    const { lastFrame } = render(
      <UnicodeCard suit="hearts" value="A" faceUp={false} />
    )
    expect(lastFrame()).toMatch(SPECIAL_CARDS.CARD_BACK)
  })

  it('applies red color for hearts', () => {
    const { lastFrame } = render(
      <UnicodeCard suit="hearts" value="K" />
    )
    expect(lastFrame()).toContain('\u001b[31m') // ANSI red color code
  })

  it('applies white color for spades', () => {
    const { lastFrame } = render(
      <UnicodeCard suit="spades" value="K" />
    )
    expect(lastFrame()).toContain('\u001b[37m') // ANSI white color code
  })

  it('renders with custom color', () => {
    const { lastFrame } = render(
      <UnicodeCard suit="hearts" value="A" color="blue" />
    )
    expect(lastFrame()).toContain('\u001b[34m') // ANSI blue color code
  })

  it('renders selected card with bold text when not bordered', () => {
    const { lastFrame } = render(
      <UnicodeCard suit="hearts" value="A" selected />
    )
    expect(lastFrame()).toContain('\u001b[1m') // ANSI bold code
  })

  it('renders selected card with double border when bordered', () => {
    const { lastFrame } = render(
      <UnicodeCard suit="hearts" value="A" selected bordered />
    )
    expect(lastFrame()).toContain('═') // Double border character
  })

  it('renders dimmed face-down card', () => {
    const { lastFrame } = render(
      <UnicodeCard suit="hearts" value="A" faceUp={false} dimmed />
    )
    expect(lastFrame()).toContain('\u001b[90m') // ANSI gray color code
  })

  it('renders joker cards correctly', () => {
    const { lastFrame: redJoker } = render(
      <UnicodeCard suit="hearts" value="JOKER" />
    )
    expect(redJoker()).toMatch(SPECIAL_CARDS.RED_JOKER)

    const { lastFrame: blackJoker } = render(
      <UnicodeCard suit="spades" value="JOKER" />
    )
    expect(blackJoker()).toMatch(SPECIAL_CARDS.BLACK_JOKER)
  })
})