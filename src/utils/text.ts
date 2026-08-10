import stringWidth from 'string-width'

/**
 * Creates a string of spaces with the specified length
 * @param count - Number of spaces to create
 * @returns A string containing the specified number of spaces
 */
export const spaces = (count: number, character = ' '): string =>
  character.repeat(Math.max(0, count))

/**
 * Centers text within a given width by adding spaces on both sides
 * @param text - The text to center
 * @param width - The total width to center within
 * @returns The centered text with padding spaces
 */
export const center = (
  text: string,
  width: number,
  paddingCharacter?: string
): string => {
  const padding = Math.max(0, width - displayWidth(text)) / 2
  return (
    spaces(Math.floor(padding), paddingCharacter) +
    text +
    spaces(Math.ceil(padding), paddingCharacter)
  )
}

/**
 * Left-aligns text within a given width by adding spaces to the right
 * @param text - The text to align
 * @param width - The total width to align within
 * @returns The left-aligned text with padding spaces
 */
export const left = (text: string, width: number): string => {
  return text + spaces(Math.max(0, width - displayWidth(text)))
}

/**
 * Right-aligns text within a given width by adding spaces to the left
 * @param text - The text to align
 * @param width - The total width to align within
 * @returns The right-aligned text with padding spaces
 */
export const right = (text: string, width: number): string => {
  return spaces(Math.max(0, width - displayWidth(text))) + text
}

/**
 * Returns the display width of a string in terminal columns via `string-width`,
 * which accounts for wide CJK/emoji glyphs (2 columns), combining marks and
 * ANSI escape sequences (0 columns), and ordinary code points (1 column).
 */
export const displayWidth = (s: string): number => stringWidth(s)

/**
 * Truncates a string to fit within `width` display columns without splitting
 * a wide (2-column) code point in half. Falls back to dropping the last code
 * point that would overflow the budget.
 * @param text - The text to truncate
 * @param width - The maximum display width, in terminal columns
 * @returns The truncated text, whose display width is `<= width`
 */
export const truncate = (text: string, width: number): string => {
  if (width <= 0) return ''
  if (displayWidth(text) <= width) return text

  let result = ''
  let used = 0
  for (const character of text) {
    const characterWidth = displayWidth(character)
    if (used + characterWidth > width) break
    result += character
    used += characterWidth
  }

  return result
}

/**
 * Builds a block of innerHeight rows, each innerWidth wide, with the
 * (truncated) label horizontally + vertically centred and the rest filled
 * with spaces. Used by minimal card faces and minimal card backs.
 * @param label - The label text to centre (sliced to innerWidth if longer)
 * @param innerWidth - The width of the inner content area (excluding borders)
 * @param innerHeight - The height of the inner content area (excluding borders)
 * @returns A newline-joined string of innerHeight rows
 */
export const centerLabelBlock = (
  label: string,
  innerWidth: number,
  innerHeight: number
): string => {
  const clipped = truncate(label, innerWidth)
  const clippedWidth = displayWidth(clipped)
  const leftPadding = Math.floor((innerWidth - clippedWidth) / 2)
  const rightPadding = innerWidth - clippedWidth - leftPadding
  const labelLine = spaces(leftPadding) + clipped + spaces(rightPadding)
  const verticalCenter = Math.floor(innerHeight / 2)
  return Array.from({ length: innerHeight }, (_, index) =>
    index === verticalCenter ? labelLine : spaces(innerWidth)
  ).join('\n')
}

/**
 * Applies a map of named replacements to a string.
 * Each key `k` in the map replaces every occurrence of the literal token `{k}`.
 * Uses plain-string replaceAll (no regex) so keys never need escaping.
 * @param text - The template string containing `{key}` tokens
 * @param replacements - Map of key → replacement value
 * @returns The string with all tokens replaced
 */
export const applyReplacements = (
  text: string,
  replacements: Record<string, string>
): string => {
  let result = text
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replaceAll('{' + key + '}', value)
  }

  return result
}
