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
}

export function ItemList({ items, selected, focused }: ItemListProps) {
  if (items.length === 0) {
    return (
      <Box flexDirection="column">
        <Text bold underline>ITEMS</Text>
        <Text dimColor italic>No items</Text>
      </Box>
    )
  }

  // Show max 10 items with scroll indicator
  const maxVisible = 10
  const start = Math.max(0, Math.min(selected - Math.floor(maxVisible / 2), items.length - maxVisible))
  const visible = items.slice(start, start + maxVisible)

  return (
    <Box flexDirection="column">
      <Text bold underline>ITEMS</Text>
      {start > 0 && <Text dimColor>  ↑ {start} more</Text>}
      {visible.map((item, i) => {
        const actualIndex = start + i
        const isSelected = actualIndex === selected
        const prefix = isSelected ? (focused ? '▸ ' : '› ') : '  '
        const color = isSelected ? (focused ? 'cyan' : 'white') : 'gray'

        // Truncate name to fit
        const name = item.name.length > 20 ? item.name.slice(0, 17) + '...' : item.name
        const source = item.source ?? ''

        return (
          <Text key={`${item.name}-${actualIndex}`} color={color}>
            {prefix}{name.padEnd(20)} <Text dimColor>{source}</Text>
          </Text>
        )
      })}
      {start + maxVisible < items.length && (
        <Text dimColor>  ↓ {items.length - start - maxVisible} more</Text>
      )}
    </Box>
  )
}
