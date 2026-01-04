// Category menu component - left panel category list
import React from 'react'
import { Box, Text } from 'ink'

interface Category {
  key: string
  label: string
  count: number
}

interface CategoryMenuProps {
  categories: Category[]
  selected: number
  focused: boolean
}

export function CategoryMenu({ categories, selected, focused }: CategoryMenuProps) {
  return (
    <Box flexDirection="column">
      <Text bold underline>CATEGORIES</Text>
      <Box marginTop={1} flexDirection="column">
        {categories.map((cat, i) => {
          const isSelected = i === selected
          const prefix = isSelected ? (focused ? '▸ ' : '› ') : '  '
          const color = isSelected ? (focused ? 'cyan' : 'white') : 'gray'

          return (
            <Text key={cat.key} color={color}>
              {prefix}{cat.label}
              <Text dimColor> {cat.count}</Text>
            </Text>
          )
        })}
      </Box>
    </Box>
  )
}
