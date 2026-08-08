import { useInput } from 'ink'
import { useEffect, useState } from 'react'

export type UseCardCursorOptions<T> = {
  readonly orientation?: 'horizontal' | 'vertical'
  readonly wrap?: boolean
  readonly isFocused?: boolean
  readonly initialIndex?: number
  readonly onSelect?: (card: T, index: number) => void
  readonly onHighlight?: (card: T, index: number) => void
}

export type UseCardCursorResult<T> = {
  cursor: number
  selectedCard: T | undefined
  moveCursor: (step: number) => void
  setCursor: (index: number) => void
  isFocused: boolean
}

const clampIndex = (index: number, length: number): number => {
  if (length === 0) return 0
  return Math.min(Math.max(index, 0), length - 1)
}

/**
 * Centralizes cursor movement, bounds checking, and keyboard wiring for a
 * list of cards. Standalone UI hook — does not require a DeckProvider.
 */
export function useCardCursor<T extends { id: string }>(
  cards: T[],
  options: UseCardCursorOptions<T> = {}
): UseCardCursorResult<T> {
  const {
    orientation = 'horizontal',
    wrap = false,
    isFocused = true,
    initialIndex = 0,
    onSelect,
    onHighlight,
  } = options

  const [cursor, setCursor] = useState<number>(() =>
    clampIndex(initialIndex, cards.length)
  )

  useEffect(() => {
    setCursor((current) => clampIndex(current, cards.length))
  }, [cards.length])

  const setCursorClamped = (index: number) => {
    setCursor(clampIndex(index, cards.length))
  }

  const moveCursor = (step: number) => {
    if (cards.length === 0) return
    setCursor((current) => {
      const next = current + step
      return wrap
        ? ((next % cards.length) + cards.length) % cards.length
        : clampIndex(next, cards.length)
    })
  }

  useEffect(() => {
    const card = cards[cursor]
    if (card) {
      onHighlight?.(card, cursor)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, cards[cursor]?.id])

  useInput(
    (input, key) => {
      if (!isFocused || cards.length === 0) return

      if (orientation === 'horizontal') {
        if (key.leftArrow || input === 'h') moveCursor(-1)
        if (key.rightArrow || input === 'l') moveCursor(1)
      } else {
        if (key.upArrow || input === 'k') moveCursor(-1)
        if (key.downArrow || input === 'j') moveCursor(1)
      }

      if (key.return) {
        const card = cards[cursor]
        if (card) onSelect?.(card, cursor)
      }
    },
    { isActive: isFocused }
  )

  return {
    cursor,
    selectedCard: cards[cursor],
    moveCursor,
    setCursor: setCursorClamped,
    isFocused,
  }
}

export default useCardCursor
