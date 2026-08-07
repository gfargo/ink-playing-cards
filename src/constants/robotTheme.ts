import type { CardArtTheme } from '../types/cardArt.js'
import type { TSuit } from '../types/index.js'

// Frame templates for different card ranks
const FRAMES = {
  basic: {
    top: '┌─────┐',
    middle: '│{content}│',
    bottom: '└─────┘',
  },
  advanced: {
    top: '╔═════╗',
    middle: '║{content}║',
    bottom: '╚═════╝',
  },
  rounded: {
    top: '╭─────╮',
    middle: '│{content}│',
    bottom: '╰─────╯',
  },
}

// Suit-specific features
export const ROBOT_FEATURES: Record<
  TSuit,
  {
    eyes: string
    data: string
    circuit: string
    core: string
  }
> = {
  hearts: {
    eyes: '[0_0]',
    data: '▀1010▀',
    circuit: '╠═╣',
    core: '=|=',
  },
  diamonds: {
    eyes: '[<|>]',
    data: '▀0101▀',
    circuit: '╠<>╣',
    core: '<+>',
  },
  clubs: {
    eyes: '[+_+]',
    data: '▀1100▀',
    circuit: '╠[]╣',
    core: '[+]',
  },
  spades: {
    eyes: '[^_^]',
    data: '▀0011▀',
    circuit: '╠/\\╣',
    core: '/|\\',
  },
}

export const ROBOT_THEME: CardArtTheme = {
  A: {
    sections: [
      {
        type: 'frame',
        content: '{suit}',
        frame: FRAMES.basic,
        padding: 1,
      },
      {
        type: 'body',
        content: ['', '{data}', ''],
        padding: 2,
      },
      {
        type: 'frame',
        content: '{core}',
        frame: FRAMES.basic,
        padding: 1,
      },
    ],
  },

  K: {
    sections: [
      {
        type: 'frame',
        content: '{eyes}',
        frame: FRAMES.advanced,
        padding: 1,
      },
      {
        type: 'body',
        content: ['╠{circuit}╣', '║{suit}║', '╠{data}╣'],
        padding: 1,
      },
      {
        type: 'frame',
        content: '{core}',
        frame: FRAMES.advanced,
        padding: 1,
      },
    ],
  },

  Q: {
    sections: [
      {
        type: 'frame',
        content: '{eyes}',
        frame: FRAMES.rounded,
        padding: 1,
      },
      {
        type: 'body',
        content: ['├{circuit}┤', '│{suit}│', '├{data}┤'],
        padding: 0,
      },
      {
        type: 'frame',
        content: '{core}',
        frame: FRAMES.rounded,
        padding: 1,
      },
    ],
  },

  J: {
    sections: [
      {
        type: 'frame',
        content: '{eyes}',
        frame: FRAMES.basic,
        padding: 1,
      },
      {
        type: 'body',
        content: ['├{circuit}┤', '│{suit}│', '├{data}┤'],
        padding: 2,
      },
      {
        type: 'frame',
        content: '{core}',
        frame: FRAMES.basic,
        padding: 1,
      },
    ],
  },

  JOKER: {
    sections: [
      {
        type: 'frame',
        content: '{eyes}',
        frame: FRAMES.rounded,
        padding: 1,
      },
      {
        type: 'body',
        content: ['╬{circuit}╬', '║{suit}║', '╬{data}╬'],
        padding: 1,
      },
      {
        type: 'frame',
        content: '{core}',
        frame: FRAMES.rounded,
        padding: 1,
      },
    ],
  },
}
