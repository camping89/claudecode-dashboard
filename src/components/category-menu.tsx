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

          if (isSelected && focused) {
            return (
              <Text key={cat.key} bold underline>
                {'▸ '}{cat.label} <Text bold>{cat.count}</Text>
              </Text>
            )
          } else if (isSelected) {
            return (
              <Text key={cat.key} bold>
                {'› '}{cat.label} <Text dimColor>{cat.count}</Text>
              </Text>
            )
          } else {
            return (
              <Text key={cat.key} dimColor>
                {'  '}{cat.label} <Text dimColor>{cat.count}</Text>
              </Text>
            )
          }
        })}
      </Box>
    </Box>
  )
}
