import { Box, Text } from 'ink'
import React from 'react'
import { CustomCard } from '../../components/CustomCard/index.js'
import { EnhancedSelectInput } from '../utils/EnhancedSelectInput.js'

export type TDemo = 'mtg' | 'uno' | 'sizes' | 'back' | 'freeform'

export function CustomCardView({ goBack }: { readonly goBack?: () => void }) {
  const [demo, setDemo] = React.useState<TDemo>('mtg')
  const [faceUp, setFaceUp] = React.useState(true)

  const renderDemo = () => {
    switch (demo) {
      case 'mtg': {
        return (
          <Box gap={2}>
            <CustomCard
              id="mtg-bolt"
              size="large"
              title="Lightning Bolt"
              cost="{R}"
              typeLine="Instant"
              description="Deal 3 damage to any target."
              footerRight="C"
              borderColor="red"
              textColor="white"
              faceUp={faceUp}
              back={{ art: '~ ~ ~ ~\n ~ ~ ~\n~ ~ ~ ~', color: 'magenta' }}
            />
            <CustomCard
              id="mtg-dragon"
              size="large"
              title="Shivan Dragon"
              cost="{4}{R}{R}"
              asciiArt={`    /\\_/\\\n   ( o.o )\n    > ^ <`}
              typeLine="Creature — Dragon"
              description="Flying. {R}: +1/+0 until end of turn."
              footerLeft="5/5"
              footerRight="R"
              borderColor="red"
              textColor="white"
              faceUp={faceUp}
              back={{ art: '~ ~ ~ ~\n ~ ~ ~\n~ ~ ~ ~', color: 'magenta' }}
            />
          </Box>
        )
      }

      case 'uno': {
        return (
          <Box gap={1}>
            <CustomCard
              id="uno-red7"
              size="small"
              title="7"
              description="RED"
              borderColor="red"
              textColor="red"
              faceUp={faceUp}
              back={{ label: 'UNO', color: 'red' }}
            />
            <CustomCard
              id="uno-blue3"
              size="small"
              title="3"
              description="BLUE"
              borderColor="blue"
              textColor="blue"
              faceUp={faceUp}
              back={{ label: 'UNO', color: 'red' }}
            />
            <CustomCard
              id="uno-skip"
              size="small"
              title="Skip"
              description="GREEN"
              symbols={[
                { char: '⊘', position: 'top-right', color: 'green' },
                { char: '⊘', position: 'bottom-left', color: 'green' },
              ]}
              borderColor="green"
              textColor="green"
              faceUp={faceUp}
              back={{ label: 'UNO', color: 'red' }}
            />
            <CustomCard
              id="uno-wild"
              size="small"
              title="Wild"
              description="Pick a color"
              borderColor="yellow"
              textColor="yellow"
              faceUp={faceUp}
              back={{ label: 'UNO', color: 'red' }}
            />
          </Box>
        )
      }

      case 'sizes': {
        return (
          <Box gap={1} alignItems="flex-end">
            {(['micro', 'mini', 'small', 'medium', 'large'] as const).map(
              (s) => (
                <CustomCard
                  key={s}
                  id={`size-${s}`}
                  size={s}
                  title={s}
                  faceUp={faceUp}
                />
              )
            )}
          </Box>
        )
      }

      case 'back': {
        return (
          <Box gap={2}>
            <Box flexDirection="column" alignItems="center">
              <Text dimColor>Default</Text>
              <CustomCard id="back-default" size="small" faceUp={false} />
            </Box>
            <Box flexDirection="column" alignItems="center">
              <Text dimColor>Symbol</Text>
              <CustomCard
                id="back-symbol"
                size="small"
                faceUp={false}
                back={{ symbol: '🂠', color: 'blue' }}
              />
            </Box>
            <Box flexDirection="column" alignItems="center">
              <Text dimColor>Label</Text>
              <CustomCard
                id="back-label"
                size="small"
                faceUp={false}
                back={{ label: 'MTG', color: 'magenta' }}
              />
            </Box>
            <Box flexDirection="column" alignItems="center">
              <Text dimColor>Art</Text>
              <CustomCard
                id="back-art"
                size="small"
                faceUp={false}
                back={{
                  art: '╔═══╗\n║ ♠ ║\n╚═══╝',
                  color: 'cyan',
                }}
              />
            </Box>
          </Box>
        )
      }

      case 'freeform': {
        return (
          <Box gap={2}>
            <CustomCard
              id="freeform-1"
              size="medium"
              content={
                <Box
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <Text bold color="cyan">
                    ★ CUSTOM ★
                  </Text>
                  <Text color="yellow">Any ReactNode</Text>
                  <Text color="green">goes here</Text>
                </Box>
              }
              borderColor="cyan"
            />
          </Box>
        )
      }

      // No default
    }
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box gap={2}>
        <Text>CustomCard Demo:</Text>
        <Text dimColor>
          {demo} — {faceUp ? 'face up' : 'face down'}
        </Text>
      </Box>
      <Box marginY={1}>{renderDemo()}</Box>
      <EnhancedSelectInput
        orientation="horizontal"
        items={[
          { label: 'MTG', value: 'mtg', hotkey: 'm' },
          { label: 'Uno', value: 'uno', hotkey: 'u' },
          { label: 'Sizes', value: 'sizes', hotkey: 's' },
          { label: 'Backs', value: 'back', hotkey: 'k' },
          { label: 'Freeform', value: 'freeform', hotkey: 'f' },
          {
            label: faceUp ? 'Flip Down' : 'Flip Up',
            value: 'flip',
            hotkey: 'p',
          },
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
          } else if (item.value === 'flip') {
            setFaceUp((prev) => !prev)
          } else {
            setDemo(item.value as TDemo)
          }
        }}
      />
    </Box>
  )
}
