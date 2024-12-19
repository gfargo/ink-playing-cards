import chalk from 'chalk'
import { Box, type BoxProps, Text } from 'ink'
import React from 'react'
import { useDeck } from '../../hooks/useDeck.js'
import { type CustomCardProps } from '../../types/index.js'

export function CustomCard({
  size = 'medium',
  width,
  height,
  asciiArt,
  title,
  description,
  symbols = [],
  borderColor = 'white',
  // BackgroundColor = 'black',
  textColor = 'white',
  faceUp = true,
}: CustomCardProps) {
  const { backArtwork } = useDeck()

  const cardWidth = width ?? getDefaultWidth(size)
  const cardHeight = height ?? getDefaultHeight(size)

  const cardStyle: BoxProps = {
    borderStyle: 'round',
    width: cardWidth,
    height: cardHeight,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor,
    // BackgroundColor,
  }

  if (!faceUp) {
    return (
      <Box {...cardStyle}>
        <Text>{String(backArtwork)}</Text>
      </Box>
    )
  }

  const renderCardContent = () => {
    const content = Array.from({ length: cardHeight }, () =>
      ' '.repeat(cardWidth)
    )

    // Paint ASCII art
    if (asciiArt) {
      const artLines = asciiArt.split('\n')
      for (const [index, line] of artLines.entries()) {
        if (index < cardHeight) {
          content[index] = line.padEnd(cardWidth).slice(0, cardWidth)
        }
      }
    }

    // Add title
    if (title) {
      content[0] = title.padEnd(cardWidth).slice(0, cardWidth)
    }

    // Add description
    if (description) {
      const wrappedDesc = wrapText(description, cardWidth)
      for (const [index, line] of wrappedDesc.entries()) {
        if (index + 2 < cardHeight) {
          content[index + 2] = line
        }
      }
    }

    // Add symbols
    for (const { char, position, color } of symbols) {
      const symbolColor = color
        ? (chalk as any)[color]
        : (chalk as any)[textColor]
      switch (position) {
        case 'top-left': {
          content[0] &&= `${symbolColor(char)} ${content[0].slice(1)}`
          break
        }

        case 'top-right': {
          content[0] &&= `${content[0].slice(0, -1)} ${symbolColor(char)}`
          break
        }

        case 'bottom-left': {
          const lastLine = content[cardHeight - 1] ?? ''
          content[cardHeight - 1] = `${symbolColor(char)} ${lastLine.slice(1)}`
          break
        }

        case 'bottom-right': {
          const lastLine = content[cardHeight - 1] ?? ''
          content[cardHeight - 1] = `${lastLine.slice(0, -1)} ${symbolColor(
            char
          )}`
          break
        }
      }
    }

    return content.map((line, index) => (
      <Text key={index} color={textColor}>
        {line}
      </Text>
    ))
  }

  return <Box {...cardStyle}>{renderCardContent()}</Box>
}

// Helper functions
const getDefaultWidth = (
  size: 'small' | 'medium' | 'large' | unknown
): number => {
  switch (size) {
    case 'small': {
      return 10
    }

    case 'medium': {
      return 15
    }

    case 'large': {
      return 20
    }

    default: {
      return 15
    }
  }
}

const getDefaultHeight = (
  size: 'small' | 'medium' | 'large' | unknown
): number => {
  switch (size) {
    case 'small': {
      return 5
    }

    case 'medium': {
      return 7
    }

    case 'large': {
      return 10
    }

    default: {
      return 7
    }
  }
}

const wrapText = (text: string, maxWidth: number): string[] => {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + word).length <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}
