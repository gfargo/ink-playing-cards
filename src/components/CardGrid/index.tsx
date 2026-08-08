import process from 'node:process'
import { Box, type BoxProps } from 'ink'
import React from 'react'
import { CARD_DIMENSIONS } from '../../constants/card.js'
import { type TCard, type TCardValue, type TSuit } from '../../types/index.js'
import { useResponsiveVariant } from '../../hooks/useResponsiveVariant.js'
import { type CardVariant } from '../../utils/responsive.js'
import { AnyCard } from '../AnyCard/index.js'

// Convenience alias for a standard playing card shape.
// CardGrid itself accepts any TCard (standard, custom, or tarot) via the
// `cards` prop below and renders each cell through AnyCard.
export type GridCard = {
  id: string
  suit: TSuit
  value: TCardValue
}

type CardGridProps = {
  readonly rows: number
  readonly cols: number
  readonly cards: Array<TCard | undefined> // Undefined for empty cells
  readonly variant?: CardVariant | 'responsive'
  readonly spacing?: {
    row?: number // Space between rows
    col?: number // Space between columns
    margin?: number // Space around the entire grid
  }
  readonly isFaceUp?: boolean
  readonly fillEmpty?: boolean // Whether to show placeholder for empty cells
  readonly alignment?: {
    horizontal?: 'left' | 'center' | 'right'
    vertical?: 'top' | 'middle' | 'bottom'
  }
}

export function CardGrid({
  rows,
  cols,
  cards,
  variant = 'simple',
  spacing = { row: 1, col: 1, margin: 1 },
  isFaceUp = true,
  fillEmpty = false,
  alignment = { horizontal: 'center', vertical: 'middle' },
}: CardGridProps) {
  const responsiveVariant = useResponsiveVariant()
  const resolvedVariant = variant === 'responsive' ? responsiveVariant : variant

  React.useEffect(() => {
    const capacity = rows * cols
    if (process.env['NODE_ENV'] !== 'production' && cards.length > capacity) {
      console.warn(
        `CardGrid: received ${cards.length} cards but the ${rows}x${cols} grid only has room for ${capacity}. ` +
          `${cards.length - capacity} card(s) will not be rendered.`
      )
    }
  }, [cards, rows, cols])

  // Split cards into rows
  const grid = React.useMemo(() => {
    const result: Array<Array<TCard | undefined>> = []
    for (let i = 0; i < rows; i++) {
      result.push(cards.slice(i * cols, (i + 1) * cols))
      // Pad with null if row is incomplete
      while (result[i]!.length < cols) {
        result[i]!.push(undefined)
      }
    }

    return result
  }, [cards, rows, cols])

  // Get alignment styles
  const getAlignmentStyle = (): BoxProps => {
    let alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch' | undefined
    let justifyContent:
      | 'flex-start'
      | 'flex-end'
      | 'space-between'
      | 'space-around'
      | 'center'
      | undefined

    switch (alignment.horizontal) {
      case 'left': {
        alignItems = 'flex-start'
        break
      }

      case 'right': {
        alignItems = 'flex-end'
        break
      }

      default: {
        alignItems = 'center'
      }
    }

    switch (alignment.vertical) {
      case 'top': {
        justifyContent = 'flex-start'
        break
      }

      case 'bottom': {
        justifyContent = 'flex-end'
        break
      }

      default: {
        justifyContent = 'center'
      }
    }

    return { alignItems, justifyContent }
  }

  // Get placeholder dimensions based on variant
  const getPlaceholderSize = () => {
    switch (resolvedVariant) {
      case 'mini': {
        return { width: 5, height: 4 }
      }

      case 'micro': {
        return { width: 4, height: 4 }
      }

      case 'minimal': {
        return {
          width: CARD_DIMENSIONS.minimal.width,
          height: CARD_DIMENSIONS.minimal.height,
        }
      }

      case 'ascii': {
        return {
          width: CARD_DIMENSIONS.ascii.width,
          height: CARD_DIMENSIONS.ascii.height,
        }
      }

      default: {
        return {
          width: CARD_DIMENSIONS.simple.width,
          height: CARD_DIMENSIONS.simple.height,
        }
      }
    }
  }

  return (
    <Box
      flexDirection="column"
      marginX={spacing.margin}
      marginY={spacing.margin}
      {...getAlignmentStyle()}
    >
      {grid.map((row, rowIndex) => (
        <Box
          key={rowIndex}
          flexDirection="row"
          marginTop={rowIndex === 0 ? 0 : spacing.row}
        >
          {row.map((card, colIndex) => (
            <Box
              key={`${rowIndex}-${colIndex}`}
              marginLeft={colIndex === 0 ? 0 : spacing.col}
            >
              {card ? (
                <AnyCard
                  card={card}
                  variant={resolvedVariant}
                  faceUp={isFaceUp}
                />
              ) : fillEmpty ? (
                // Render empty placeholder
                <Box {...getPlaceholderSize()} borderStyle="single" />
              ) : null}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}

export default CardGrid
