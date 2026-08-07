import { render } from 'ink-testing-library'
import React, { useContext } from 'react'
import test from 'ava'
import { Card } from '../components/Card/index.js'
import { MiniCard } from '../components/MiniCard/index.js'
import { UnicodeCard } from '../components/UnicodeCard/index.js'
import {
  ThemeContext,
  ThemeProvider,
  defaultTheme,
  useCardTheme,
} from './ThemeContext.js'

// eslint-disable-next-line no-control-regex
const ANSI_COLOR_RE = /\[3\d/

function Probe({ onTheme }: { readonly onTheme: (theme: unknown) => void }) {
  const theme = useCardTheme()
  onTheme(theme)
  return null
}

test('useCardTheme returns defaultTheme outside a provider', (t) => {
  let captured: unknown
  render(
    <Probe
      onTheme={(theme) => {
        captured = theme
      }}
    />
  )
  t.deepEqual(captured, defaultTheme)
})

test('useCardTheme returns the value supplied by ThemeProvider via useContext', (t) => {
  let captured: unknown
  function ContextProbe() {
    captured = useContext(ThemeContext)
    return null
  }

  render(
    <ThemeProvider theme={{ suitColors: { hearts: 'magenta' } }}>
      <ContextProbe />
    </ThemeProvider>
  )
  t.is((captured as typeof defaultTheme).suitColors.hearts, 'magenta')
})

test('ThemeProvider overrides suit color for Card', (t) => {
  const { lastFrame } = render(
    <ThemeProvider theme={{ suitColors: { hearts: 'magenta' } }}>
      <Card id="c1" suit="hearts" value="A" />
    </ThemeProvider>
  )
  t.snapshot(lastFrame())
})

test('ThemeProvider monochrome strips suit color from Card', (t) => {
  const { lastFrame } = render(
    <ThemeProvider monochrome>
      <Card id="c1" suit="hearts" value="A" />
    </ThemeProvider>
  )
  const frame = lastFrame()
  t.truthy(frame)
  t.notRegex(frame ?? '', ANSI_COLOR_RE)
})

test('ThemeProvider monochrome strips suit color from MiniCard', (t) => {
  const { lastFrame } = render(
    <ThemeProvider monochrome>
      <MiniCard id="c1" suit="clubs" value="Q" />
    </ThemeProvider>
  )
  const frame = lastFrame()
  t.truthy(frame)
  t.notRegex(frame ?? '', ANSI_COLOR_RE)
})

test('ThemeProvider monochrome strips suit color from UnicodeCard', (t) => {
  const { lastFrame } = render(
    <ThemeProvider monochrome>
      <UnicodeCard bordered suit="diamonds" value="K" />
    </ThemeProvider>
  )
  const frame = lastFrame()
  t.truthy(frame)
  t.notRegex(frame ?? '', ANSI_COLOR_RE)
})

test('without a provider, Card output is unaffected (no color stripped)', (t) => {
  const { lastFrame } = render(<Card id="c1" suit="hearts" value="A" />)
  const frame = lastFrame()
  t.truthy(frame)
  t.regex(frame ?? '', ANSI_COLOR_RE)
})

test('custom suitGlyphs change the glyph rendered by Card', (t) => {
  const { lastFrame } = render(
    <ThemeProvider theme={{ suitGlyphs: { hearts: 'H' } }}>
      <Card id="c1" suit="hearts" value="A" variant="minimal" />
    </ThemeProvider>
  )
  const frame = lastFrame()
  t.truthy(frame)
  t.true(frame?.includes('H'))
  t.false(frame?.includes('♥'))
})

test('custom suitGlyphs change the glyph rendered by MiniCard', (t) => {
  const { lastFrame } = render(
    <ThemeProvider theme={{ suitGlyphs: { spades: 'S' } }}>
      <MiniCard id="c1" suit="spades" value="7" />
    </ThemeProvider>
  )
  const frame = lastFrame()
  t.truthy(frame)
  t.true(frame?.includes('S'))
  t.false(frame?.includes('♠'))
})

test('borderStyle override changes the border characters', (t) => {
  const { lastFrame: roundFrame } = render(
    <Card id="c1" suit="hearts" value="A" variant="minimal" />
  )
  const { lastFrame: singleFrame } = render(
    <ThemeProvider theme={{ borderStyle: 'single' }}>
      <Card id="c1" suit="hearts" value="A" variant="minimal" />
    </ThemeProvider>
  )
  t.not(roundFrame(), singleFrame())
  t.true(singleFrame()?.includes('┌'))
})
