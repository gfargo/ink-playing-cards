import { Box, Text, type BoxProps } from 'ink'
import React from 'react'
import { useDeck } from '../../hooks/useDeck.js'
import { type CardProps } from '../../types/index.js'
import { CARD_DIMENSIONS, SUIT_SYMBOL_MAP } from '../../constants/card.js'
import { createCardContent } from './utils.js'

/**
 * Card component that renders a playing card with various display variants.
 * Supports simple, ASCII, and minimal display styles.
 */
export function Card({
  suit,
  value,
  faceUp = true,
  selected = false,
  rounded = true,
  variant = 'simple',
}: CardProps & { readonly variant?: 'ascii' | 'simple' | 'minimal' }) {
  const { backArtwork } = useDeck()
  const config = CARD_DIMENSIONS[variant]

  const cardStyle: BoxProps = {
    flexDirection: 'column',
    paddingX: config.padding,
    borderStyle: selected ? 'double' : rounded ? 'round' : 'single',
    borderColor: selected ? 'yellow' : 'white',
    height: config.height,
    width: config.width,
    overflow: 'hidden',
  }

  if (!faceUp) {
    return (
      <Box {...cardStyle}>
        <Box width="100%" height="100%">
          <Text>{backArtwork[variant]}</Text>
        </Box>
      </Box>
    )
  }

  const color = suit === 'hearts' || suit === 'diamonds' ? 'red' : 'white'
  const symbol = SUIT_SYMBOL_MAP[suit]
  const cardContent = createCardContent(value, symbol, variant, config)

  return (
    <Box {...cardStyle}>
      <Text color={color}>{cardContent}</Text>
    </Box>
  )
}

export default Card
