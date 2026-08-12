import { center, displayWidth, left, right, spaces } from './text.js'

export type Alignment = 'left' | 'center' | 'right'
export type Padding = { left?: number; right?: number }
export type SideFrame = { left: string; right: string }

/**
 * Formats a line of ASCII art with precise control over spacing.
 * Always returns a string exactly `width` display columns wide:
 * `frameWidth + paddingWidth + contentWidth === width`.
 */
export function formatLine(
  content: string,
  width: number,
  options: {
    align?: Alignment
    padding?: Padding
    frame?: SideFrame
  } = {}
): string {
  const { align = 'left', padding = {}, frame } = options
  const { left: leftPad = 0, right: rightPad = 0 } = padding

  // Calculate available width for content
  const frameWidth =
    (frame ? displayWidth(frame.left) : 0) +
    (frame ? displayWidth(frame.right) : 0)
  const paddingWidth = leftPad + rightPad
  const contentWidth = width - frameWidth - paddingWidth

  // Align content within the space left after frame and padding are reserved
  let result: string
  if (align === 'center') {
    result = center(content, contentWidth)
  } else if (align === 'right') {
    result = right(content, contentWidth)
  } else {
    result = left(content, contentWidth)
  }

  // Add padding around the aligned content
  result = spaces(leftPad) + result + spaces(rightPad)

  // Add frame if provided
  if (frame) {
    result = frame.left + result + frame.right
  }

  return result
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

export type BoxFrame = {
  top: string
  middle: string
  bottom: string
}

/**
 * Creates a framed section with centered content. Every returned line is
 * exactly `width` display columns wide.
 */
export function createFramedSection(
  content: string[],
  width: number,
  frame: BoxFrame
): string[] {
  const result: string[] = []

  // Add top frame
  result.push(center(frame.top, width))

  // Add content with middle frame
  for (const line of content) {
    let [left, right] = frame.middle.split('{content}')

    left ||= ' '
    right ||= ' '

    result.push(
      formatLine(line, width, {
        align: 'center',
        frame: { left, right },
      })
    )
  }

  // Add bottom frame
  result.push(center(frame.bottom, width))

  return result
}

/**
 * Creates a body section with proper spacing. `padding` is the number of
 * blank columns left on each side; every returned line is exactly `width`
 * display columns wide.
 */
export function createBodySection(
  content: string[],
  width: number,
  padding: number
): string[] {
  return content.map((line) =>
    formatLine(line, width, {
      align: 'center',
      padding: { left: padding, right: padding },
    })
  )
}
