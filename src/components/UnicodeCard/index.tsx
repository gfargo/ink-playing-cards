import { Box, Text, TextProps } from 'ink'
import React from 'react'
import type { TSuit, TCardValue } from '../../types/index.js'
import { getCardUnicode, SPECIAL_CARDS } from './constants.js'

export type UnicodeCardProps = {
  /** The suit of the card */
  suit: TSuit
  /** The value of the card */
  value: TCardValue
  /** Whether the card is face up or face down */
  faceUp?: boolean
  /** Whether the card is selected */
  selected?: boolean
  /** Whether to dim the card when face down */
  dimmed?: boolean
  /** Custom color for the card */
  color?: TextProps['color']
  /** Size multiplier for the card padding */
  size?: number
  /** Whether to show a border around the card */
  bordered?: boolean
  /** Whether to use rounded borders when bordered is true */
  rounded?: boolean
}

/**
 * A playing card component that uses Unicode characters for rendering.
 * Supports all standard cards plus Jokers and card backs.
 */
export function UnicodeCard({
  suit,
  value,
  faceUp = true,
  selected = false,
  dimmed = false,
  color,
  size = 1,
  bordered = false,
  rounded = true,
}: UnicodeCardProps) {
  // Calculate padding based on size
  const padding = Math.max(0, Math.floor(size - 1))

  // Get the Unicode character for the card
  const cardChar = faceUp ? getCardUnicode(suit, value) : SPECIAL_CARDS.CARD_BACK

  // Determine color based on suit if no custom color provided
  const defaultColor = (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'white'
  const baseColor = color ?? defaultColor

  // Apply dimming for face down cards if dimmed is true
  const finalColor = (!faceUp && dimmed) ? 'gray' : baseColor

  const content = (
    <Text 
      color={finalColor}
      bold={selected && !bordered}
    >
      {cardChar}
    </Text>
  )

  // If not bordered, return just the Text component
  if (!bordered) {
    return content
  }

  // If bordered, wrap in a Box with border styling
  return (
    <Box
      paddingX={padding}
      paddingY={Math.floor(padding / 2)}
      borderStyle={selected ? 'double' : rounded ? 'round' : 'single'}
      borderColor={selected ? 'yellow' : finalColor}
    >
      {content}
    </Box>
  )
}