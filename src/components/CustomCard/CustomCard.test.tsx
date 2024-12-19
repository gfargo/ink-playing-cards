import test from 'ava'
import { render } from 'ink-testing-library'
import React from 'react'
import { CustomCard } from './index.js'

test('render custom card with ASCII art', (t) => {
  const { lastFrame } = render(
    <CustomCard
      size="medium"
      title="Custom Card"
      description="This is a custom card with ASCII art"
      asciiArt={`
   _____
  |A .  |
  | /.\ |
  |(_._)|
  |  |  |
  |____V|
      `}
      symbols={[
        { char: '♠', position: 'top-left', color: 'white' },
        { char: '♠', position: 'bottom-right', color: 'white' },
      ]}
      borderColor="green"
      textColor="white"
    />
  )
  const customCardLastFrame = lastFrame()
  t.snapshot(customCardLastFrame)
})

test('render custom card with different sizes', (t) => {
  const sizes = ['small', 'medium', 'large'] as const
  sizes.forEach(size => {
    const { lastFrame } = render(
      <CustomCard
        size={size}
        title={`${size.charAt(0).toUpperCase() + size.slice(1)} Card`}
        description={`This is a ${size} custom card`}
      />
    )
    const customCardLastFrame = lastFrame()
    t.snapshot(customCardLastFrame)
  })
})

test('render face down custom card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      size="medium"
      title="Face Down Card"
      faceUp={false}
    />
  )
  const customCardLastFrame = lastFrame()
  t.snapshot(customCardLastFrame)
})
