import { Box, type BoxProps, Text } from 'ink'
import React from 'react'
import useDeck from '../../hooks/useDeck.js'
import { type CustomCardProps } from '../../types/index.js'

function CustomCard({ type, content, faceUp = true }: CustomCardProps) {
  const { backArtwork } = useDeck()

  const cardStyle: BoxProps = {
    padding: 1,
    borderStyle: 'round',
    width: 18,
    height: 10,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }

  if (!faceUp) {
    return (
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
