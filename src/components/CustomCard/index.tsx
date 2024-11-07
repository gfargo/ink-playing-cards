import { Box, Text } from 'ink'
import React from 'react'
import useDeck from '../../hooks/useDeck.js'
import { type CustomCardProps } from '../../types/index.js'

function CustomCard({ type, content, faceUp = true, style }: CustomCardProps) {
  const { backArtwork } = useDeck()

  const cardStyle = {
    padding: 1,
    borderStyle: 'single',
    width: 20,
    height: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...style,
  }

  if (!faceUp) {
    return (
      // @ts-ignore
      <Box {...cardStyle}>
        <Text>{backArtwork}</Text>
      </Box>
    )
  }

  return (
    // @ts-ignore
    <Box {...cardStyle}>
      <Box width="100%" justifyContent="space-between">
        <Text>{type}</Text>
      </Box>
      <Box flexGrow={1} justifyContent="center" alignItems="center">
        {content}
      </Box>
    </Box>
  )
}

export default CustomCard
