// Item list component - shows items in selected category with scrolling
import React from 'react'
import { Box, Text } from 'ink'

interface Item {
  name: string
  source?: string
}

interface ItemListProps {
  items: Item[]
  selected: number
  focused: boolean
  maxHeight?: number
}

export function ItemList({ items, selected, focused, maxHeight = 15 }: ItemListProps) {
  if (items.length === 0) {
    return (
      <Box flexDirection="column">
        <Text bold underline>ITEMS</Text>
        <Box marginTop={1}>
          <Text dimColor italic>No items</Text>
        </Box>
      </Box>
    )
  }

  // Calculate visible items based on available height (subtract 3 for header + margins + scroll indicators)
  const maxVisible = Math.max(5, maxHeight - 3)
  const start = Math.max(0, Math.min(selected - Math.floor(maxVisible / 2), items.length - maxVisible))
  const visible = items.slice(start, start + maxVisible)

  return (
    <Box flexDirection="column">
      <Text bold underline>ITEMS ({items.length})</Text>
      <Box marginTop={1} flexDirection="column">
        {start > 0 && <Text dimColor>↑ {start} more</Text>}
        {visible.map((item, i) => {
          const actualIndex = start + i
          const isSelected = actualIndex === selected
          const prefix = isSelected ? (focused ? '▸ ' : '› ') : '  '
          const color = isSelected ? (focused ? 'cyan' : 'white') : 'gray'

          // Truncate name to fit panel width (24 chars max)
          const name = item.name.length > 24 ? item.name.slice(0, 21) + '...' : item.name

          return (
            <Text key={`${item.name}-${actualIndex}`} color={color}>
              {prefix}{name}
            </Text>
          )
        })}
        {start + maxVisible < items.length && (
          <Text dimColor>↓ {items.length - start - maxVisible} more</Text>
        )}
      </Box>
    </Box>
  )
}
