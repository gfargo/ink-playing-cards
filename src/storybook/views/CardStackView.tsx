import { Box, Text } from 'ink'
import React from 'react'
import { CardStack } from '../../components/CardStack/index.js'
import { type TCard } from '../../types/index.js'
import { EnhancedSelectInput } from '../utils/EnhancedSelectInput.js'

// Sample cards for demonstration
const sampleCards: TCard[] = [
  { id: '1', suit: 'hearts', value: 'A' },
  { id: '2', suit: 'spades', value: 'K' },
  { id: '3', suit: 'diamonds', value: 'Q' },
  { id: '4', suit: 'clubs', value: 'J' },
  { id: '5', suit: 'hearts', value: '10' },
]

type CardStackVariant = 'simple' | 'ascii' | 'minimal' | 'mini' | 'micro'

export function CardStackView({ goBack }: { goBack?: () => void }) {
  const [variant, setVariant] = React.useState<CardStackVariant>('simple')
  const [direction, setDirection] = React.useState<'vertical' | 'horizontal'>('horizontal')
  const [faceUp, setFaceUp] = React.useState(true)
  const [maxDisplay, setMaxDisplay] = React.useState(3)
  const [currentSelect, setCurrentSelect] = React.useState<
    'variant' | 'direction' | 'face' | 'display'
  >('variant')

  const renderSelector = () => {
    switch (currentSelect) {
      case 'variant': {
        return (
          <>
            <Text dimColor>Select stack variant:</Text>
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
                  label: 'ASCII',
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
                  label: 'Next (Direction)',
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
                if (item.value === 'back') {
                  goBack && goBack()
                } else if (item.value === 'next') {
                  setCurrentSelect('direction')
                } else {
                  setVariant(item.value as CardStackVariant)
                }
              }}
            />
          </>
        )
      }

      case 'direction': {
        return (
          <>
            <Text dimColor>Select stack direction:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: 'Horizontal',
                  value: 'horizontal',
                  indicator: <Text color="cyan">↔</Text>,
                  hotkey: 'h',
                },
                {
                  label: 'Vertical',
                  value: 'vertical',
                  indicator: <Text color="cyan">↕</Text>,
                  hotkey: 'v',
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
                if (item.value === 'back') {
                  setCurrentSelect('variant')
                } else if (item.value === 'next') {
                  setCurrentSelect('face')
                } else {
                  setDirection(item.value as 'vertical' | 'horizontal')
                }
              }}
            />
          </>
        )
      }

      case 'face': {
        return (
          <>
            <Text dimColor>Select face orientation:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: 'Face Up',
                  value: 'up',
                  indicator: <Text color="green">↑</Text>,
                  hotkey: 'u',
                },
                {
                  label: 'Face Down',
                  value: 'down',
                  indicator: <Text color="red">↓</Text>,
                  hotkey: 'd',
                },
                {
                  label: 'Next (Display)',
                  value: 'next',
                  indicator: <Text color="yellow">→</Text>,
                  hotkey: 'n',
                },
                {
                  label: 'Back (Direction)',
                  value: 'back',
                  indicator: <Text color="yellow">←</Text>,
                  hotkey: 'b',
                },
              ]}
              onSelect={(item) => {
                if (item.value === 'back') {
                  setCurrentSelect('direction')
                } else if (item.value === 'next') {
                  setCurrentSelect('display')
                } else {
                  setFaceUp(item.value === 'up')
                }
              }}
            />
          </>
        )
      }

      case 'display': {
        return (
          <>
            <Text dimColor>Select max cards to display:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                ...[1, 2, 3, 4, 5].map((num) => ({
                  label: num.toString(),
                  value: num.toString(),
                  indicator: maxDisplay === num ? <Text color="yellow">✓</Text> : undefined,
                  hotkey: num.toString(),
                })),
                {
                  label: 'Back (Face)',
                  value: 'back',
                  indicator: <Text color="yellow">←</Text>,
                  hotkey: 'b',
                },
              ]}
              onSelect={(item) => {
                if (item.value === 'back') {
                  setCurrentSelect('face')
                } else {
                  setMaxDisplay(Number(item.value))
                }
              }}
            />
          </>
        )
      }
    }
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box gap={2}>
        <Text>CardStack Preview:</Text>
        <Text dimColor>
          {variant} - {direction} - {faceUp ? 'face up' : 'face down'} - max:{' '}
          {maxDisplay}
        </Text>
      </Box>
      <Box marginY={1}>
        <CardStack
          cards={sampleCards}
          name="Demo Stack"
          variant={variant}
          stackDirection={direction}
          isFaceUp={faceUp}
          maxDisplay={maxDisplay}
        />
      </Box>
      {renderSelector()}
    </Box>
  )
}