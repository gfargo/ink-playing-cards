import { Box, Text } from 'ink'
import React, { useContext } from 'react'
import { getSuitColor } from '../../constants/card.js'
import { DeckContext, defaultBackArtwork } from '../../contexts/DeckContext.js'
import { useCardTheme } from '../../contexts/ThemeContext.js'
import { type CardProps } from '../../types/index.js'
import { center, centerLabelBlock } from '../../utils/text.js'

type MiniCardProps = {
  readonly variant?: 'mini' | 'micro'
} & CardProps

// Inner content width (card width minus the 1-column border on each side).
const INNER_WIDTH: Record<'mini' | 'micro', number> = { mini: 3, micro: 2 }
// Both variants share a 4-row card height, leaving 2 content rows once the
// top/bottom border is subtracted.
const INNER_HEIGHT = 2

export function MiniCard({
  suit,
  value,
  faceUp = true,
  selected = false,
  rounded = true,
  variant = 'mini',
}: MiniCardProps) {
  const cardTheme = useCardTheme()
  const suitSymbol = cardTheme.suitGlyphs[suit]
  const context = useContext(DeckContext)
  const backArtwork = context?.backArtwork ?? defaultBackArtwork

  const color = getSuitColor(suit, cardTheme)
  const innerWidth = INNER_WIDTH[variant]
  // 'JOKER' has no room even at the 3-column 'mini' width, so it collapses
  // to 'JK' the same way Card's minimal variant abbreviates it.
  const displayValue = center(value === 'JOKER' ? 'JK' : value, innerWidth)

  // Micro cards are 2x4, mini cards are 5x4
  return (
    <Box
      flexDirection="column"
      overflow="hidden"
      width={variant === 'mini' ? 5 : 4}
      height={4}
      // `rounded={false}` always renders a square 'single' border, even
      // under a theme with a custom `borderStyle` — see BaseCardProps['rounded'] docs.
      borderStyle={
        selected
          ? cardTheme.selectedBorderStyle
          : rounded
            ? cardTheme.borderStyle
            : 'single'
      }
      borderColor={
        cardTheme.monochrome
          ? undefined
          : selected
            ? cardTheme.selectedColor
            : 'white'
      }
    >
      {faceUp ? (
        <>
          {variant === 'mini' ? <Text>{` `}</Text> : null}
          <Text color={color}>{displayValue}</Text>
          <Text color={color}>
            {variant === 'mini' ? ` ${suitSymbol} ` : ` ${suitSymbol}`}
          </Text>
        </>
      ) : (
        <Text>
          {centerLabelBlock(
            backArtwork.minimal.split('\n').join(''),
            innerWidth,
            INNER_HEIGHT
          )}
        </Text>
      )}
    </Box>
  )
}
