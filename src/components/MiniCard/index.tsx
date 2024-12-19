import { Box, Text } from 'ink'
import React from 'react'
import { type CardProps } from '../../types/index.js'

type MiniCardProps = {
  readonly selected?: boolean
  readonly rounded?: boolean
} & CardProps

export function MiniCard({
  suit,
  value,
  faceUp = true,
  selected = false,
  rounded = true,
}: MiniCardProps) {
  const suitSymbol = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  }[suit]

  const color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'white'

  return (
    <Box
      flexDirection="column"
      width={3} // Suit and value are 1 character wide, stacked vertically with padding
      height={4} // 2 lines for value and suit, 2 lines for padding
      borderStyle={selected ? 'double' : rounded ? 'round' : 'single'}
      borderColor={selected ? 'yellow' : 'white'}
    >
      {faceUp ? (
        <>
          <Text color={color}>{value}</Text>
          <Text color={color}>{suitSymbol}</Text>
        </>
      ) : (
        <Text>🂠</Text>
      )}
    </Box>
  )
}
