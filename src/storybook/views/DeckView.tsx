import { Box, Text } from 'ink'
import React from 'react'
import { Deck } from '../../components/Deck/index.js'
import { DeckProvider } from '../../contexts/DeckContext.js'
import { type TCardValue, type TSuit } from '../../types/index.js'
import { EnhancedSelectInput } from '../utils/EnhancedSelectInput.js'

export function DeckView({ goBack }: { goBack?: () => void }) {
  const [variant, setVariant] = React.useState<'simple' | 'ascii' | 'minimal'>('simple')
  const [showTopCard, setShowTopCard] = React.useState(false)
  const [placeholderSuit, setPlaceholderSuit] = React.useState<TSuit>('hearts')
  const [placeholderValue, setPlaceholderValue] = React.useState<TCardValue>('A')
  const [currentSelect, setCurrentSelect] = React.useState<
    'variant' | 'top-card' | 'placeholder-suit' | 'placeholder-value'
  >('variant')

  const renderSelector = () => {
    switch (currentSelect) {
      case 'variant': {
        return (
          <>
            <Text dimColor>Select deck variant:</Text>
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
                  label: 'Next (Top Card)',
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
                  setCurrentSelect('top-card')
                } else {
                  setVariant(item.value as 'simple' | 'ascii' | 'minimal')
                }
              }}
            />
          </>
        )
      }

      case 'top-card': {
        return (
          <>
            <Text dimColor>Show top card?</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: 'Show',
                  value: 'show',
                  indicator: showTopCard ? <Text color="yellow">✓</Text> : undefined,
                  hotkey: 's',
                },
                {
                  label: 'Hide',
                  value: 'hide',
                  indicator: !showTopCard ? <Text color="yellow">✓</Text> : undefined,
                  hotkey: 'h',
                },
                {
                  label: 'Next (Placeholder Suit)',
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
                  setCurrentSelect('placeholder-suit')
                } else {
                  setShowTopCard(item.value === 'show')
                }
              }}
            />
          </>
        )
      }

      case 'placeholder-suit': {
        return (
          <>
            <Text dimColor>Select placeholder card suit:</Text>
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
                  label: 'Back (Top Card)',
                  value: 'back',
                  indicator: <Text color="yellow">←</Text>,
                  hotkey: 'b',
                },
              ]}
              onSelect={(item) => {
                if (item.value === 'back') {
                  setCurrentSelect('top-card')
                } else if (item.value === 'next') {
                  setCurrentSelect('placeholder-value')
                } else {
                  setPlaceholderSuit(item.value as TSuit)
                }
              }}
            />
          </>
        )
      }

      case 'placeholder-value': {
        return (
          <>
            <Text dimColor>Select placeholder card value:</Text>
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
                  hotkey: key,
                })),
                {
                  label: 'Back (Suit)',
                  value: 'back',
                  indicator: <Text color="yellow">←</Text>,
                  hotkey: 'b',
                },
              ]}
              onSelect={(item) => {
                if (item.value === 'back') {
                  setCurrentSelect('placeholder-suit')
                } else {
                  setPlaceholderValue(item.value as TCardValue)
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
        <Text>Deck Preview:</Text>
        <Text dimColor>
          {variant} - {showTopCard ? 'show' : 'hide'} top - placeholder:{' '}
          {placeholderSuit} {placeholderValue}
        </Text>
      </Box>
      <Box marginY={1}>
        <DeckProvider>
          <Deck
            variant={variant}
            showTopCard={showTopCard}
            placeholderCard={{
              suit: placeholderSuit,
              value: placeholderValue,
            }}
          />
        </DeckProvider>
      </Box>
      {renderSelector()}
    </Box>
  )
}