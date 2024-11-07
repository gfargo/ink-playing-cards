import { Box, Text } from 'ink'
import React from 'react'
import useDeck from '../../hooks/useDeck.js'
import { type CardProps } from '../../types/index.js'

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

function Card({ suit, value, faceUp = true, style }: CardProps) {
  const { backArtwork } = useDeck()

  const cardStyle = {
    padding: 1,
    borderStyle: 'single',
    width: 7,
    height: 5,
    ...style,
  }

  if (!faceUp) {
    return (
      <Box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        // @ts-ignore
        style={{ ...cardStyle, flexDirection: 'column' }}
      >
        <Text>{backArtwork}</Text>
      </Box>
    )
  }

  const color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'white'

  return (
    <Box
      flexDirection="column"
      alignItems="flex-start"
      // @ts-ignore
      style={cardStyle}
    >
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
