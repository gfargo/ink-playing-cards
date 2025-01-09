import { Box, Text, type BoxProps } from 'ink'
import React from 'react'
import { CARD_DIMENSIONS, SUIT_SYMBOL_MAP } from '../../constants/card.js'
import { useDeck } from '../../hooks/useDeck.js'
import { type AsciiTheme, type CardProps } from '../../types/index.js'
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
  theme = 'original',
}: CardProps & {
  readonly variant?: 'ascii' | 'simple' | 'minimal'
  readonly theme?: AsciiTheme
}) {
  const { backArtwork } = useDeck()
  const config = {
    ...CARD_DIMENSIONS[variant],
    pip:
      'pip' in CARD_DIMENSIONS[variant]
        ? (CARD_DIMENSIONS[variant].pip as {
            left: number
            center: number
            right: number
          })
        : { left: 0, center: 0, right: 0 },
  }

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
  const cardContent = createCardContent(value, symbol, variant, config, theme)

  return (
    <Box {...cardStyle}>
      <Text color={color}>{cardContent}</Text>
    </Box>
  )
}

export default Card
