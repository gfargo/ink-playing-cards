import type { CardArtDefinition, CardSection } from '../types/cardArt.js'
import {
  createBodySection,
  createFramedSection,
  padReplacement,
} from './layout.js'
import { center } from './text.js'

/**
 * Applies replacements to a string using a replacement map
 */
function applyReplacements(
  text: string,
  replacements: Record<string, string>
): string {
  let result = text
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  }
  return result
}

/**
 * Renders a section of card art
 */
function renderSection(
  section: CardSection,
  width: number,
  replacements: Record<string, string>
): string[] {
  const content = Array.isArray(section.content)
    ? section.content
    : [section.content]

  // Apply replacements to content
  const processedContent = content.map((line) =>
    applyReplacements(line, replacements)
  )

  console.log({ section, processedContent })

  if (section.type === 'frame' && section.frame) {
    const sectionPadding = section?.padding
      ? typeof section.padding === 'number'
        ? section.padding * 2
        : (section.padding?.left ?? 0) + (section.padding?.right ?? 0)
      : 0

    console.log({ sectionPadding })

    const parsedTopFrame = applyReplacements(section.frame.top, replacements)
    const parsedTRCorner = parsedTopFrame.slice(-1)
    const parsedTLCorner = parsedTopFrame.slice(0, 1)

    const parsedBottomFrame = applyReplacements(
      section.frame.bottom,
      replacements
    )
    const parsedBRCorner = parsedBottomFrame.slice(-1)
    const parsedBLCorner = parsedBottomFrame.slice(0, 1)

    const middleFrame = section.frame.middle

    console.log({
      parsedTopFrame,
      parsedTRCorner,
      parsedTLCorner,
      parsedBottomFrame,
      parsedBRCorner,
      parsedBLCorner,
      topSpacer: parsedTopFrame.slice(1, 2),
      sideSpacer: middleFrame.slice(0,1),
      sideSpacerLength: middleFrame.slice(0,1).length,
    })

    return createFramedSection(
      processedContent,
      width - 2 - sectionPadding,
      {
        top: `${parsedTLCorner}${center(
          parsedTopFrame.slice(1, -1),
          middleFrame.length - 2,
          parsedTopFrame.slice(1, 2)
        )}${parsedTRCorner}`,
        middle: middleFrame,
        bottom: `${parsedBLCorner}${center(
          parsedBottomFrame.slice(1, -1),
          middleFrame.length - 2,
          parsedBottomFrame.slice(1, 2)
        )}${parsedBRCorner}`,
      }
    )
  }

  // For body sections
  const padding =
    typeof section.padding === 'number'
      ? section.padding
      : section.padding?.left ?? 0

  console.log({ type: section.type, padding, processedContent, width })

  return createBodySection(processedContent, width, padding)
}

/**
 * Renders a complete card art definition
 */
export function renderCardArt(
  definition: CardArtDefinition,
  width: number,
  dynamicReplacements: Record<string, string>
): string[] {
  // Merge static and dynamic replacements
  const replacements = {
    ...definition.replacements,
    ...dynamicReplacements,
  }

  console.log({ definition, width })

  // Render each section
  return definition.sections
    .flatMap((section) => renderSection(section, width, replacements))
    .map((line) => padReplacement(line, width, 'center'))
}
