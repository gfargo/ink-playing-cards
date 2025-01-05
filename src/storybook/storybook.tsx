#!/usr/bin/env node
import { Box, Text, render, useApp } from 'ink'
import React from 'react'
import { EnhancedSelectInput } from './utils/EnhancedSelectInput.js'
import { CardStackView } from './views/CardStackView.js'
import { CardView } from './views/CardView.js'
import { CustomCardView } from './views/CustomCardView.js'
import { DeckView } from './views/DeckView.js'
import { GridView } from './views/GridView.js'
import { MiniCardView } from './views/MiniCardView.js'

type ComponentView =
  | 'card'
  | 'mini-card'
  | 'custom-card'
  | 'card-stack'
  | 'deck'
  | 'grid'
  | undefined

  
export function Storybook() {
  const { exit } = useApp()

  const [currentComponent, setCurrentComponent] =
    React.useState<ComponentView>()

  return (
    <Box
      borderDimColor
      flexDirection="column"
      gap={1}
      borderStyle="round"
      paddingX={2}
      paddingTop={1}
      paddingBottom={1}
    >
      <Box gap={2}>
        <Text color="green">Ink Playing Cards Component Storybook ♠️</Text>
        <Text dimColor>component: {currentComponent ?? 'n/a'}</Text>
      </Box>

      {!currentComponent ? (
        <>
          <Text dimColor>Select a component to view:</Text>
          <EnhancedSelectInput
            orientation="horizontal"
            items={[
              {
                label: 'Card',
                value: 'card',
                indicator: <Text color="cyan">♠</Text>,
                hotkey: 'c',
              },
              {
                label: 'Mini Card',
                value: 'mini-card',
                indicator: <Text color="cyan">♣</Text>,
                hotkey: 'm',
              },
              {
                label: 'Custom Card',
                value: 'custom-card',
                indicator: <Text color="cyan">♥</Text>,
                hotkey: 'u',
              },
              {
                label: 'Card Stack',
                value: 'card-stack',
                indicator: <Text color="cyan">♦</Text>,
                hotkey: 's',
              },
              {
                label: 'Deck',
                value: 'deck',
                indicator: <Text color="cyan">🎴</Text>,
                hotkey: 'd',
              },
              {
                label: 'Grid',
                value: 'grid',
                indicator: <Text color="cyan">▦</Text>,
                hotkey: 'g',
              },
              {
                label: 'Exit',
                value: 'exit',
                indicator: <Text color="red">⏍</Text>,
                hotkey: 'x',
              },
            ]}
            onSelect={(item) => {
              if (item.value === 'exit') {
                exit()
              }

              setCurrentComponent(item.value as ComponentView)
            }}
          />
        </>
      ) : null}

      {currentComponent === 'card' && (
        <CardView goBack={() => setCurrentComponent(undefined)} />
      )}
      {currentComponent === 'mini-card' && (
        <MiniCardView goBack={() => setCurrentComponent(undefined)} />
      )}
      {currentComponent === 'card-stack' && (
        <CardStackView goBack={() => setCurrentComponent(undefined)} />
      )}
      {currentComponent === 'deck' && (
        <DeckView goBack={() => setCurrentComponent(undefined)} />
      )}
      {currentComponent === 'custom-card' && (
        <CustomCardView goBack={() => setCurrentComponent(undefined)} />
      )}
      {currentComponent === 'grid' && (
        <GridView goBack={() => setCurrentComponent(undefined)} />
      )}
    </Box>
  )
}

render(<Storybook />)
