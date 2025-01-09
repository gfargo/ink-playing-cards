import { Box, Text } from 'ink'
import React from 'react'
import Card from '../../components/Card/index.js'
import {
  type AsciiTheme,
  type TCardValue,
  type TSuit,
} from '../../types/index.js'
import { EnhancedSelectInput } from '../utils/EnhancedSelectInput.js'

type CardVariant = 'simple' | 'ascii' | 'minimal'

export function CardView({ goBack }: { readonly goBack?: () => void }) {
  const [variant, setVariant] = React.useState<CardVariant>('simple')
  const [suit, setSuit] = React.useState<TSuit>('spades')
  const [value, setValue] = React.useState<TCardValue>('Q')
  const [faceUp, setFaceUp] = React.useState(true)
  const [selected, setSelected] = React.useState(false)
  const [rounded, setRounded] = React.useState(true)
  const [theme, setTheme] = React.useState<AsciiTheme>('original')
  const [currentSelect, setCurrentSelect] = React.useState<
    'variant' | 'theme' | 'suit' | 'value' | 'face' | 'style'
  >('variant')

  // Track if we're in ASCII mode and came through theme selection
  const [isAsciiThemeFlow, setIsAsciiThemeFlow] = React.useState(false)

  const renderSelector = () => {
    switch (currentSelect) {
      case 'variant': {
        return (
          <>
            <Text dimColor>Select card variant:</Text>
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
                  label: 'Next (Suit)',
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
                  if (variant === 'ascii') {
                    setCurrentSelect('theme')
                    setIsAsciiThemeFlow(true)
                  } else {
                    setCurrentSelect('suit')
                    setIsAsciiThemeFlow(false)
                  }
                } else {
                  setVariant(item.value as CardVariant)
                }
              }}
            />
          </>
        )
      }

      case 'theme': {
        return (
          <>
            <Text dimColor>Select ASCII theme:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: 'Original',
                  value: 'original',
                  indicator: <Text color="cyan">⌱</Text>,
                  hotkey: 'o',
                },
                {
                  label: 'Geometric',
                  value: 'geometric',
                  indicator: <Text color="cyan">◇</Text>,
                  hotkey: 'g',
                },
                {
                  label: 'Animal',
                  value: 'animal',
                  indicator: <Text color="cyan">◉</Text>,
                  hotkey: 'a',
                },
                {
                  label: 'Robot',
                  value: 'robot',
                  indicator: <Text color="cyan">⚡</Text>,
                  hotkey: 'r',
                },
                {
                  label: 'Pixel',
                  value: 'pixel',
                  indicator: <Text color="cyan">█</Text>,
                  hotkey: 'p',
                },
                {
                  label: 'Medieval',
                  value: 'medieval',
                  indicator: <Text color="cyan">⚔</Text>,
                  hotkey: 'm',
                },
                {
                  label: 'Next (Suit)',
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
                  setIsAsciiThemeFlow(false)
                } else if (item.value === 'next') {
                  setCurrentSelect('suit')
                } else {
                  setTheme(item.value as AsciiTheme)
                }
              }}
            />
          </>
        )
      }

      case 'suit': {
        return (
          <>
            <Text dimColor>Select card suit:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: 'Spades',
                  value: 'spades',
                  indicator: <Text color="white">♠</Text>,
                  hotkey: 's',
                },
                {
                  label: 'Hearts',
                  value: 'hearts',
                  indicator: <Text color="red">♥</Text>,
                  hotkey: 'h',
                },
                {
                  label: 'Diamonds',
                  value: 'diamonds',
                  indicator: <Text color="red">♦</Text>,
                  hotkey: 'd',
                },
                {
                  label: 'Clubs',
                  value: 'clubs',
                  indicator: <Text color="white">♣</Text>,
                  hotkey: 'c',
                },
                {
                  label: 'Next (Value)',
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
                  // If we're in ASCII theme flow, go back to theme selection
                  if (isAsciiThemeFlow) {
                    setCurrentSelect('theme')
                  } else {
                    setCurrentSelect('variant')
                  }
                } else if (item.value === 'next') {
                  setCurrentSelect('value')
                } else {
                  setSuit(item.value as TSuit)
                }
              }}
            />
          </>
        )
      }

      case 'value': {
        return (
          <>
            <Text dimColor>Select card value:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                ...[
                  ['A', 'a'],
                  ['2', '2'],
                  ['3', '3'],
                  ['4', '4'],
                  ['5', '5'],
                  ['6', '6'],
                  ['7', '7'],
                  ['8', '8'],
                  ['9', '9'],
                  ['10', '0'],
                  ['J', 'j'],
                  ['Q', 'q'],
                  ['K', 'k'],
                ].map(([val, key]) => ({
                  label: val!,
                  value: val!,
                  indicator: <Text color="cyan">⌱</Text>,
                  hotkey: key!,
                })),
                {
                  label: 'Next (Face)',
                  value: 'next',
                  indicator: <Text color="yellow">→</Text>,
                  hotkey: 'n',
                },
                {
                  label: 'Back (Suit)',
                  value: 'back',
                  indicator: <Text color="yellow">←</Text>,
                  hotkey: 'b',
                },
              ]}
              onSelect={(item) => {
                if (item.value === 'back') {
                  setCurrentSelect('suit')
                } else if (item.value === 'next') {
                  setCurrentSelect('face')
                } else {
                  setValue(item.value as TCardValue)
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
                  label: 'Next (Style)',
                  value: 'next',
                  indicator: <Text color="yellow">→</Text>,
                  hotkey: 'n',
                },
                {
                  label: 'Back (Value)',
                  value: 'back',
                  indicator: <Text color="yellow">←</Text>,
                  hotkey: 'b',
                },
              ]}
              onSelect={(item) => {
                if (item.value === 'back') {
                  setCurrentSelect('value')
                } else if (item.value === 'next') {
                  setCurrentSelect('style')
                } else {
                  setFaceUp(item.value === 'up')
                }
              }}
            />
          </>
        )
      }

      case 'style': {
        return (
          <>
            <Text dimColor>Select card style:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: 'Selected',
                  value: 'selected',
                  indicator: selected ? (
                    <Text color="yellow">✓</Text>
                  ) : undefined,
                  hotkey: 's',
                },
                {
                  label: 'Rounded',
                  value: 'rounded',
                  indicator: rounded ? (
                    <Text color="yellow">✓</Text>
                  ) : undefined,
                  hotkey: 'r',
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

                  case 'selected': {
                    setSelected(!selected)

                    break
                  }

                  case 'rounded': {
                    setRounded(!rounded)
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
    }
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box gap={2}>
        <Text>Card Preview:</Text>
        <Text dimColor>
          {variant}
          {variant === 'ascii' ? ` (${theme})` : ''} - {suit} - {value} -{' '}
          {faceUp ? 'face up' : 'face down'} -{' '}
          {selected ? 'selected' : 'not selected'} -{' '}
          {rounded ? 'rounded' : 'square'}
        </Text>
      </Box>
      <Box marginY={1}>
        <Card
          variant={variant}
          suit={suit}
          value={value}
          faceUp={faceUp}
          selected={selected}
          rounded={rounded}
          theme={theme}
        />
      </Box>
      {renderSelector()}
    </Box>
  )
}
