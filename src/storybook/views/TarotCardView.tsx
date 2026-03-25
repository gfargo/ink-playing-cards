import { Box, Text } from 'ink'
import React from 'react'
import { TarotCard } from '../../components/TarotCard/index.js'
import { MAJOR_ARCANA } from '../../components/TarotCard/constants.js'
import { EnhancedSelectInput } from '../utils/EnhancedSelectInput.js'

export type TTarotDemo =
  | 'major'
  | 'minor-pips'
  | 'minor-court'
  | 'reversed'
  | 'suits'

export function TarotCardView({ goBack }: { readonly goBack?: () => void }) {
  const [demo, setDemo] = React.useState<TTarotDemo>('major')
  const [faceUp, setFaceUp] = React.useState(true)
  const [majorPage, setMajorPage] = React.useState(0)

  const renderDemo = () => {
    switch (demo) {
      case 'major': {
        // Show 4 Major Arcana at a time, paginated
        const start = majorPage * 4
        const cards = MAJOR_ARCANA.slice(start, start + 4)
        return (
          <Box flexDirection="column" gap={1}>
            <Text dimColor>
              Major Arcana {start}–{Math.min(start + 3, 21)} of 0–21 (n/p to
              page)
            </Text>
            <Box gap={1}>
              {cards.map((entry, i) => (
                <TarotCard
                  key={entry.name}
                  id={`major-${start + i}`}
                  arcana="major"
                  majorIndex={(start + i) as 0}
                  faceUp={faceUp}
                />
              ))}
            </Box>
          </Box>
        )
      }

      case 'minor-pips': {
        return (
          <Box gap={1}>
            <TarotCard
              id="ace-wands"
              arcana="minor"
              suit="wands"
              value="Ace"
              faceUp={faceUp}
            />
            <TarotCard
              id="5-cups"
              arcana="minor"
              suit="cups"
              value="5"
              faceUp={faceUp}
            />
            <TarotCard
              id="7-swords"
              arcana="minor"
              suit="swords"
              value="7"
              faceUp={faceUp}
            />
            <TarotCard
              id="10-pent"
              arcana="minor"
              suit="pentacles"
              value="10"
              faceUp={faceUp}
            />
          </Box>
        )
      }

      case 'minor-court': {
        return (
          <Box gap={1}>
            <TarotCard
              id="page-wands"
              arcana="minor"
              suit="wands"
              value="Page"
              faceUp={faceUp}
            />
            <TarotCard
              id="knight-cups"
              arcana="minor"
              suit="cups"
              value="Knight"
              faceUp={faceUp}
            />
            <TarotCard
              id="queen-swords"
              arcana="minor"
              suit="swords"
              value="Queen"
              faceUp={faceUp}
            />
            <TarotCard
              id="king-pent"
              arcana="minor"
              suit="pentacles"
              value="King"
              faceUp={faceUp}
            />
          </Box>
        )
      }

      case 'reversed': {
        return (
          <Box gap={1}>
            <TarotCard
              reversed
              id="fool-rev"
              arcana="major"
              majorIndex={0}
              faceUp={faceUp}
            />
            <TarotCard
              reversed
              id="tower-rev"
              arcana="major"
              majorIndex={16}
              faceUp={faceUp}
            />
            <TarotCard
              reversed
              id="3-cups-rev"
              arcana="minor"
              suit="cups"
              value="3"
              faceUp={faceUp}
            />
          </Box>
        )
      }

      case 'suits': {
        return (
          <Box gap={1}>
            {(['wands', 'cups', 'swords', 'pentacles'] as const).map((s) => (
              <TarotCard
                key={s}
                id={`ace-${s}`}
                arcana="minor"
                suit={s}
                value="Ace"
                faceUp={faceUp}
              />
            ))}
          </Box>
        )
      }

      // No default
    }
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box gap={2}>
        <Text>TarotCard Demo:</Text>
        <Text dimColor>
          {demo} — {faceUp ? 'face up' : 'face down'}
        </Text>
      </Box>
      <Box marginY={1}>{renderDemo()}</Box>
      <EnhancedSelectInput
        orientation="horizontal"
        items={[
          { label: 'Major', value: 'major', hotkey: 'a' },
          { label: 'Pips', value: 'minor-pips', hotkey: 'i' },
          { label: 'Court', value: 'minor-court', hotkey: 'c' },
          { label: 'Reversed', value: 'reversed', hotkey: 'r' },
          { label: 'Suits', value: 'suits', hotkey: 's' },
          {
            label: faceUp ? 'Flip Down' : 'Flip Up',
            value: 'flip',
            hotkey: 'f',
          },
          ...(demo === 'major'
            ? [
                { label: 'Prev', value: 'prev-page', hotkey: 'p' },
                { label: 'Next', value: 'next-page', hotkey: 'n' },
              ]
            : []),
          {
            label: 'Back',
            value: 'go-back',
            indicator: <Text color="red">←</Text>,
            hotkey: 'b',
          },
        ]}
        onSelect={(item) => {
          if (item.value === 'go-back' && goBack) {
            goBack()
          } else
            switch (item.value) {
              case 'flip': {
                setFaceUp((prev) => !prev)

                break
              }

              case 'next-page': {
                setMajorPage((prev) => Math.min(prev + 1, 5))

                break
              }

              case 'prev-page': {
                setMajorPage((prev) => Math.max(prev - 1, 0))

                break
              }

              default: {
                setDemo(item.value as TTarotDemo)
              }
            }
        }}
      />
    </Box>
  )
}
