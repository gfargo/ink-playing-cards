import { Box, Text, useInput } from 'ink'
import React, { useState } from 'react'
import { UnicodeCard } from '../../components/UnicodeCard/index.js'
import type { TCardValue, TSuit } from '../../types/index.js'

type Props = {
  readonly goBack: () => void
}

const SUITS: TSuit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const VALUES: TCardValue[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'JOKER',
]

export function UnicodeCardView({ goBack }: Props) {
  const [suitIndex, setSuitIndex] = useState(0)
  const [valueIndex, setValueIndex] = useState(0)
  const [faceUp, setFaceUp] = useState(true)
  const [selected, setSelected] = useState(false)
  const [dimmed, setDimmed] = useState(false)
  const [bordered, setBordered] = useState(false)
  const [rounded, setRounded] = useState(true)
  const [size, setSize] = useState(1)

  useInput((input, key) => {
    if (input === 'q') {
      goBack()
    } else if (key.leftArrow) {
      setSuitIndex((prev) => (prev > 0 ? prev - 1 : SUITS.length - 1))
    } else if (key.rightArrow) {
      setSuitIndex((prev) => (prev + 1) % SUITS.length)
    } else if (key.upArrow) {
      setValueIndex((prev) => (prev > 0 ? prev - 1 : VALUES.length - 1))
    } else if (key.downArrow) {
      setValueIndex((prev) => (prev + 1) % VALUES.length)
    } else
      switch (input) {
        case 'f': {
          setFaceUp((prev) => !prev)

          break
        }

        case 's': {
          setSelected((prev) => !prev)

          break
        }

        case 'd': {
          setDimmed((prev) => !prev)

          break
        }

        case 'b': {
          setBordered((prev) => !prev)

          break
        }

        case 'r': {
          setRounded((prev) => !prev)

          break
        }

        case '+': {
          setSize((prev) => Math.min(prev + 1, 5))

          break
        }

        case '-': {
          setSize((prev) => Math.max(prev - 1, 1))

          break
        }

        default: {
          break
        }
      }
  })

  return (
    <Box flexDirection="column" gap={1}>
      <Text>Unicode Card Demo</Text>
      <Box flexDirection="column">
        <UnicodeCard
          suit={SUITS[suitIndex]!}
          value={VALUES[valueIndex]!}
          faceUp={faceUp}
          selected={selected}
          dimmed={dimmed}
          bordered={bordered}
          rounded={rounded}
          size={size}
        />
      </Box>
      <Box flexDirection="column" gap={1}>
        <Text>Controls:</Text>
        <Text>← → : Change suit ({SUITS[suitIndex]})</Text>
        <Text>↑ ↓ : Change value ({VALUES[valueIndex]})</Text>
        <Text>f : Toggle face up ({faceUp ? 'up' : 'down'})</Text>
        <Text>s : Toggle selected ({selected ? 'yes' : 'no'})</Text>
        <Text>d : Toggle dimmed ({dimmed ? 'yes' : 'no'})</Text>
        <Text>b : Toggle border ({bordered ? 'yes' : 'no'})</Text>
        <Text>r : Toggle rounded ({rounded ? 'yes' : 'no'})</Text>
        <Text>+ - : Adjust size ({size})</Text>
        <Text>q : Back to menu</Text>
      </Box>
    </Box>
  )
}
