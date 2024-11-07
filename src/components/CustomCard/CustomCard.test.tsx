import test from 'ava'
import { Box, Text } from 'ink'
import { render } from 'ink-testing-library'
import React from 'react'
import CustomCard from './index.js'

test('render custom card', (t) => {
  const { lastFrame } = render(
    <CustomCard
      id="custom-card"
      type="custom card"
      content={
        <Box>
          <Text>Q</Text>
          <Text>♣</Text>
        </Box>
      }
      value="Q"
    />
  )
  const customCardLastFrame = lastFrame()
  t.snapshot(customCardLastFrame)
})
