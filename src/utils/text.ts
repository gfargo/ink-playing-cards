/**
 * Creates a string of spaces with the specified length
 * @param count - Number of spaces to create
 * @returns A string containing the specified number of spaces
 */
export const spaces = (count: number): string => ' '.repeat(Math.max(0, count))

/**
 * Centers text within a given width by adding spaces on both sides
 * @param text - The text to center
 * @param width - The total width to center within
 * @returns The centered text with padding spaces
 */
export const center = (text: string, width: number): string => {
  const padding = Math.max(0, width - 2 - text.length) / 2
  return spaces(Math.floor(padding)) + text + spaces(Math.ceil(padding))
}

/**
 * Left-aligns text within a given width by adding spaces to the right
 * @param text - The text to align
 * @param width - The total width to align within
 * @returns The left-aligned text with padding spaces
 */
export const left = (text: string, width: number): string => {
  return text + spaces(Math.max(0, width - 2 - text.length))
}

/**
 * Right-aligns text within a given width by adding spaces to the left
 * @param text - The text to align
 * @param width - The total width to align within
 * @returns The right-aligned text with padding spaces
 */
export const right = (text: string, width: number): string => {
  return spaces(Math.max(0, width - 2 - text.length)) + text
}