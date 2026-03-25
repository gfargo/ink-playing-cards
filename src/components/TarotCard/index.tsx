import React from 'react'
import { CustomCard } from '../CustomCard/index.js'
import {
  type BaseCardProps,
  type CustomCardBack,
  type CustomCardSymbol,
} from '../../types/index.js'
import {
  MAJOR_ARCANA,
  MAJOR_ARCANA_ART,
  MINOR_COURT,
  MINOR_PIPS,
  TAROT_SUIT_ICONS,
} from './constants.js'

/**
 * Tarot suits for Minor Arcana cards.
 */
export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles'

/**
 * Minor Arcana values: Ace–10 plus court cards.
 */
export type TarotMinorValue =
  | 'Ace'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'Page'
  | 'Knight'
  | 'Queen'
  | 'King'

/**
 * Major Arcana index (0–21).
 */
export type MajorArcanaIndex =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21

/**
 * Props for a Major Arcana tarot card.
 */
export type TarotMajorProps = BaseCardProps & {
  arcana: 'major'
  /** Index 0–21 corresponding to The Fool through The World */
  majorIndex: MajorArcanaIndex
  /** Whether the card is reversed (upside-down reading) */
  reversed?: boolean
  /** Override the default ASCII art */
  asciiArt?: string
  /** Border color */
  borderColor?: string
  /** Text color */
  textColor?: string
  /** Art region color */
  artColor?: string
  /** Custom card back */
  back?: CustomCardBack
}

/**
 * Props for a Minor Arcana tarot card.
 */
export type TarotMinorProps = BaseCardProps & {
  arcana: 'minor'
  suit: TarotSuit
  value: TarotMinorValue
  /** Whether the card is reversed (upside-down reading) */
  reversed?: boolean
  /** Override the default ASCII art */
  asciiArt?: string
  /** Border color */
  borderColor?: string
  /** Text color */
  textColor?: string
  /** Art region color */
  artColor?: string
  /** Custom card back */
  back?: CustomCardBack
}

export type TarotCardProps = TarotMajorProps | TarotMinorProps

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
 * Builds the title and layout props for a Major Arcana card.
 */
function buildMajorProps(props: TarotMajorProps) {
  const entry = MAJOR_ARCANA[props.majorIndex]
  const { name } = entry
  const { numeral } = entry
  const art = props.asciiArt ?? MAJOR_ARCANA_ART[name] ?? ''

  const symbols: CustomCardSymbol[] = [
    { char: numeral, position: 'top-left', color: props.textColor ?? 'yellow' },
    {
      char: numeral,
      position: 'bottom-right',
      color: props.textColor ?? 'yellow',
    },
  ]

  return {
    title: name,
    typeLine: props.reversed ? '⟳ Reversed' : 'Major Arcana',
    asciiArt: art,
    footerLeft: numeral,
    symbols,
  }
}

/**
 * Builds the title and layout props for a Minor Arcana card.
 */
function buildMinorProps(props: TarotMinorProps) {
  const icon = TAROT_SUIT_ICONS[props.suit] ?? '?'
  const isCourt = (MINOR_COURT as readonly string[]).includes(props.value)
  const isPip = (MINOR_PIPS as readonly string[]).includes(props.value)
  const suitLabel = props.suit.charAt(0).toUpperCase() + props.suit.slice(1)

  let title: string
  if (isCourt) {
    title = `${props.value} of ${suitLabel}`
  } else if (isPip) {
    title =
      props.value === 'Ace'
        ? `Ace of ${suitLabel}`
        : `${props.value} of ${suitLabel}`
  } else {
    title = `${props.value} of ${suitLabel}`
  }

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
      footerRight={'footerRight' in layout ? layout.footerRight : undefined}
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
