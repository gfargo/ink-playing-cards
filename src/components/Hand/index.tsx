import { Box } from 'ink'
import React from 'react'
import { useCardCursor } from '../../hooks/useCardCursor.js'
import { type TCard } from '../../types/index.js'
import { AnyCard } from '../AnyCard/index.js'

export type HandProps = {
  readonly cards: TCard[]
  readonly variant?: 'simple' | 'ascii' | 'minimal' | 'mini' | 'micro'
  readonly isFaceUp?: boolean
  readonly orientation?: 'horizontal' | 'vertical'
  readonly wrap?: boolean
  readonly isFocused?: boolean
  readonly initialIndex?: number
  readonly focusColor?: string
  readonly onSelect?: (card: TCard, index: number) => void
  readonly onHighlight?: (card: TCard, index: number) => void
}

/**
 * Renders a row (or column) of cards with built-in keyboard cursor
 * navigation via useCardCursor. Highlights the focused card with a border.
 */
export function Hand({
  cards,
  variant = 'simple',
  isFaceUp = true,
  orientation = 'horizontal',
  wrap = false,
  isFocused = true,
  initialIndex = 0,
  focusColor = 'green',
  onSelect,
  onHighlight,
}: HandProps) {
  const { cursor } = useCardCursor(cards, {
    orientation,
    wrap,
    isFocused,
    initialIndex,
    onSelect,
    onHighlight,
  })

  return (
    <Box
      flexDirection={orientation === 'vertical' ? 'column' : 'row'}
      alignItems="flex-start"
      gap={1}
    >
      {cards.map((card, index) => (
        <Box
          key={card.id}
          borderStyle="single"
          borderColor={index === cursor ? focusColor : undefined}
        >
          <AnyCard card={card} variant={variant} faceUp={isFaceUp} />
        </Box>
      ))}
    </Box>
  )
}

export default Hand
