import React from 'react'
import { CustomCard } from '../CustomCard/index.js'
import {
  type CustomCardBack,
  type CustomCardSymbol,
  type TarotCardProps,
  type TarotMajorProps,
  type TarotMinorProps,
} from '../../types/index.js'
import {
  MAJOR_ARCANA,
  MAJOR_ARCANA_ART,
  MINOR_COURT,
  TAROT_SUIT_ICONS,
} from './constants.js'

export {
  type MajorArcanaIndex,
  type TarotCardProps,
  type TarotMajorProps,
  type TarotMinorProps,
  type TarotMinorValue,
  type TarotSuit,
} from '../../types/index.js'

/** Default tarot card back design. */
const TAROT_BACK: CustomCardBack = {
  art: [
    '  ╔═══════════╗  ',
    '  ║ ☆ ☾ ☆ ☾ ☆ ║  ',
    '  ║ ☾ ★ ☾ ★ ☾ ║  ',
    '  ║ ☆ ☾ ☆ ☾ ☆ ║  ',
    '  ║ ☾ ★ ☾ ★ ☾ ║  ',
    '  ║ ☆ ☾ ☆ ☾ ☆ ║  ',
    '  ╚═══════════╝  ',
  ].join('\n'),
  color: 'magenta',
}

/**
 * Shared shape for the layout props returned by both builder functions.
 * footerLeft/footerRight are optional — Major Arcana omits them.
 */
type TarotLayoutProps = {
  title: string
  typeLine: string
  asciiArt: string
  symbols: CustomCardSymbol[]
  footerLeft?: string
  footerRight?: string
}

/**
 * Builds the title and layout props for a Major Arcana card.
 */
function buildMajorProps(props: TarotMajorProps): TarotLayoutProps {
  const entry = MAJOR_ARCANA[props.majorIndex]
  const { name } = entry
  const { numeral } = entry
  const art = props.asciiArt ?? MAJOR_ARCANA_ART[name] ?? ''

  // Route the numeral to footerLeft so it appears once, bottom-anchored.
  // No corner symbols: avoids duplication and the dedicated full-width symbol row.
  return {
    title: name,
    typeLine: props.reversed ? '⟳ Reversed' : 'Major Arcana',
    asciiArt: art,
    footerLeft: numeral,
    symbols: [],
  }
}

/**
 * Builds the title and layout props for a Minor Arcana card.
 */
function buildMinorProps(props: TarotMinorProps): TarotLayoutProps {
  const icon = TAROT_SUIT_ICONS[props.suit] ?? '?'
  const isCourt = (MINOR_COURT as readonly string[]).includes(props.value)
  const suitLabel = props.suit.charAt(0).toUpperCase() + props.suit.slice(1)

  const title = `${props.value} of ${suitLabel}`

  // Generate pip art for numbered cards
  let art = props.asciiArt ?? ''
  if (!art && !isCourt) {
    const count = props.value === 'Ace' ? 1 : Number(props.value) || 1
    const row = Array.from({ length: Math.min(count, 5) }, () => icon).join(' ')
    const lines =
      count > 5
        ? [row, Array.from({ length: count - 5 }, () => icon).join(' ')]
        : [row]
    art = lines.join('\n')
  }

  if (!art && isCourt) {
    art = `  ${icon} ${props.value.charAt(0)} ${icon}  `
  }

  const symbols: CustomCardSymbol[] = [
    { char: icon, position: 'top-left', color: props.textColor ?? 'cyan' },
    { char: icon, position: 'bottom-right', color: props.textColor ?? 'cyan' },
  ]

  return {
    title,
    typeLine: props.reversed ? `⟳ Reversed` : `Minor Arcana`,
    asciiArt: art,
    footerLeft: icon,
    footerRight: suitLabel,
    symbols,
  }
}

/**
 * TarotCard renders a tarot card (Major or Minor Arcana) using the CustomCard layout.
 *
 * Major Arcana (0–21): Provide `arcana="major"` and `majorIndex`.
 * Minor Arcana: Provide `arcana="minor"`, `suit`, and `value`.
 *
 * Supports reversed orientation, custom art overrides, and all BaseCardProps
 * (faceUp, selected, rounded, effects).
 *
 * @example
 * // The Fool (Major Arcana)
 * <TarotCard id="fool" arcana="major" majorIndex={0} />
 *
 * @example
 * // Queen of Cups (Minor Arcana, reversed)
 * <TarotCard id="qc" arcana="minor" suit="cups" value="Queen" reversed />
 */
export function TarotCard(props: TarotCardProps) {
  const isMajor = props.arcana === 'major'
  const layout = isMajor ? buildMajorProps(props) : buildMinorProps(props)

  const defaultBorder = isMajor ? 'yellow' : 'cyan'
  const defaultText = isMajor ? 'yellow' : 'white'

  return (
    <CustomCard
      id={props.id}
      size="large"
      width={20}
      height={13}
      title={layout.title}
      typeLine={layout.typeLine}
      asciiArt={layout.asciiArt}
      footerLeft={layout.footerLeft}
      footerRight={layout.footerRight}
      symbols={layout.symbols}
      borderColor={props.borderColor ?? defaultBorder}
      textColor={props.textColor ?? defaultText}
      artColor={props.artColor ?? (isMajor ? 'magenta' : 'cyan')}
      faceUp={props.faceUp}
      selected={props.selected}
      rounded={props.rounded}
      back={props.back ?? TAROT_BACK}
      effects={props.effects}
    />
  )
}

export default TarotCard
