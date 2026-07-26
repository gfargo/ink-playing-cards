import { Box, Text, type BoxProps } from 'ink'
import React, { useContext } from 'react'
import { CARD_DIMENSIONS, SUIT_SYMBOL_MAP } from '../../constants/card.js'
import { DeckContext, defaultBackArtwork } from '../../contexts/DeckContext.js'
import { type AsciiTheme, type CardProps } from '../../types/index.js'
import { centerLabelBlock } from '../../utils/text.js'
import { createCardContent } from './utils.js'

function createMinimalBackContent(
  backArtwork: string,
  width: number,
  height: number
): string {
  const label = backArtwork.split('\n').join('')
  return centerLabelBlock(label, width - 2, height - 2)
}

/**
 * Card component that renders a playing card with various display variants.
 * Supports simple, ASCII, and minimal display styles.
 *
 * Can be used inside or outside a DeckProvider — falls back to default
 * back artwork when no provider is present.
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
  const context = useContext(DeckContext)
  const backArtwork = context?.backArtwork ?? defaultBackArtwork

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
          <Text>
            {variant === 'minimal'
              ? createMinimalBackContent(
                  backArtwork[variant],
                  config.width,
                  config.height
                )
              : backArtwork[variant]}
          </Text>
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
