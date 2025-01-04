import { Box, Text, useInput } from 'ink'
import React, { type FC, useEffect, useState } from 'react'

export type Item<V> = {
  key?: string
  label: string
  value: V
  hotkey?: string
  indicator?: React.ReactNode
  disabled?: boolean
}

type Properties<V> = {
  readonly items: Array<Item<V>>
  readonly isFocused?: boolean
  readonly initialIndex?: number
  readonly limit?: number
  readonly indicatorComponent?: FC<IndicatorProperties>
  readonly itemComponent?: FC<ItemProperties>
  readonly onSelect?: (item: Item<V>) => void
  readonly onHighlight?: (item: Item<V>) => void
  readonly orientation?: 'vertical' | 'horizontal'
}

type IndicatorProperties = {
  readonly isSelected: boolean
  // eslint-disable-next-line  react/no-unused-prop-types
  readonly item: Item<unknown>
}

type ItemProperties = {
  readonly isSelected: boolean
  readonly label: string
  readonly isDisabled: boolean
}

export function DefaultIndicatorComponent({ isSelected }: IndicatorProperties) {
  return (
    <Box marginRight={1}>
      <Text color={isSelected ? 'green' : undefined}>
        {isSelected ? '>' : ' '}
      </Text>
    </Box>
  )
}

function DefaultItemComponent({
  isSelected,
  label,
  isDisabled,
}: ItemProperties) {
  return (
    <Text
      color={isDisabled ? 'gray' : isSelected ? 'green' : undefined}
      dimColor={isDisabled}
    >
      {label}
    </Text>
  )
}

export function EnhancedSelectInput<V>({
  items,
  isFocused = true,
  initialIndex = 0,
  indicatorComponent = DefaultIndicatorComponent,
  itemComponent = DefaultItemComponent,
  limit,
  onSelect,
  onHighlight,
  orientation = 'vertical',
}: Properties<V>) {
  // eslint-disable-next-line react/hook-use-state
  const [, setRotateIndex] = useState(initialIndex)

  // Ensure initialIndex is within bounds
  const safeInitialIndex =
    items.length > 0 ? Math.min(initialIndex, items.length - 1) : 0
  const [selectedIndex, setSelectedIndex] = useState(safeInitialIndex)

  const filteredItems = items
  const visibleItems = limit ? filteredItems.slice(0, limit) : filteredItems
  const hasItems = visibleItems.length > 0

  useEffect(() => {
    if (hasItems) {
      const highlightedItem = visibleItems[selectedIndex]
      if (highlightedItem) {
        onHighlight?.(highlightedItem)
      }
    }
  }, [visibleItems, selectedIndex, onHighlight, hasItems])

  // Helper function to find next valid index
  const findNextValidIndex = (currentIndex: number, step: number): number => {
    if (!hasItems) return currentIndex

    let nextIndex = currentIndex
    const itemCount = visibleItems.length

    // Keep trying indices until we find a non-disabled item or complete a full loop
    for (let i = 0; i < itemCount; i++) {
      nextIndex = (nextIndex + step + itemCount) % itemCount
      if (!visibleItems[nextIndex]?.disabled) {
        return nextIndex
      }
    }

    // If all items are disabled, return the current index
    return currentIndex
  }

  useInput(
    (input, key) => {
      if (!isFocused || !hasItems) {
        return
      }

      let nextIndex = selectedIndex

      if (orientation === 'vertical') {
        if (key.upArrow || input === 'k') {
          nextIndex = findNextValidIndex(selectedIndex, -1)
        }

        if (key.downArrow || input === 'j') {
          nextIndex = findNextValidIndex(selectedIndex, 1)
        }
      } else {
        if (key.leftArrow || input === 'h') {
          nextIndex = findNextValidIndex(selectedIndex, -1)
        }

        if (key.rightArrow || input === 'l') {
          nextIndex = findNextValidIndex(selectedIndex, 1)
        }
      }

      if (nextIndex !== selectedIndex) {
        setSelectedIndex(nextIndex)
        if (limit) {
          setRotateIndex(Math.floor(nextIndex / limit) * limit)
        }
      }

      if (key.return) {
        const selectedItem = visibleItems[selectedIndex]
        if (selectedItem && !selectedItem.disabled) {
          onSelect?.(selectedItem)
        }
      }

      // Handle hotkey selection
      const hotkeyItem = visibleItems.find(
        (item) => item.hotkey === input && !item.disabled
      )
      if (hotkeyItem) {
        const hotkeyIndex = visibleItems.indexOf(hotkeyItem)
        setSelectedIndex(hotkeyIndex)
        onSelect?.(hotkeyItem)
      }
    },
    { isActive: isFocused }
  )

  // If no items, render empty box
  if (!hasItems) {
    return <Box />
  }

  const IndicatorComponent = indicatorComponent
  const ItemComponent = itemComponent

  return (
    <Box flexDirection="column">
      <Box
        flexDirection={orientation === 'vertical' ? 'column' : 'row'}
        gap={orientation === 'vertical' ? 0 : 2}
      >
        {visibleItems.map((item, index) => {
          const isSelected = index === selectedIndex

          return (
            <Box key={item.key ?? String(item.value)}>
              {item.indicator ? (
                <Box marginRight={1}>
                  <Text>{isSelected ? item.indicator : ' '}</Text>
                </Box>
              ) : (
                <IndicatorComponent isSelected={isSelected} item={item} />
              )}
              <ItemComponent
                isSelected={isSelected}
                label={item.label}
                isDisabled={Boolean(item.disabled)}
              />
              {item.hotkey && (
                <Text dimColor color="gray">
                  {' '}
                  ({item.hotkey})
                </Text>
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default EnhancedSelectInput
