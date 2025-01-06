import { Box, Text } from 'ink'
import React from 'react'
import { CustomCard } from '../../components/CustomCard/index.js'
import { EnhancedSelectInput } from '../utils/EnhancedSelectInput.js'

type TSymbol = {
  char: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  color: string
}

const sampleAsciiArt = `  /\\  /\\
 /  \\/  \\
/        \\
\\        /
 \\  /\\  /
  \\/  \\/`

export function CustomCardView({ goBack }: { readonly goBack?: () => void }) {
  const [size, setSize] = React.useState<'small' | 'medium' | 'large'>('medium')
  const [faceUp, setFaceUp] = React.useState(true)
  // Const [title, setTitle] = React.useState('Sample Card')
  // const [description, setDescription] = React.useState(
  //   'This is a custom card with a description that might wrap.'
  // )
  const title = 'Sample Card'
  const description =
    'This is a custom card with a description that might wrap.'
  const [borderColor, setBorderColor] = React.useState('white')
  const [textColor, setTextColor] = React.useState('white')
  const [symbols, setSymbols] = React.useState<TSymbol[]>([
    { char: '★', position: 'top-left', color: 'yellow' },
    { char: '♦', position: 'top-right', color: 'red' },
    { char: '♣', position: 'bottom-left', color: 'white' },
    { char: '♥', position: 'bottom-right', color: 'red' },
  ])
  const [currentSelect, setCurrentSelect] = React.useState<
    | 'size'
    | 'face'
    | 'title'
    | 'description'
    | 'border-color'
    | 'text-color'
    | 'symbols'
  >('size')

  const renderSelector = () => {
    switch (currentSelect) {
      case 'size': {
        return (
          <>
            <Text dimColor>Select card size:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: 'Small',
                  value: 'small',
                  indicator: <Text color="cyan">▫</Text>,
                  hotkey: 's',
                },
                {
                  label: 'Medium',
                  value: 'medium',
                  indicator: <Text color="cyan">▪</Text>,
                  hotkey: 'm',
                },
                {
                  label: 'Large',
                  value: 'large',
                  indicator: <Text color="cyan">■</Text>,
                  hotkey: 'l',
                },
                {
                  label: 'Next (Face)',
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
                  setCurrentSelect('face')
                } else {
                  setSize(item.value as 'small' | 'medium' | 'large')
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
                  label: 'Next (Colors)',
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
                if (item.value === 'back') {
                  setCurrentSelect('size')
                } else if (item.value === 'next') {
                  setCurrentSelect('border-color')
                } else {
                  setFaceUp(item.value === 'up')
                }
              }}
            />
          </>
        )
      }

      case 'border-color': {
        return (
          <>
            <Text dimColor>Select border color:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: 'White',
                  value: 'white',
                  indicator: <Text color="white">■</Text>,
                  hotkey: 'w',
                },
                {
                  label: 'Red',
                  value: 'red',
                  indicator: <Text color="red">■</Text>,
                  hotkey: 'r',
                },
                {
                  label: 'Green',
                  value: 'green',
                  indicator: <Text color="green">■</Text>,
                  hotkey: 'g',
                },
                {
                  label: 'Yellow',
                  value: 'yellow',
                  indicator: <Text color="yellow">■</Text>,
                  hotkey: 'y',
                },
                {
                  label: 'Blue',
                  value: 'blue',
                  indicator: <Text color="blue">■</Text>,
                  hotkey: 'b',
                },
                {
                  label: 'Next (Text Color)',
                  value: 'next',
                  indicator: <Text color="yellow">→</Text>,
                  hotkey: 'n',
                },
                {
                  label: 'Back (Face)',
                  value: 'back',
                  indicator: <Text color="yellow">←</Text>,
                  hotkey: 'k',
                },
              ]}
              onSelect={(item) => {
                if (item.value === 'back') {
                  setCurrentSelect('face')
                } else if (item.value === 'next') {
                  setCurrentSelect('text-color')
                } else {
                  setBorderColor(item.value)
                }
              }}
            />
          </>
        )
      }

      case 'text-color': {
        return (
          <>
            <Text dimColor>Select text color:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: 'White',
                  value: 'white',
                  indicator: <Text color="white">■</Text>,
                  hotkey: 'w',
                },
                {
                  label: 'Red',
                  value: 'red',
                  indicator: <Text color="red">■</Text>,
                  hotkey: 'r',
                },
                {
                  label: 'Green',
                  value: 'green',
                  indicator: <Text color="green">■</Text>,
                  hotkey: 'g',
                },
                {
                  label: 'Yellow',
                  value: 'yellow',
                  indicator: <Text color="yellow">■</Text>,
                  hotkey: 'y',
                },
                {
                  label: 'Blue',
                  value: 'blue',
                  indicator: <Text color="blue">■</Text>,
                  hotkey: 'b',
                },
                {
                  label: 'Next (Symbols)',
                  value: 'next',
                  indicator: <Text color="yellow">→</Text>,
                  hotkey: 'n',
                },
                {
                  label: 'Back (Border)',
                  value: 'back',
                  indicator: <Text color="yellow">←</Text>,
                  hotkey: 'k',
                },
              ]}
              onSelect={(item) => {
                if (item.value === 'back') {
                  setCurrentSelect('border-color')
                } else if (item.value === 'next') {
                  setCurrentSelect('symbols')
                } else {
                  setTextColor(item.value)
                }
              }}
            />
          </>
        )
      }

      case 'symbols': {
        return (
          <>
            <Text dimColor>Toggle corner symbols:</Text>
            <EnhancedSelectInput
              orientation="horizontal"
              items={[
                {
                  label: 'Top Left ★',
                  value: 'top-left',
                  indicator: symbols.some((s) => s.position === 'top-left') ? (
                    <Text color="yellow">✓</Text>
                  ) : undefined,
                  hotkey: 't',
                },
                {
                  label: 'Top Right ♦',
                  value: 'top-right',
                  indicator: symbols.some((s) => s.position === 'top-right') ? (
                    <Text color="yellow">✓</Text>
                  ) : undefined,
                  hotkey: 'r',
                },
                {
                  label: 'Bottom Left ♣',
                  value: 'bottom-left',
                  indicator: symbols.some(
                    (s) => s.position === 'bottom-left'
                  ) ? (
                    <Text color="yellow">✓</Text>
                  ) : undefined,
                  hotkey: 'l',
                },
                {
                  label: 'Bottom Right ♥',
                  value: 'bottom-right',
                  indicator: symbols.some(
                    (s) => s.position === 'bottom-right'
                  ) ? (
                    <Text color="yellow">✓</Text>
                  ) : undefined,
                  hotkey: 'b',
                },
                {
                  label: 'Back (Text)',
                  value: 'back',
                  indicator: <Text color="yellow">←</Text>,
                  hotkey: 'k',
                },
              ]}
              onSelect={(item) => {
                if (item.value === 'back') {
                  setCurrentSelect('text-color')
                } else {
                  const position = item.value as TSymbol['position']
                  setSymbols((prev) => {
                    const exists = prev.some((s) => s.position === position)
                    if (exists) {
                      return prev.filter((s) => s.position !== position)
                    }

                    const symbolMap = {
                      'top-left': { char: '★', color: 'yellow' },
                      'top-right': { char: '♦', color: 'red' },
                      'bottom-left': { char: '♣', color: 'white' },
                      'bottom-right': { char: '♥', color: 'red' },
                    }
                    return [
                      ...prev,
                      {
                        position,
                        ...symbolMap[position],
                      },
                    ]
                  })
                }
              }}
            />
          </>
        )
      }

      case 'title': {
        return (
          <>
            <Text dimColor>Edit title:</Text>
            <Text>Title editing not implemented yet</Text>
          </>
        )
      }

      case 'description': {
        return (
          <>
            <Text dimColor>Edit description:</Text>
            <Text>Description editing not implemented yet</Text>
          </>
        )
      }
    }

    return null
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box gap={2}>
        <Text>CustomCard Preview:</Text>
        <Text dimColor>
          {size} - {faceUp ? 'face up' : 'face down'} - border: {borderColor} -
          text: {textColor}
        </Text>
      </Box>
      <Box marginY={1}>
        <CustomCard
          size={size}
          faceUp={faceUp}
          title={title}
          description={description}
          borderColor={borderColor}
          textColor={textColor}
          symbols={symbols}
          asciiArt={sampleAsciiArt}
        />
      </Box>
      {renderSelector()}
    </Box>
  )
}
