import { Box, Text } from 'ink'
import React from 'react'
import { CardGrid, type GridCard } from '../../components/CardGrid/index.js'
import { type TCardValue, type TSuit } from '../../types/index.js'
import EnhancedSelectInput from '../utils/EnhancedSelectInput.js'

// Sample cards for demonstration
const sampleCards: GridCard[] = [
  { id: '1', suit: 'hearts' as TSuit, value: 'A' as TCardValue },
  { id: '2', suit: 'spades' as TSuit, value: 'K' as TCardValue },
  { id: '3', suit: 'diamonds' as TSuit, value: 'Q' as TCardValue },
  { id: '4', suit: 'clubs' as TSuit, value: 'J' as TCardValue },
  { id: '5', suit: 'hearts' as TSuit, value: '10' as TCardValue },
  { id: '6', suit: 'diamonds' as TSuit, value: '9' as TCardValue },
  { id: '7', suit: 'spades' as TSuit, value: '8' as TCardValue },
  { id: '8', suit: 'clubs' as TSuit, value: '7' as TCardValue },
  { id: '9', suit: 'hearts' as TSuit, value: '6' as TCardValue },
]

type GridVariant = 'simple' | 'ascii' | 'minimal' | 'mini' | 'micro'

export function GridView({ goBack }: { readonly goBack?: () => void }) {
  const [variant, setVariant] = React.useState<GridVariant>('simple')
  const [rows, setRows] = React.useState(2)
  const [cols, setCols] = React.useState(3)
  const [faceUp, setFaceUp] = React.useState(true)
  const [fillEmpty, setFillEmpty] = React.useState(true)
  const [rowGap, setRowGap] = React.useState(1)
  const [colGap, setColGap] = React.useState(1)
  const [horizontalAlign, setHorizontalAlign] = React.useState<
    'left' | 'center' | 'right'
  >('center')
  const [verticalAlign, setVerticalAlign] = React.useState<
    'top' | 'middle' | 'bottom'
  >('middle')

  const [currentSelect, setCurrentSelect] = React.useState<
    'variant' | 'size' | 'face' | 'spacing' | 'alignment' | 'style'
  >('variant')

  const renderSelector = () => {
    switch (currentSelect) {
      case 'variant': {
        return (
          <>
            <Text dimColor>Select grid variant:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: 'Simple',
                  value: 'simple',
                  indicator: <Text color="cyan">⌱</Text>,
                  hotkey: 's',
                },
                {
                  label: 'ascii',
                  value: 'ascii',
                  indicator: <Text color="cyan">⌲</Text>,
                  hotkey: 'a',
                },
                {
                  label: 'Minimal',
                  value: 'minimal',
                  indicator: <Text color="cyan">⌳</Text>,
                  hotkey: 'm',
                },
                {
                  label: 'Mini',
                  value: 'mini',
                  indicator: <Text color="cyan">▫</Text>,
                  hotkey: 'i',
                },
                {
                  label: 'Micro',
                  value: 'micro',
                  indicator: <Text color="cyan">▪</Text>,
                  hotkey: 'c',
                },
                {
                  label: 'Next (Size)',
                  value: 'next',
                  indicator: <Text color="yellow">→</Text>,
                  hotkey: 'n',
                },
                {
                  label: 'Back',
                  value: 'back',
                  indicator: <Text color="red">←</Text>,
                  hotkey: 'b',
                },
              ]}
              onSelect={(item) => {
                if (item.value === 'back' && goBack) {
                  goBack()
                } else if (item.value === 'next') {
                  setCurrentSelect('size')
                } else {
                  setVariant(item.value as GridVariant)
                }
              }}
            />
          </>
        )
      }

      case 'size': {
        return (
          <>
            <Text dimColor>Adjust grid size:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: `Rows: ${rows}`,
                  value: 'rows',
                  indicator: <Text color="cyan">↕</Text>,
                  hotkey: 'r',
                },
                {
                  label: 'More Rows',
                  value: 'more-rows',
                  indicator: <Text color="cyan">↑</Text>,
                  hotkey: 'u',
                },
                {
                  label: 'Less Rows',
                  value: 'less-rows',
                  indicator: <Text color="cyan">↓</Text>,
                  hotkey: 'd',
                },
                {
                  label: `Cols: ${cols}`,
                  value: 'cols',
                  indicator: <Text color="cyan">↔</Text>,
                  hotkey: 'c',
                },
                {
                  label: 'More Cols',
                  value: 'more-cols',
                  indicator: <Text color="cyan">→</Text>,
                  hotkey: 'l',
                },
                {
                  label: 'Less Cols',
                  value: 'less-cols',
                  indicator: <Text color="cyan">←</Text>,
                  hotkey: 'h',
                },
                {
                  label: 'Next (Face)',
                  value: 'next',
                  indicator: <Text color="yellow">→</Text>,
                  hotkey: 'n',
                },
                {
                  label: 'Back (Variant)',
                  value: 'back',
                  indicator: <Text color="yellow">←</Text>,
                  hotkey: 'b',
                },
              ]}
              onSelect={(item) => {
                switch (item.value) {
                  case 'back': {
                    setCurrentSelect('variant')
                    break
                  }

                  case 'next': {
                    setCurrentSelect('face')
                    break
                  }

                  case 'more-rows': {
                    setRows(Math.min(5, rows + 1))
                    break
                  }

                  case 'less-rows': {
                    setRows(Math.max(1, rows - 1))
                    break
                  }

                  case 'more-cols': {
                    setCols(Math.min(6, cols + 1))
                    break
                  }

                  case 'less-cols': {
                    setCols(Math.max(1, cols - 1))
                    break
                  }

                  case 'rows':
                  case 'cols': {
                    break
                  }

                  default: {
                    break
                  }
                }
              }}
            />
          </>
        )
      }

      case 'face': {
        return (
          <>
            <Text dimColor>Select face and fill options:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: 'Face Up',
                  value: 'up',
                  indicator: faceUp ? <Text color="green">↑</Text> : undefined,
                  hotkey: 'u',
                },
                {
                  label: 'Face Down',
                  value: 'down',
                  indicator: faceUp ? undefined : <Text color="red">↓</Text>,
                  hotkey: 'd',
                },
                {
                  label: 'Fill Empty',
                  value: 'fill',
                  indicator: fillEmpty ? (
                    <Text color="yellow">✓</Text>
                  ) : undefined,
                  hotkey: 'f',
                },
                {
                  label: 'Next (Spacing)',
                  value: 'next',
                  indicator: <Text color="yellow">→</Text>,
                  hotkey: 'n',
                },
                {
                  label: 'Back (Size)',
                  value: 'back',
                  indicator: <Text color="yellow">←</Text>,
                  hotkey: 'b',
                },
              ]}
              onSelect={(item) => {
                switch (item.value) {
                  case 'back': {
                    setCurrentSelect('size')
                    break
                  }

                  case 'next': {
                    setCurrentSelect('spacing')
                    break
                  }

                  case 'up':
                  case 'down': {
                    setFaceUp(item.value === 'up')
                    break
                  }

                  case 'fill': {
                    setFillEmpty(!fillEmpty)
                    break
                  }

                  default: {
                    break
                  }
                }
              }}
            />
          </>
        )
      }

      case 'spacing': {
        return (
          <>
            <Text dimColor>Adjust grid spacing:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: 'Row Gap -',
                  value: 'row-less',
                  indicator: <Text color="cyan">↑</Text>,
                  hotkey: 'u',
                },
                {
                  label: `Row: ${rowGap}`,
                  value: 'row',
                  indicator: <Text color="cyan">↕</Text>,
                },
                {
                  label: 'Row Gap +',
                  value: 'row-more',
                  indicator: <Text color="cyan">↓</Text>,
                  hotkey: 'd',
                },
                {
                  label: 'Col Gap -',
                  value: 'col-less',
                  indicator: <Text color="cyan">←</Text>,
                  hotkey: 'l',
                },
                {
                  label: `Col: ${colGap}`,
                  value: 'col',
                  indicator: <Text color="cyan">↔</Text>,
                },
                {
                  label: 'Col Gap +',
                  value: 'col-more',
                  indicator: <Text color="cyan">→</Text>,
                  hotkey: 'r',
                },
                {
                  label: 'Next (Alignment)',
                  value: 'next',
                  indicator: <Text color="yellow">→</Text>,
                  hotkey: 'n',
                },
                {
                  label: 'Back (Face)',
                  value: 'back',
                  indicator: <Text color="yellow">←</Text>,
                  hotkey: 'b',
                },
              ]}
              onSelect={(item) => {
                switch (item.value) {
                  case 'back': {
                    setCurrentSelect('face')
                    break
                  }

                  case 'next': {
                    setCurrentSelect('alignment')
                    break
                  }

                  case 'row-less': {
                    setRowGap(Math.max(0, rowGap - 1))
                    break
                  }

                  case 'row-more': {
                    setRowGap(Math.min(5, rowGap + 1))
                    break
                  }

                  case 'col-less': {
                    setColGap(Math.max(0, colGap - 1))
                    break
                  }

                  case 'col-more': {
                    setColGap(Math.min(5, colGap + 1))
                    break
                  }

                  case 'row':
                  case 'col': {
                    break
                  }

                  default: {
                    break
                  }
                }
              }}
            />
          </>
        )
      }

      case 'alignment': {
        return (
          <>
            <Text dimColor>Select grid alignment:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: 'Left',
                  value: 'left',
                  indicator:
                    horizontalAlign === 'left' ? (
                      <Text color="yellow">✓</Text>
                    ) : undefined,
                  hotkey: 'l',
                },
                {
                  label: 'Center',
                  value: 'center',
                  indicator:
                    horizontalAlign === 'center' ? (
                      <Text color="yellow">✓</Text>
                    ) : undefined,
                  hotkey: 'c',
                },
                {
                  label: 'Right',
                  value: 'right',
                  indicator:
                    horizontalAlign === 'right' ? (
                      <Text color="yellow">✓</Text>
                    ) : undefined,
                  hotkey: 'r',
                },
                {
                  label: 'Top',
                  value: 'top',
                  indicator:
                    verticalAlign === 'top' ? (
                      <Text color="yellow">✓</Text>
                    ) : undefined,
                  hotkey: 't',
                },
                {
                  label: 'Middle',
                  value: 'middle',
                  indicator:
                    verticalAlign === 'middle' ? (
                      <Text color="yellow">✓</Text>
                    ) : undefined,
                  hotkey: 'm',
                },
                {
                  label: 'Bottom',
                  value: 'bottom',
                  indicator:
                    verticalAlign === 'bottom' ? (
                      <Text color="yellow">✓</Text>
                    ) : undefined,
                  hotkey: 'b',
                },
                {
                  label: 'Back (Spacing)',
                  value: 'back',
                  indicator: <Text color="yellow">←</Text>,
                  hotkey: 'k',
                },
              ]}
              onSelect={(item) => {
                switch (item.value) {
                  case 'back': {
                    setCurrentSelect('spacing')
                    break
                  }

                  case 'left':
                  case 'center':
                  case 'right': {
                    setHorizontalAlign(item.value)
                    break
                  }

                  case 'top':
                  case 'middle':
                  case 'bottom': {
                    setVerticalAlign(item.value)
                    break
                  }

                  default: {
                    break
                  }
                }
              }}
            />
          </>
        )
      }

      case 'style': {
        return null
      }
    }
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box gap={2}>
        <Text>Grid Preview:</Text>
        <Text dimColor>
          {variant} - {rows}x{cols} - {faceUp ? 'face up' : 'face down'} -{' '}
          {fillEmpty ? 'fill' : 'empty'} - gap: {rowGap}x{colGap} - align:{' '}
          {horizontalAlign}/{verticalAlign}
        </Text>
      </Box>
      <Box marginY={1}>
        <CardGrid
          rows={rows}
          cols={cols}
          cards={sampleCards}
          variant={variant}
          isFaceUp={faceUp}
          fillEmpty={fillEmpty}
          spacing={{
            row: rowGap,
            col: colGap,
            margin: 1,
          }}
          alignment={{
            horizontal: horizontalAlign,
            vertical: verticalAlign,
          }}
        />
      </Box>
      {renderSelector()}
    </Box>
  )
}
