import { Box, type BoxProps, Text } from 'ink'
import React from 'react'
import { useDeck } from '../../hooks/useDeck.js'
import { type CustomCardProps } from '../../types/index.js'
import chalk from 'chalk'

export function CustomCard({
  size = 'medium',
  width,
  height,
  asciiArt,
  title,
  description,
  symbols = [],
  borderColor = 'white',
  backgroundColor = 'black',
  textColor = 'white',
  onClick,
  faceUp = true,
}: CustomCardProps) {
  const { backArtwork } = useDeck()

  const cardWidth = width || getDefaultWidth(size)
  const cardHeight = height || getDefaultHeight(size)

  const cardStyle: BoxProps = {
    borderStyle: 'round',
    width: cardWidth,
    height: cardHeight,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor,
    backgroundColor,
  }

  if (!faceUp) {
    return (
      <Box {...cardStyle}>
        <Text>{String(backArtwork)}</Text>
      </Box>
    )
  }

  const renderCardContent = () => {
    let content = new Array(cardHeight).fill(' '.repeat(cardWidth))

    // Paint ASCII art
    if (asciiArt) {
      const artLines = asciiArt.split('\n')
      artLines.forEach((line, index) => {
        if (index < cardHeight) {
          content[index] = line.padEnd(cardWidth).slice(0, cardWidth)
        }
      })
    }

    // Add title
    if (title) {
      content[0] = title.padEnd(cardWidth).slice(0, cardWidth)
    }

    // Add description
    if (description) {
      const wrappedDesc = wrapText(description, cardWidth)
      wrappedDesc.forEach((line, index) => {
        if (index + 2 < cardHeight) {
          content[index + 2] = line
        }
      })
    }

    // Add symbols
    symbols.forEach(({ char, position, color }) => {
      const symbolColor = color ? chalk[color] : chalk[textColor]
      switch (position) {
        case 'top-left':
          content[0] = symbolColor(char) + content[0].slice(1)
          break
        case 'top-right':
          content[0] = content[0].slice(0, -1) + symbolColor(char)
          break
        case 'bottom-left':
          content[cardHeight - 1] = symbolColor(char) + content[cardHeight - 1].slice(1)
          break
        case 'bottom-right':
          content[cardHeight - 1] = content[cardHeight - 1].slice(0, -1) + symbolColor(char)
          break
      }
    })

    return content.map((line, index) => (
      <Text key={index} color={textColor}>
        {line}
      </Text>
    ))
  }

  return (
    <Box {...cardStyle} onClick={onClick}>
      {renderCardContent()}
    </Box>
  )
}

// Helper functions
const getDefaultWidth = (size: 'small' | 'medium' | 'large'): number => {
  switch (size) {
    case 'small':
      return 10
    case 'medium':
      return 15
    case 'large':
      return 20
    default:
      return 15
  }
}

const getDefaultHeight = (size: 'small' | 'medium' | 'large'): number => {
  switch (size) {
    case 'small':
      return 5
    case 'medium':
      return 7
    case 'large':
      return 10
    default:
      return 7
  }
}

const wrapText = (text: string, maxWidth: number): string[] => {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach(word => {
    if ((currentLine + word).length <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}
