import { Box, Text } from 'ink'
import React from 'react'
import { getSuitColor } from '../../constants/card.js'
import { useCardTheme } from '../../contexts/ThemeContext.js'
import { type CardProps } from '../../types/index.js'

type MiniCardProps = {
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
  const cardTheme = useCardTheme()
  const suitSymbol = cardTheme.suitGlyphs[suit]

  const color = getSuitColor(suit, cardTheme)

  // Micro cards are 2x4, mini cards are 5x4
  return (
    <Box
      flexDirection="column"
      overflow="hidden"
      width={variant === 'mini' ? 5 : 4}
      height={variant === 'mini' ? 4 : 4}
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
          <Text color={color}>
            {variant === 'mini'
              ? `${value.length <= 1 ? ` ${value} ` : `${value}`}`
              : value}
          </Text>
          <Text color={color}>
            {variant === 'mini' ? ` ${suitSymbol} ` : ` ${suitSymbol}`}
          </Text>
        </>
      ) : (
        <>
          {variant === 'mini' ? <Text>{` `}</Text> : null}
          <Text>{variant === 'mini' ? ` ?` : `?`}</Text>
          <Text>{variant === 'mini' ? ` ?` : ` ?`}</Text>
        </>
      )}
    </Box>
  )
}
