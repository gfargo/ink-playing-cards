import type { Alignment, Padding } from '../utils/layout.js'

export type CardSection = {
  type: 'frame' | 'body'
  content: string | string[]
  align?: Alignment
  padding?: number | Padding
  frame?: {
    top: string
    middle: string
    bottom: string
  }
}

export type CardArtDefinition = {
  sections: CardSection[]
  replacements: Record<string, string>
}

export type CardArtTheme = Partial<Record<string, CardArtDefinition>>