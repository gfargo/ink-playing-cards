import { center, left, right, spaces } from './text.js';

export type Alignment = 'left' | 'center' | 'right'
export type Padding = { left?: number; right?: number }
export type Frame = { left: string; right: string }

/**
 * Formats a line of ASCII art with precise control over spacing
 */
export function formatLine(
  content: string,
  width: number,
  options: {
    align?: Alignment
    padding?: Padding
    frame?: Frame
  } = {}
): string {
  const { align = 'left', padding = {}, frame } = options
  const { left: leftPad = 0, right: rightPad = 0 } = padding

  // Calculate available width for content
  const frameWidth = (frame?.left.length ?? 0) + (frame?.right.length ?? 0)
  const paddingWidth = leftPad + rightPad
  const contentWidth = width - frameWidth - paddingWidth

  // Add padding
  let result = spaces(leftPad) + content + spaces(rightPad)

  // Align within available space
  if (align === 'center') {
    result = center(result, contentWidth)
  } else if (align === 'right') {
    result = right(result, contentWidth)
  } else {
    result = left(result, contentWidth)
  }

  // Add frame if provided
  if (frame) {
    result = frame.left + result + frame.right
  }

  return result
}

/**
 * Centers content within a frame/border
 */
export function centerInFrame(
  content: string,
  width: number,
  frame: Frame
): string {
  return formatLine(content, width, {
    align: 'center',
    frame
  })
}

/**
 * Pads a replacement value to match a specific width
 */
export function padReplacement(
  value: string,
  targetWidth: number,
  align: Alignment = 'center'
): string {
  return formatLine(value, targetWidth, { align })
}

/**
 * Creates a framed section with centered content
 */
export function createFramedSection(
  content: string[],
  width: number,
  frame: {
    top: string
    middle: string
    bottom: string
  }
): string[] {
  const result: string[] = []
  
  // Add top frame
  result.push(center(frame.top, width))
  
  // Add content with middle frame
  content.forEach(line => {
    let [left, right] = frame.middle.split('{content}')

    if (!left) {
      left = ' '
    }
    if (!right) {
      right = ' '
    }

    const newLine = formatLine(line, width, {
      align: 'center',
      frame: { left, right }
    })
    result.push(center(newLine, width))
  })
  
  // Add bottom frame
  result.push(center(frame.bottom, width))
  
  return result
}

/**
 * Creates a body section with proper spacing
 */
export function createBodySection(
  content: string[],
  width: number,
  padding: number
): string[] {
  return content.map(line =>
    padReplacement(line, width - padding * 2, 'center')
  )
}