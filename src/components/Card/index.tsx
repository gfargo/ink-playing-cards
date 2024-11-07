import { Box, type BoxProps, Text } from 'ink'
import React from 'react'
import useDeck from '../../hooks/useDeck.js'
import { type CardProps } from '../../types/index.js'

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

function Card({ suit, value, faceUp = true }: CardProps) {
  const { backArtwork } = useDeck()

  const cardStyle: BoxProps = {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 1,
    borderStyle: 'single',
    height: 7,
    width: 5,
  }

  if (!faceUp) {
    return (
      <Box {...cardStyle}>
        <Box width="100%" height="100%">
          <Text>{backArtwork}</Text>
        </Box>
      </Box>
    )
  }

  const color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'white'

  return (
    <Box {...cardStyle}>
      <Box width="100%" justifyContent="space-between">
        <Text color={color}>{value}</Text>
        <Text color={color}>{suitSymbols[suit]}</Text>
      </Box>
      <Box flexGrow={1} justifyContent="center" alignItems="center">
        <Text color={color}>{suitSymbols[suit]}</Text>
      </Box>
      <Box width="100%" justifyContent="flex-end">
        <Text color={color}>{value}</Text>
      </Box>
    </Box>
  )
}

export default Card
