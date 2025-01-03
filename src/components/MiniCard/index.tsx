import { Box, Text } from 'ink'
import React from 'react'
import { type CardProps } from '../../types/index.js'

type MiniCardProps = {
  readonly selected?: boolean
  readonly rounded?: boolean
  readonly variant?: 'mini' | 'micro'
} & CardProps

export function MiniCard({
  suit,
  value,
  faceUp = true,
  selected = false,
  rounded = true,
  variant = 'mini',
}: MiniCardProps) {
  const suitSymbol = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  }[suit]

  const color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'white'

  // Micro cards are 3x2, mini cards are 3x4
  return (
    <Box
      flexDirection="column"
      width={3}
      height={variant === 'mini' ? 4 : 2}
      borderStyle={selected ? 'double' : rounded ? 'round' : 'single'}
      borderColor={selected ? 'yellow' : 'white'}
    >
      {faceUp ? (
        <>
          {variant === 'mini' && <Text>{` `}</Text>}
          <Text color={color}>
            {variant === 'mini'
              ? ` ${value.length > 1 ? `${value} ` : value}`
              : value}
          </Text>
          <Text color={color}>
            {variant === 'mini' ? ` ${suitSymbol} ` : suitSymbol}
          </Text>
        </>
      ) : (
        <>
          {variant === 'mini' && <Text>{` `}</Text>}
          <Text>{variant === 'mini' ? ` ☼ ` : '☼'}</Text>
          <Text>{variant === 'mini' ? ` ☕︎ ` : '☕︎'}</Text>
        </>
      )}
    </Box>
  )
}
