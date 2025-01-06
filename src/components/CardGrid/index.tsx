import { Box, type BoxProps } from 'ink'
import React from 'react'
import { type TCardValue, type TSuit } from '../../types/index.js'
import Card from '../Card/index.js'
import { MiniCard } from '../MiniCard/index.js'

// Type for cards that can be displayed in the grid
export type GridCard = {
  id: string
  suit: TSuit
  value: TCardValue
}

type CardGridProps = {
  readonly rows: number
  readonly cols: number
  readonly cards: Array<GridCard | null>  // null for empty cells
  readonly variant?: 'simple' | 'ascii' | 'minimal' | 'mini' | 'micro'
  readonly spacing?: {
    row?: number        // Space between rows
    col?: number        // Space between columns
    margin?: number     // Space around the entire grid
  }
  readonly isFaceUp?: boolean
  readonly fillEmpty?: boolean  // Whether to show placeholder for empty cells
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
  // Split cards into rows
  const grid = React.useMemo(() => {
    const result: Array<Array<GridCard | null>> = []
    for (let i = 0; i < rows; i++) {
      result.push(cards.slice(i * cols, (i + 1) * cols))
      // Pad with null if row is incomplete
      while (result[i]!.length < cols) {
        result[i]!.push(null)
      }
    }
    return result
  }, [cards, rows, cols])

  // Get alignment styles
  const getAlignmentStyle = (): BoxProps => {
    let alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch' | undefined
    let justifyContent: 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'center' | undefined

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
    switch (variant) {
      case 'mini': {
        return { width: 5, height: 4 }
      }
      case 'micro': {
        return { width: 3, height: 2 }
      }
      case 'minimal': {
        return { width: 5, height: 3 }
      }
      case 'ascii': {
        return { width: 13, height: 11 }
      }
      default: {
        return { width: 9, height: 7 }
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
          marginY={spacing.row}
        >
          {row.map((card, colIndex) => (
            <Box 
              key={`${rowIndex}-${colIndex}`}
              marginX={spacing.col}
            >
              {card ? (
                variant === 'mini' || variant === 'micro' ? (
                  <MiniCard
                    suit={card.suit}
                    value={card.value}
                    faceUp={isFaceUp}
                    variant={variant === 'mini' ? 'mini' : 'micro'}
                  />
                ) : (
                  <Card
                    suit={card.suit}
                    value={card.value}
                    faceUp={isFaceUp}
                    variant={variant}
                  />
                )
              ) : fillEmpty ? (
                // Render empty placeholder
                <Box 
                  {...getPlaceholderSize()}
                  borderStyle="single"
                />
              ) : null}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  )
}

export default CardGrid