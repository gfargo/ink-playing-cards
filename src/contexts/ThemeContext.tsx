import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { SUIT_SYMBOL_MAP } from '../constants/card.js'
import { type CardTheme } from '../types/index.js'

/**
 * Default theme values. These reproduce today's hardcoded component output
 * exactly, so rendering without a `ThemeProvider` is unaffected.
 */
export const defaultTheme: CardTheme = {
  suitColors: {
    hearts: 'red',
    diamonds: 'red',
    clubs: 'white',
    spades: 'white',
  },
  suitGlyphs: { ...SUIT_SYMBOL_MAP },
  borderStyle: 'round',
  selectedBorderStyle: 'double',
  selectedColor: 'yellow',
  monochrome: false,
}

export const ThemeContext = createContext<CardTheme | undefined>(undefined)

export type ThemeProviderProps = {
  readonly children: ReactNode
  /**
   * Convenience flag equivalent to passing `theme={{ monochrome: true }}`.
   * Strips suit and border colors for accessibility / dumb-terminal support.
   */
  readonly monochrome?: boolean
  /**
   * Partial theme overrides, deep-merged onto `defaultTheme`.
   */
  readonly theme?: Partial<
    Omit<CardTheme, 'suitColors' | 'suitGlyphs'> & {
      suitColors: Partial<CardTheme['suitColors']>
      suitGlyphs: Partial<CardTheme['suitGlyphs']>
    }
  >
}

/**
 * Provides a global `CardTheme` (suit colors, suit glyphs, border style,
 * monochrome mode) to standard card components. Opt-in and additive — any
 * consumer not wrapped in a `ThemeProvider` falls back to `defaultTheme`.
 */
export function ThemeProvider({
  children,
  monochrome,
  theme,
}: ThemeProviderProps) {
  const value = useMemo<CardTheme>(
    () => ({
      ...defaultTheme,
      ...theme,
      suitColors: { ...defaultTheme.suitColors, ...theme?.suitColors },
      suitGlyphs: { ...defaultTheme.suitGlyphs, ...theme?.suitGlyphs },
      monochrome: monochrome ?? theme?.monochrome ?? defaultTheme.monochrome,
    }),
    [monochrome, theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Returns the current `CardTheme`. Falls back to `defaultTheme` when used
 * outside a `ThemeProvider`, mirroring how `Card` falls back on `DeckContext`.
 */
export function useCardTheme(): CardTheme {
  return useContext(ThemeContext) ?? defaultTheme
}
